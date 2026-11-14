# Preparing resources for IOA Hub: guidelines for Claude in Cowork

These guidelines are for Claude (or any AI assistant) working in Cowork with Dr Angela Sun. They explain how to take Angela's teaching materials, prepare them for sharing, and put them in the right place so they appear on the IOA Hub website.

Read this whole file before starting. For anything not covered here, read `AGENTS.md` in the same folder (the full site instructions) and follow it.

## 1. The website in one paragraph

IOA Hub (Interactive Oral Assessment Hub) is a static website built with Jekyll and hosted on GitHub Pages. Its source is the folder `ioa-hub` (on Angela's computer: `C:\Users\hello\ioa-hub`). Pages read their content from data files in `_data/`. You never need to edit page layouts, HTML, CSS or JavaScript to add a resource. Adding a resource means: put the file in one folder, and add a short entry to one data file. The site rebuilds itself after Angela commits and pushes.

## 2. Decide where each item belongs

Ask Angela which route she wants if it is not obvious. Each item goes to exactly one route.

| The item is… | Route | Where it ends up on the site |
|---|---|---|
| Polished and meant to be cited (guide, rubric, framework, report) | **A. Zenodo** (formal publication with a DOI) | Resources page, "Guides and frameworks" |
| Working material that may change or be removed (slides, workshop deck, template, draft) | **B. Shared materials** (file in this repository) | Resources page, "Shared materials" |
| An article, blog post or paper already published somewhere else | **C. Publications** (link only) | Publications page |
| A video | **D. YouTube playlist** (link only) | Videos page and home page carousel |

Never put video files in the repository. Never add Zenodo resources to `_data/resources.yml`; they are listed automatically.

## 3. Prepare the material (all routes)

Do these checks on every file before it is shared. Report what you changed and anything you could not resolve.

**Privacy and permissions**
- Remove student names, student ID numbers, photos of students, grades, recordings and any student work, unless Angela confirms written permission.
- Remove speaker notes, comments, tracked changes and hidden slides unless Angela wants them kept. Check document properties (author, company, file path) too.
- Remove internal-only information: unit outlines with staff phone numbers, internal links (intranet, Canvas, SharePoint), room bookings, unpublished marks data.
- List every third-party image, figure, quote or logo you find. CC BY 4.0 can only cover content Angela's team owns. For third-party items, ask Angela whether to remove, replace or credit them (with source and licence).

**Licence and credit**
- Default licence: **CC BY 4.0**, unless Angela says otherwise.
- Add a licence line on the first page or title slide, and in the final page or footer if there is room:
  `© <year> <authors>. Licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).`
- Keep the authors' names as they appear on the original. Ask Angela if co-authors are unclear. Every named co-author should have agreed to sharing.

**Accessibility (WCAG 2.1 AA)**
- Every meaningful image has alt text. Decorative images are marked decorative.
- Headings use real heading styles (Word, PowerPoint titles), in order.
- Text has enough contrast with its background. No information conveyed by colour alone.
- Slides have unique titles. Reading order is correct.
- When exporting to PDF, keep it tagged (in Office: File > Export > PDF, with "Document structure tags for accessibility" ticked).

**Branding**
- Do not add the University of Sydney logo or crest to anything new. If an original uses a University template, keep it only if Angela confirms; otherwise use a plain layout.

**Writing style for anything you write (descriptions, titles, notes)**
- Plain, direct wording. Short sentences. Australian spelling (organisation, colour, licence as a noun).
- No promotional words: unlock, empower, journey, transformative, cutting-edge, game-changer.
- Spell out "interactive oral assessment (IOA)" the first time in each description.
- Descriptions state something concrete: what the resource is, who it is for, and what it contains. For example: "Slides from a 60-minute workshop for markers new to interactive oral assessment (IOA). Includes three example scenarios and a calibration exercise."

## 4. Route A: Zenodo (citable resources)

Zenodo uploads are done by Angela in her Zenodo account; you prepare everything for her. Published Zenodo records cannot be deleted, only versioned, so be careful before she publishes.

1. Produce the final file, usually a tagged PDF.
2. Write the metadata for her to paste into the Zenodo upload form:
   - **Resource type:** Publication > Report, or Presentation, Lesson, Other, as appropriate
   - **Title**
   - **Creators:** each as `Family name, Given names`, with affiliation, and ORCID if Angela gives one
   - **Description:** 2 to 4 plain sentences (section 3 style)
   - **Licence:** Creative Commons Attribution 4.0 International (unless Angela chooses another)
   - **Keywords:** for example `interactive oral assessment`, `oral assessment`, `assessment design`, plus the discipline
   - **Community:** IOA Hub (`https://zenodo.org/communities/ioahub`)
3. Give Angela the checklist: create the upload, add the file and metadata, select the IOA Hub community, publish, then request inclusion in the community.

Do not edit any website file for this route. Once the community accepts the record, a daily automatic job copies it into `_data/zenodo.json` and it appears on the Resources page. Never edit `_data/zenodo.json` by hand.

## 5. Route B: Shared materials (files on the website)

### 5.1 The file

- **Folder:** `resources/files/` (exact path, inside the `ioa-hub` folder). No subfolders.
- **File name:** lowercase, words joined by hyphens, no spaces or special characters, with a short date or version only if useful. Examples: `ioa-marker-training-slides-2026.pdf`, `ioa-scenario-template.docx`.
- **Format:**
  - Slides and guides people should read: PDF.
  - Templates people should edit: the editable format (`.docx`, `.pptx`, `.xlsx`). Optionally add a PDF copy as a separate entry.
- **Size:** under 20 MB per file. Compress images or split the file if needed. If a file is still larger, stop and tell Angela.
- Never overwrite an existing file without asking Angela. To update a resource, either replace the file with the same name (after she agrees) or add a new version and update the entry.

### 5.2 The entry

Add an entry to `_data/resources.yml`. Entries show on the site in the order they appear in the file, so put the newest at the top, directly after the comment block.

```yaml
- title: IOA marker training slides
  file: ioa-marker-training-slides-2026.pdf
  description: Slides from a 60-minute workshop for markers new to interactive oral assessment (IOA). Includes three example scenarios and a calibration exercise.
  type: slides
  authors: Angela Sun and Anne Rogerson
  licence: CC BY 4.0
  updated: 2026-11-14
  status: current
```

| Field | Rules |
|---|---|
| `title` | Short and plain. If it contains a colon `:` or starts with a quote mark, wrap the whole title in double quotes. |
| `file` | Exactly the file name in `resources/files/`, including capitals and extension. |
| `description` | One or two sentences (section 3 style). Wrap in double quotes if it contains a colon. |
| `type` | One of `slides`, `guide`, `template`, `other`. |
| `authors` | As they should be credited, for example `Angela Sun and Anne Rogerson`. |
| `licence` | `CC BY 4.0` unless Angela chose another. |
| `updated` | Date of this version, `YYYY-MM-DD`. |
| `status` | `current`, or `draft` to show "Draft — may change" on the site. |

YAML rules: two-space indentation, a hyphen starts each entry, no tabs. Keep the comment block at the top of the file unchanged.

### 5.3 Sample entries

The file currently starts with two entries marked `[SAMPLE]`, with files `sample-marker-training-slides.txt` and `sample-scenario-template.txt`. When the first real resource is added, ask Angela whether to remove the samples. Only remove them (entries and files) after she says yes.

## 6. Route C: Publications (links only)

Add an entry anywhere in `_data/publications.yml`; the page sorts by date, newest first.

```yaml
- title: Five myths about interactive oral assessments and how to get started
  url: https://educational-innovation.sydney.edu.au/teaching@sydney/five-myths-about-interactive-oral-assessments-and-how-to-get-started/
  authors: Eszter Kalman, Benjamin Miller and Danny Liu
  date: 2024-04-18
  source: Teaching@Sydney
  note: Optional. One sentence on what it covers.
```

Use the publication date (the 1st of the month if only the month is known). Check the link opens.

## 7. Route D: Videos (links only)

Videos live on YouTube, channel `https://www.youtube.com/@OralAssessmentLibrary`. Angela adds a video to the playlist herself; the site copies the playlist daily. Name videos on YouTube as `Title - People` so the site splits them correctly.

You can help by drafting the YouTube title and description, and by adding optional tags in `_data/videos.yml`:

```yaml
- youtube_id: abc123XYZ00
  audience: staff
  topic: calibration
```

`audience` is `staff`, `students` or `both`. `topic` is one lowercase word (for example `preparation`, `nerves`, `calibration`, `logistics`). The `youtube_id` is the part of the address after `v=`. Never edit `_data/playlist.json`.

## 8. Files you may and may not touch

| You may edit | Do not edit |
|---|---|
| `resources/files/` (add files) | `_layouts/`, `_includes/`, `assets/` (layout code) |
| `_data/resources.yml` | `_data/zenodo.json`, `_data/playlist.json` (filled automatically) |
| `_data/publications.yml` | `_config.yml` (ask Angela first) |
| `_data/videos.yml` | `.github/` (automations) |
| | `_data/catalog.csv` (the catalogue comes from a Google Sheet) |
| | `AGENTS.md`, `CLAUDE.md` (unless Angela asks) |

Ask Angela before deleting any file, renaming an existing file, or adding a new folder.

## 9. Finish and hand over

Do not commit or push unless Angela asks. When done, give her:

1. A list of files added or changed, with their paths.
2. What you changed in each source file (privacy removals, licence line, alt text, compression).
3. Anything she still needs to decide or check (third-party content, co-author consent, unclear licence).
4. The next step: open the `ioa-hub` folder in VS Code (or GitHub Desktop), review the changes, commit them with a short message (for example "Add IOA marker training slides"), and push. The site updates within a few minutes.

If you cannot write to the `ioa-hub` folder, put everything in one handover folder named `ioa-hub-upload-<YYYY-MM-DD>` with the same structure (`resources/files/…` and a text file holding the YAML entries to paste), and tell Angela where it is.
