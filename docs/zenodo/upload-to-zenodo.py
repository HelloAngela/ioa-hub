"""Upload IOA Commons resources to Zenodo through the REST API.

Reads the records in records.json (same folder), then for each one:
  1. creates a draft (or reuses an unpublished draft with the same title),
  2. uploads its files,
  3. sets the metadata,
  4. publishes it, only if you add --publish.

It uses the Zenodo SANDBOX (https://sandbox.zenodo.org) unless you add --live.
Sandbox records are for testing only: they get fake DOIs and are wiped from time to time.

Needs only Python 3 (no extra packages).

Token: create a personal access token with the scopes "deposit:write" and
"deposit:actions" (Zenodo > Account > Applications > Personal access tokens).
The sandbox and the live site need separate accounts and separate tokens.
Set it for this PowerShell window only, never in a file in this repository:
    $env:ZENODO_SANDBOX_TOKEN = "paste-token-here"   # for the sandbox
    $env:ZENODO_TOKEN = "paste-token-here"           # for the live site
Or put the lines ZENODO_TOKEN=... and ZENODO_SANDBOX_TOKEN=... in a file named .env
in the ioa-hub folder (.gitignore keeps it out of GitHub).
If neither is set, the script asks for the token (typing is hidden).

Examples (run from the ioa-hub folder):
    # 1. Sandbox test: create drafts and upload files, do not publish
    python docs/zenodo/upload-to-zenodo.py --folder "E:\\path\\to\\ioa hub"
    # 2. Sandbox test of publishing
    python docs/zenodo/upload-to-zenodo.py --folder "E:\\path\\to\\ioa hub" --publish
    # 3. Live: create drafts on zenodo.org, check them in the browser
    python docs/zenodo/upload-to-zenodo.py --folder "E:\\path\\to\\ioa hub" --live
    # 4. Live: publish (asks you to type PUBLISH first; cannot be undone)
    python docs/zenodo/upload-to-zenodo.py --folder "E:\\path\\to\\ioa hub" --live --publish
"""

import argparse
import getpass
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

HOSTS = {
    "sandbox": "https://sandbox.zenodo.org",
    "live": "https://zenodo.org",
}
TOKEN_VARS = {
    "sandbox": "ZENODO_SANDBOX_TOKEN",
    "live": "ZENODO_TOKEN",
}


class ZenodoError(Exception):
    pass


def load_dotenv(path):
    """Read KEY=value lines from a .env file (git-ignored) without overriding set variables."""
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def request(method, url, token, data=None, body=None, content_type="application/json"):
    """Send one request to Zenodo and return the decoded JSON reply (or None)."""
    if data is not None:
        body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/json")
    if body is not None:
        req.add_header("Content-Type", content_type)
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            text = resp.read().decode("utf-8")
    except urllib.error.HTTPError as err:
        detail = err.read().decode("utf-8", errors="replace")
        if err.code in (401, 403):
            detail += (" -- Check the token: it must be for this site (sandbox and live tokens differ)"
                       " and have the deposit:write and deposit:actions scopes.")
        raise ZenodoError(f"{method} {url} failed ({err.code}): {detail}") from None
    except urllib.error.URLError as err:
        raise ZenodoError(f"Could not reach {url}: {err.reason}") from None
    return json.loads(text) if text.strip() else None


def find_existing(api, token, title):
    """Return (drafts, published) depositions in this account with exactly this title."""
    deps = []
    for page in range(1, 11):  # up to 250 depositions, 25 per page
        url = f"{api}/deposit/depositions?size=25&page={page}&sort=mostrecent"
        batch = request("GET", url, token) or []
        deps.extend(batch)
        if len(batch) < 25:
            break
    same = [d for d in deps if (d.get("title") or d.get("metadata", {}).get("title")) == title]
    drafts = [d for d in same if not d.get("submitted")]
    published = [d for d in same if d.get("submitted")]
    return drafts, published


def upload_record(api, token, record, folder, community, publish):
    meta = dict(record["metadata"])
    title = meta["title"]
    print(f"\n=== {title}")

    files = []
    for name in record["files"]:
        path = folder / name
        if path.is_file():
            files.append(path)
        else:
            print(f"    Missing file: {path}")
    if not files:
        raise ZenodoError("None of this record's files were found. Nothing uploaded.")

    drafts, published = find_existing(api, token, title)
    if published:
        print(f"    Already published: {published[0]['links'].get('html')}. Skipped.")
        print("    To change a published record, make a new version on the Zenodo website.")
        return None
    if drafts:
        # The list leaves out some links (such as the file bucket), so fetch the full draft.
        dep = request("GET", f"{api}/deposit/depositions/{drafts[0]['id']}", token)
        print(f"    Reusing the unpublished draft {dep['id']}.")
    else:
        dep = request("POST", f"{api}/deposit/depositions", token, data={})
        print(f"    Created draft {dep['id']}.")

    dep_id = dep["id"]
    bucket = dep["links"]["bucket"]

    # Upload files (a file with the same name replaces the earlier copy in the draft).
    for path in files:
        size_mb = path.stat().st_size / 1_000_000
        print(f"    Uploading {path.name} ({size_mb:.2f} MB)")
        request(
            "PUT",
            f"{bucket}/{urllib.parse.quote(path.name)}",
            token,
            body=path.read_bytes(),
            content_type="application/octet-stream",
        )

    if community:
        meta["communities"] = [{"identifier": community}]
    request("PUT", f"{api}/deposit/depositions/{dep_id}", token, data={"metadata": meta})
    print("    Metadata saved.")

    if publish:
        done = request("POST", f"{api}/deposit/depositions/{dep_id}/actions/publish", token)
        print(f"    Published. DOI: {done.get('doi')}")
        print(f"    Record: {done['links'].get('html') or done['links'].get('record_html')}")
        return done

    draft = request("GET", f"{api}/deposit/depositions/{dep_id}", token)
    print(f"    Draft ready to check: {draft['links'].get('html')}")
    return draft


def main():
    here = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description="Upload IOA Commons resources to Zenodo.")
    parser.add_argument("--folder", required=True, help="Folder that holds the files named in records.json.")
    parser.add_argument("--records", default=str(here / "records.json"), help="Records file (default: records.json next to this script).")
    parser.add_argument("--live", action="store_true", help="Use zenodo.org. Without it, the sandbox is used.")
    parser.add_argument("--publish", action="store_true", help="Publish the records. Without it, they stay as drafts.")
    parser.add_argument(
        "--sandbox-community",
        default="",
        help="Community slug to request on the sandbox (the IOA Commons community only exists on the live site, so none by default).",
    )
    args = parser.parse_args()

    env = "live" if args.live else "sandbox"
    api = HOSTS[env] + "/api"
    folder = Path(args.folder)
    if not folder.is_dir():
        sys.exit(f"Folder not found: {folder}")

    config = json.loads(Path(args.records).read_text(encoding="utf-8"))
    community = config["community"] if env == "live" else args.sandbox_community

    print(f"Zenodo: {HOSTS[env]}  ({'LIVE' if env == 'live' else 'sandbox, for testing'})")
    print(f"Files from: {folder}")
    print(f"Community request: {community or 'none'}")
    print(f"Publish: {'yes' if args.publish else 'no, drafts only'}")

    # On the live site every file must be present, so nothing is published half-finished.
    if env == "live":
        missing = [folder / n for r in config["records"] for n in r["files"] if not (folder / n).is_file()]
        if missing:
            print("\nThese files are missing:")
            for m in missing:
                print(f"    {m}")
            sys.exit("Add them (for example, export the tagged PDF from Word) and run again.")

    if env == "live" and args.publish:
        print("\nPublished Zenodo records cannot be deleted, only versioned.")
        if input("Type PUBLISH to publish on zenodo.org: ").strip() != "PUBLISH":
            sys.exit("Stopped. Nothing was published.")

    load_dotenv(here.parent.parent / ".env")  # .env in the ioa-hub folder
    token = os.environ.get(TOKEN_VARS[env]) or getpass.getpass(f"{env} Zenodo token (hidden): ").strip()
    if not token:
        sys.exit(f"No token. Set ${TOKEN_VARS[env]} or paste one when asked.")

    failures = 0
    for record in config["records"]:
        try:
            upload_record(api, token, record, folder, community, args.publish)
        except ZenodoError as err:
            failures += 1
            print(f"    ERROR: {err}")

    print()
    if failures:
        sys.exit(f"{failures} record(s) failed. See the errors above.")
    if env == "live" and args.publish:
        print("Done. The records join the IOA Commons community once the request is accepted;")
        print("the daily Zenodo sync then adds them to the Resources page.")
    elif not args.publish:
        print("Done. Open the draft links above to check them. Run again with --publish to publish.")
    else:
        print("Done.")


if __name__ == "__main__":
    main()
