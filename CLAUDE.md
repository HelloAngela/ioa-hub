# IOA Hub — instructions for Claude Code

This file tells Claude Code what this website is, how it is built, and how Angela wants it done. Read it at the start of every session. If an instruction here conflicts with a request in the chat, follow the chat and suggest updating this file.

## 1. What this site is

**IOA Hub** (Interactive Oral Assessment Hub) is a public website that collects videos, teaching resources and a catalog of people running interactive oral assessment (IOA) in different institutions.

- **Owner:** Dr Angela Sun, Lecturer (Education-focused), School of Life and Environmental Sciences, University of Sydney.
- **Led from:** the University of Sydney, with a cross-portfolio team from Science, FASS, the Division of Teaching and Learning (DTL) and the Learning Hub.
- **Audience:** educators and educational designers (main), academic leaders, and students preparing for an IOA.
- **What IOA is (use this wording on the site):** a short (about 10 minute), organic conversation, assessed against learning objectives and set in a discipline-relevant scenario. Students show learning by explaining and defending an argument. It rewards reasoning, not recall.
- **Planned domain:** `ioahub.au` (not connected yet; see section 10).
- **Hosting:** GitHub Pages, from this repository on Angela's personal GitHub account.

## 2. How Angela works, and how to work with her

- Angela has some coding experience but is not a web developer. Explain what you changed in one or two plain sentences after each task. No jargon without a short explanation.
- Keep the site simple enough that she can edit content without touching layout code. Content lives in Markdown files and data files (YAML/CSV); layout lives in `_layouts/` and `_includes/`.
- Ask before: deleting files, adding a new dependency or service, changing the folder structure, or anything that costs money.
- Commit in small steps with clear messages. Do not push to GitHub until Angela says so.
- After building or changing a page, run the site locally (section 9) and check it at phone width and desktop width.

## 3. Writing style for all site text

- Plain, direct wording. Short sentences. No flowery or promotional language ("unlock", "empower", "journey", "transformative").
- Topic sentences state something concrete (a fact, a number), not an announcement of what follows.
- Australian spelling (organisation, colour, licence as a noun).
- Spell out "interactive oral assessment (IOA)" the first time on each page.
- When writing placeholder text, mark it clearly: `[PLACEHOLDER: …]`, so Angela can find and replace it.

## 4. Tech stack (keep it this simple)

- **Jekyll**, the static site generator built into GitHub Pages. No Node build step, no JavaScript framework.
- Plain HTML templates, one CSS file (`assets/css/style.css`), and small vanilla JavaScript only where needed (catalog search/filter).
- Data in `_data/` (YAML or CSV), so new entries never need code changes.
- No cookies, no tracking other than GoatCounter (section 8).
- Must meet WCAG 2.1 AA: alt text on every image, visible keyboard focus, sufficient colour contrast, proper heading order, semantic HTML.

## 5. Branding (University of Sydney colours)

Colours come from the University of Sydney Branding Document V2.0, via the Sydney Informatics Hub `usydColours` package. Do **not** use the University crest or logo; it needs approval from the brand team.

| Role | Name | Hex | Notes |
|---|---|---|---|
| Accent: buttons, header bar, large headings, decorative rules | Ochre | `#E74726` | Contrast on white is 3.9:1, so only for large text (24px+, or 19px bold) and non-text elements |
| Link and small accent text | Dark ochre | `#B8341A` | 5.9:1 on white, 5.2:1 on sandstone, passes AA |
| Body text | Charcoal | `#424242` | |
| Page background | White | `#FFFFFF` | |
| Section background, cards | Sandstone | `#FBEEE2` | |
| Borders, table stripes | Light grey | `#E6E7E9` | |
| Secondary accent (sparingly) | Navy | `#1B355E` | Footer background, or tags |
| Secondary accent (sparingly) | Eucalypt | `#71A499` | Tags only, not text |

Define these as CSS variables in `:root` and use the variables everywhere.

**Fonts** (the official University fonts are licensed, so use free Google Fonts with a similar feel):
- Headings: **Source Serif 4** (weights 600, 700)
- Body and UI: **Source Sans 3** (weights 400, 600)

**Look and feel:** minimal, lots of white space, sandstone section bands, ochre used as an accent rather than a flood. The 2026 IOA talk slides use a sandstone background with circular headshots and a serif title; match that feel.

**Footer on every page:** "IOA Hub is led by Dr Angela Sun at the University of Sydney." plus links to the About page, the GitHub repository, and the content licence.

## 6. Site structure

```
/                 Home
/videos/          Videos
/resources/       Resources
/catalog/         IOA catalog (who is doing IOA, where)
/contribute/      How to contribute
/about/           About us (team with photos)
```

Top navigation in this order: Home, Videos, Resources, Catalog, Contribute, About. Mobile: collapsible menu.

### 6.1 Home
- One-sentence description of IOA Hub and a two-to-three sentence explanation of IOA (section 1 wording).
- Three cards linking to Videos, Resources and Catalog.
- A "Contribute" call to action.
- "Led by the University of Sydney" line with a link to the About page.

### 6.2 Videos
- Videos are hosted on YouTube, channel **https://www.youtube.com/@OralAssessmentLibrary**. Never put video files in this repository.
- List videos in `_data/videos.yml`. Each entry: `title`, `youtube_id`, `description`, `audience` (staff / students / both), `topic` (e.g. preparation, nerves, calibration, logistics), `people` (optional).
- Show them as a grid of cards. Use a click-to-load embed (show the thumbnail first, load the YouTube player only when clicked) so the page stays fast. Use the `youtube-nocookie.com` embed domain.
- Filter buttons by `audience` and `topic`.
- Example first entries (Angela to supply the YouTube IDs):
  - "Practice and preparation" — Mitch, Science and Finance student, MIMI2002
  - "Helping students deal with nerves in interactive orals" — Anastasia, Ben and Jiva, WRIT1001

### 6.3 Resources (two tiers)

**Tier 1 — Citable resources on Zenodo.** Polished resources (guides, rubrics, frameworks) live on Zenodo with a DOI, in a Zenodo community (slug to be confirmed by Angela, provisionally `ioa-hub`).
- A GitHub Action (`.github/workflows/zenodo-sync.yml`) runs once a day and on manual trigger. It calls the public Zenodo API, `https://zenodo.org/api/communities/<slug>/records?size=100&sort=newest`, needs no API key, and saves a trimmed list to `_data/zenodo.json` with: title, creators, publication date, DOI, licence, resource type, description (first 300 characters), record URL, and download/view counts if present. It commits only if the file changed.
- The Resources page shows these as cards with title, authors, year, licence badge, and a "Cite / DOI" link. Include a "How to cite" line generated from the metadata.
- Never put an API token in the repository or in front-end code.

**Tier 2 — Informal resources in this repository.** Training slides, workshop decks and drafts that may change or be removed.
- Files go in `resources/files/`. Each one is listed in `_data/resources.yml` with: `title`, `file`, `description`, `type` (slides / guide / template / other), `authors`, `licence` (default CC BY 4.0), `updated` (date), `status` (current / draft).
- Show a "Draft — may change" label for `status: draft`.
- Keep individual files under 20 MB. Warn Angela if a file is larger.

### 6.4 Catalog
- Data in `_data/catalog.csv` with these columns:
  `name, title, institution, country, faculty_or_school, discipline, unit_code, unit_name, cohort_size, year_started, ioa_format, contact_public, profile_url, resource_url, consent_date`
- `contact_public` holds only what the person agreed to publish (an email or profile link), or is empty.
- Only publish rows where `consent_date` is filled in. Do not display `consent_date` itself.
- The page shows a searchable, sortable table with filters for country, discipline and institution. Use a small vanilla JS script; no heavy table library. It must work and stay readable on a phone (cards on narrow screens).
- Show the number of entries, institutions and countries at the top.
- Text under the table: how to add yourself (link to Contribute) and how to ask for removal (open an issue or email).

### 6.5 Contribute
Three routes, explained in plain language:
1. **Add yourself to the catalog**
   - No GitHub account: a Google Form (Angela will supply the link; use `[PLACEHOLDER: Google Form URL]`).
   - GitHub users: an issue form, `.github/ISSUE_TEMPLATE/catalog-entry.yml`, with fields matching the catalog columns and a required consent checkbox ("I agree to these details being published on IOA Hub").
2. **Share a citable resource**
   - Step-by-step guide: create a Zenodo account, upload, choose a licence (recommend CC BY 4.0), and submit to the IOA Hub community. Note that Zenodo records cannot be deleted once published, only versioned.
3. **Suggest a video or informal resource, or report a problem**
   - Issue form `.github/ISSUE_TEMPLATE/suggest-resource.yml`.

Also add `.github/ISSUE_TEMPLATE/config.yml` that disables blank issues and links to the Contribute page.

### 6.6 About
- Short paragraph: why IOA Hub exists, who leads it, and the funding (a University of Sydney Community and Leadership grant, "Creating Space for Collective Leadership"; 18 collaborators across Science, FASS, DTL and the Learning Hub, including 6 students).
- Team grid from `_data/team.yml`. Each entry: `name`, `role`, `unit`, `photo` (file name in `images/team/`), `link` (optional), `group` (e.g. Project team / Student partners / Contributors).
- Circular photos, 160px on desktop, name and role underneath, grouped by `group`. Alt text is the person's name.
- If an entry has no photo, show initials in a sandstone circle.
- Starting entries (photos already in `images/team/`):

```yaml
- name: Dr Angela Sun
  role: Lecturer (Education-focused)
  unit: School of Life and Environmental Sciences, Faculty of Science
  photo: angela-sun.jpg
  group: Project team
- name: Anne Rogerson
  role: Senior Lecturer
  unit: Faculty of Arts and Social Sciences
  photo: anne-rogerson.jpg
  group: Project team
- name: Eszter Kalman
  role: Associate Professor
  unit: Division of Teaching and Learning
  photo: eszter-kalman.jpg
  group: Project team
- name: Adam Gall
  role: Learning Success Advisor
  unit: Learning Hub
  photo: adam-gall.jpg
  group: Project team
- name: Alexandra García
  role: Learning Hub Lead
  unit: Academic Language and Learning, Learning Hub
  photo: alexandra-garcia.jpg
  group: Project team
```

- Before publishing, every person listed must have agreed. Add a comment at the top of `team.yml`: `# Only add people who have agreed to be listed with this photo and title.`
- Photos: square, 400×400 px, JPG, under 100 KB. If Angela adds a larger photo, resize and compress it.

## 7. Licensing

- Site text and informal resources: **CC BY 4.0** unless a resource says otherwise. Put this in the footer and in `LICENSE-content.md`.
- Site code: **MIT** licence in `LICENSE`.
- Zenodo resources keep whatever licence their authors chose; always display it.

## 8. Analytics

- Use **GoatCounter** (free, no cookies, no consent banner needed). Site code to be confirmed by Angela; use `[PLACEHOLDER: goatcounter code]` in `_config.yml`.
- Load the script from one include, `_includes/analytics.html`, only when `jekyll.environment == "production"`.
- Track clicks on every download link and Zenodo link as events, so Angela can see how often each resource is opened.

## 9. Folder layout and local preview

```
_config.yml
_data/        team.yml, videos.yml, resources.yml, catalog.csv, zenodo.json
_includes/    header.html, footer.html, analytics.html, video-card.html, ...
_layouts/     default.html, page.html
assets/css/   style.css
assets/js/    catalog.js, videos.js
images/team/  headshots
resources/files/  informal downloads
.github/ISSUE_TEMPLATE/  issue forms
.github/workflows/       zenodo-sync.yml
index.md, videos.md, resources.md, catalog.md, contribute.md, about.md
README.md     plain-language guide for Angela (section 11)
```

Local preview: use the `github-pages` gem in a `Gemfile` so local builds match GitHub Pages. Run with `bundle exec jekyll serve`, then open `http://localhost:4000`. If Ruby isn't installed on Angela's computer, tell her how to install it (Windows: RubyInstaller with DevKit) and wait for her before continuing.

## 10. Domain (do this last)

The domain `ioahub.au` will be connected after the site works at the GitHub address. When Angela asks:
- Add a `CNAME` file containing `ioahub.au`.
- Give her the exact DNS records to add at her registrar (GitHub Pages A records and a `www` CNAME), and remind her to tick "Enforce HTTPS" and to verify the domain in her GitHub account settings.
- Until then, set `baseurl` in `_config.yml` for the `username.github.io/ioa-hub` address, and make sure every link uses `relative_url` so nothing breaks when the domain is added.

## 11. README for Angela

Write `README.md` as a short guide covering:
- How to add a video, an informal resource, a catalog entry and a team member (which file to edit, with a copy-paste example).
- How to approve a catalog submission from an issue.
- How to run the site locally.
- Where the placeholders are that she still needs to fill in.

## 12. First build (session 1)

When Angela asks to "build the starter site":
1. Create the folder layout, `_config.yml`, `Gemfile`, layouts, header, footer and stylesheet with the brand above.
2. Build all six pages with sample data: 2 videos, 2 informal resources, 3 clearly fake catalog rows marked `[SAMPLE]`, and the 5 team members above.
3. Add the issue forms, the Zenodo sync workflow and the GoatCounter include.
4. Write `README.md`.
5. Run the site locally, check every page at phone and desktop width, and fix problems.
6. Summarise what was built and list every `[PLACEHOLDER]` Angela needs to fill in.

## 13. Open items (Angela to supply)

- [ ] YouTube video IDs for the Videos page
- [ ] Zenodo community slug, once created
- [ ] Google Form URL for catalog entries
- [ ] GoatCounter site code
- [ ] Consent from each team member to use their photo and title
- [ ] Higher-resolution photo of Angela (the current one came from slides and is small)
- [ ] Confirm the domain `ioahub.au` is purchased

## 14. Decisions made after the first build (these override the sections above)

- **Catalog data source (replaces part of 6.4 and 6.5):** submissions come through a Google Form into a Google Sheet. Angela ticks an "Approved" box, and a `Public` tab (approved rows, public columns only) is published as CSV. `assets/js/catalog.js` reads that CSV live when `catalog_sheet_csv_url` is set in `_config.yml`. Until then the page shows the `[SAMPLE]` rows in `_data/catalog.csv`. Setup steps are in `README.md`.
- **Catalog columns:** `year_level`, `length_minutes` and `weighting_percent` were added. `ioa_format` is shown as "How it runs" (one or two sentences). Filters: institution, country, discipline, year level, number of students, length of assessment.
- **Videos (adds to 6.1 and 6.2):** the home page has a video carousel directly under the introduction, showing the first 8 entries of `_data/videos.yml`. Videos come from the playlist `https://www.youtube.com/playlist?list=PLJFJAoICnsnA`. `description` is optional.
- **Local preview (replaces part of 9):** Angela's computer has Ruby 4, which the `github-pages` gem does not support. The `Gemfile` uses `jekyll ~> 3.10.0` directly (the version GitHub Pages runs). Preview address: `http://localhost:4000/ioa-hub/`.
- **GitHub:** the repository is `HelloAngela/ioa-hub`.
