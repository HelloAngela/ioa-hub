# IOA Hub

The website for IOA Hub (Oral Assessment Hub). Its resources were developed by the Advanced HE IOA team and it is maintained by Dr Angela Sun. It covers oral assessment broadly, including interactive oral assessment (IOA), viva-style examinations and hybrid formats. It is built with Jekyll and hosted on GitHub Pages.

This guide covers the everyday jobs. You only ever need to edit the files in `_data/`, the six `.md` pages, and `_config.yml`. The layout code is in `_layouts/`, `_includes/` and `assets/`, and you can leave it alone.

## Brand reference

The University of Sydney Visual Identity Guidelines (February 2023) are saved in `assets/brand/brand-guidelines-2023.pdf` as a project reference; Jekyll excludes the PDF from the published website. Read [`docs/brand/brand-notes.md`](docs/brand/brand-notes.md) before designing a new page or component. IOA Hub is not formally affiliated with the University; the notes explain the site's accessible, unlicensed font and colour choices.

## Add a video

Add the video to the YouTube playlist. That is all. Once a day the site copies the playlist, and the new video appears on the Videos page in playlist order. The home page carousel shows the first 8 videos in the playlist, so reorder the playlist on YouTube to change what is featured.

To update the site straight away, go to the repository on GitHub, then Actions > YouTube playlist sync > Run workflow.

A YouTube title written as `Title - People` is split in two on the site, so name videos that way.

To give a video filter tags, add an entry to `_data/videos.yml`:

```yaml
- youtube_id: abc123XYZ00
  audience: staff
  topic: calibration
```

- `youtube_id` is the part of the YouTube address after `v=`. For `https://www.youtube.com/watch?v=abc123XYZ00` it is `abc123XYZ00`.
- `audience` is `staff`, `students` or `both`.
- `topic` is one word. A new word adds a new filter button on the Videos page.
- You can also add `title`, `people` or `description` to change what the card shows.
- A video with no entry still shows, but only under the "All" filters.

Do not edit `_data/playlist.json` by hand. The daily copy overwrites it.

## Add a publication

The Publications page lists articles and posts that are already published somewhere else, such as on Teaching@Sydney or in a journal. The site only links to them. Open `_data/publications.yml` and add an entry anywhere in the file:

```yaml
- title: Five myths about interactive oral assessments and how to get started
  url: https://educational-innovation.sydney.edu.au/teaching@sydney/five-myths-about-interactive-oral-assessments-and-how-to-get-started/
  authors: Eszter Kalman, Benjamin Miller and Danny Liu
  date: 2024-04-18
  source: Teaching@Sydney
```

- The page sorts by `date`, newest first. If you only know the month, use the 1st.
- `source` is where it was published.
- `note` is optional: one sentence on what it covers.
- If a title contains a colon or starts with a quote mark, put double quotes around the whole title.

## Add an informal resource

1. Put the file in `resources/files/`. Keep it under 20 MB.
2. Open `_data/resources.yml` and add an entry:

```yaml
- title: IOA marker training slides
  file: marker-training-slides.pdf
  description: Slides from the 2026 marker training session, with example questions.
  type: slides
  authors: Angela Sun and Anne Rogerson
  licence: CC BY 4.0
  updated: 2026-11-14
  status: current
```

- `file` must match the file name exactly, including capital letters.
- `type` is `slides`, `guide`, `template` or `other`.
- `status: draft` shows a "Draft — may change" label.

Citable resources are different. They live on Zenodo, and the site copies the list from Zenodo once a day. You do not add them here.

## The catalogue: Google Form and Google Sheet

People submit a Google Form. Each response lands as a row in a Google Sheet. You tick an "Approved" box on the row, and the entry appears on the Catalogue page within a few minutes. No file editing and no push.

Only a second tab of the sheet, called `Public`, is published. It holds approved rows only, without the timestamp or the consent answer.

### Set it up (once)

**1. Make the form.** In Google Forms, add these questions in this exact order. The order matters.

| # | Question | Type | Required |
|---|---|---|---|
| 1 | Name (as you want it shown) | Short answer | Yes |
| 2 | Position title | Short answer | No |
| 3 | Institution | Short answer | Yes |
| 4 | Country | Short answer | Yes |
| 5 | Faculty or school | Short answer | No |
| 6 | Discipline | Short answer | Yes |
| 7 | Unit code | Short answer | No |
| 8 | Unit name | Short answer | No |
| 9 | Year level | Dropdown: 1st year, 2nd year, 3rd year, 4th year or Honours, Postgraduate, Other | No |
| 10 | Assessment type | Dropdown: Interactive oral assessment (IOA), Viva or oral examination, Hybrid oral assessment, Other oral assessment | Yes |
| 11 | Number of students (a number only) | Short answer, validation: number | No |
| 12 | Typical length of this assessment in minutes (a number only) | Short answer, validation: number | No |
| 13 | Weighting, as a percentage of the unit mark (a number only) | Short answer, validation: number | No |
| 14 | Year you started using this assessment in this unit | Short answer | No |
| 15 | How the assessment works, in one or two sentences | Paragraph | Yes |
| 16 | Public contact: an email or link that will be shown on the site (optional) | Short answer | No |
| 17 | Profile link (optional) | Short answer | No |
| 18 | Resource link (optional) | Short answer | No |
| 19 | Consent | Checkboxes, one option: "I agree to these details being published on IOA Hub" | Yes |

At the top of the form, say that the answers will be published on IOA Hub after a check. Explain that the catalogue covers IOA, viva-style and hybrid oral assessments. For an Honours viva that combines features of a PhD defence and an IOA, choose "Hybrid oral assessment" and describe it in question 15. Do not turn on "Collect email addresses".

**2. Link the sheet.** In the form's Responses tab, choose "Link to Sheets". The responses tab is called `Form responses 1`. Column A is the timestamp, B to S are questions 1 to 18, and T is consent (question 19).

**3. Add the Approved column.** In `Form responses 1`, type `Approved` in cell U1. Select column U, then choose Insert > Tick box.

**4. Add the Public tab.** Add a new tab and name it `Public`. Paste this into cell A1 (it fills row 1 with the column names):

```
=SPLIT("name,title,institution,country,faculty_or_school,discipline,unit_code,unit_name,year_level,assessment_type,cohort_size,length_minutes,weighting_percent,year_started,assessment_format,contact_public,profile_url,resource_url", ",")
```

Paste this into cell A2 (it copies the approved rows):

```
=IFERROR(FILTER('Form responses 1'!B2:S, 'Form responses 1'!U2:U = TRUE), "")
```

**5. Publish the Public tab.** Choose File > Share > Publish to web. In the first box pick `Public` (not "Entire document"). In the second box pick "Comma-separated values (.csv)". Press Publish and copy the link.

**6. Tell the site.** In `_config.yml`, paste that link as `catalog_sheet_csv_url` and the form's address as `google_form_url`. Commit and push.

Share the sheet with colleagues as editors if they will help approve. Never publish the `Form responses 1` tab.

### Approve, correct or remove an entry

- **Approve:** read the row in `Form responses 1`, then tick its Approved box. If a new row has no tick box, type `TRUE` in the cell instead.
- **Correct:** edit the row in `Form responses 1`.
- **Remove:** untick the Approved box, or delete the row.

Changes show on the site within about five minutes.

## Shared requests: suggestions, corrections and contact

Suggestions, general enquiries, broken links, corrections and catalogue removal requests should go to one Google Form. The linked Google Sheet is the team's request queue, so submissions have an owner and status instead of arriving in separate email and GitHub channels. The catalogue submission form above remains separate because its approved answers feed the public catalogue.

**1. Make a Google Form** with these questions:

| # | Question | Type | Required |
|---|---|---|---|
| 1 | What is your request about? (Publication or link; video; informal resource; catalogue correction or removal; site problem; general enquiry; other) | Dropdown | Yes |
| 2 | Short title | Short answer | Yes |
| 3 | Link to the page, publication or resource (if relevant) | Short answer | No |
| 4 | Tell us what you need | Paragraph | Yes |
| 5 | Your name | Short answer | No |
| 6 | Your email, if you would like a reply | Short answer | No |
| 7 | Resource licence or sharing permission (if relevant) | Paragraph | No |

Do not enable public response access to the linked sheet. Tell people not to include sensitive personal or student information.

**2. Link the form to a Google Sheet.** Share the sheet with the team members who will triage requests. Add these columns to the right of the form response columns: `Status`, `Owner`, `Team notes`, `Last updated`. Suggested statuses: `New`, `In progress`, `Waiting for submitter`, `Done`, `Closed`. The assigned team member updates the status and notes as they work; team notes are internal and must not be published.

**3. Connect the form to the site.** Put its URL in `_config.yml` as `intake_form_url`. Suggestions and correction/removal links on the site use this setting. Until it is set, those links show a placeholder, so set it before publishing the updated site.

### Before the sheet is connected

Until `catalog_sheet_csv_url` is filled in, the Catalogue page shows the `[SAMPLE]` rows in `_data/catalog.csv`. Once the sheet is connected, that file is no longer used.

## Add a team member

Only add people who have agreed to be listed with this photo and title.

1. Put a square photo in `images/team/`: 400×400 px, JPG, under 100 KB. Name it like `jane-citizen.jpg`.
2. Open `_data/team.yml` and add an entry:

```yaml
- name: Jane Citizen
  role: Student partner
  unit: Faculty of Science
  photo: jane-citizen.jpg
  link: https://www.sydney.edu.au/
  group: Student partners
```

- `photo` and `link` are optional. With no photo, the page shows the person's initials in a circle.
- `group` is `Project team`, `Student partners` or `Contributors`. People with the same group appear together.

## Run the site on your own computer

You need Ruby. Do this once:

1. Download **Ruby+Devkit (x64)** from <https://rubyinstaller.org/downloads/> and install it with the default options.
2. On the last screen, leave "Run ridk install" ticked. In the window that opens, press Enter.
3. Close and reopen VS Code.
4. In the VS Code terminal, in this folder, run `bundle install`. It takes a few minutes.

Each time you want to preview the site:

```
bundle exec jekyll serve
```

Then open <http://localhost:4000/ioa-hub/> in your browser. The page updates when you save a file. If you change `_config.yml`, stop the preview (Ctrl+C) and start it again.

## Placeholders still to fill in

Search the project for `PLACEHOLDER` to find them all.

| What | Where |
|---|---|
| Google Form address for catalogue entries | `_config.yml` (`google_form_url`) |
| Shared Google Form for suggestions, corrections, removals and enquiries | `_config.yml` (`intake_form_url`) |
| Published link of the catalogue sheet's Public tab | `_config.yml` (`catalog_sheet_csv_url`) |
| GoatCounter site code | `_config.yml` (`goatcounter_code`) |
| Audience and topic of each video (guessed from titles, to check) | `_data/videos.yml` |
| Sample informal resources, marked `[SAMPLE]` | `_data/resources.yml` and `resources/files/` |
| Sample catalogue rows, marked `[SAMPLE]` (shown until the sheet is connected) | `_data/catalog.csv` |

A video card shows "Video coming soon" until its YouTube ID is filled in. Analytics stay off until the GoatCounter code is filled in.

## Licences

- Site code: MIT. See `LICENSE`.
- Site text and informal resources: CC BY 4.0. See `LICENSE-content.md`.
- Zenodo resources keep the licence their authors chose.
