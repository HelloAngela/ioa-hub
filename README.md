# IOA Hub

The website for IOA Hub (Interactive Oral Assessment Hub), developed by Dr Angela Sun. It is built with Jekyll and hosted on GitHub Pages.

This guide covers the everyday jobs. You only ever need to edit the files in `_data/`, the six `.md` pages, and `_config.yml`. The layout code is in `_layouts/`, `_includes/` and `assets/`, and you can leave it alone.

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

## The catalog: Google Form and Google Sheet

People submit a Google Form. Each response lands as a row in a Google Sheet. You tick an "Approved" box on the row, and the entry appears on the Catalog page within a few minutes. No file editing and no push.

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
| 10 | Number of students (a number only) | Short answer, validation: number | No |
| 11 | Length of each IOA in minutes (a number only) | Short answer, validation: number | No |
| 12 | Weighting, as a percentage of the unit mark (a number only) | Short answer, validation: number | No |
| 13 | Year you started using IOA in this unit | Short answer | No |
| 14 | How you run it, in one or two sentences | Paragraph | Yes |
| 15 | Public contact: an email or link that will be shown on the site (optional) | Short answer | No |
| 16 | Profile link (optional) | Short answer | No |
| 17 | Resource link (optional) | Short answer | No |
| 18 | Consent | Checkboxes, one option: "I agree to these details being published on IOA Hub" | Yes |

At the top of the form, say that the answers will be published on IOA Hub after a check. Do not turn on "Collect email addresses".

**2. Link the sheet.** In the form's Responses tab, choose "Link to Sheets". The responses tab is called `Form responses 1`. Column A is the timestamp, B to R are questions 1 to 17, and S is consent.

**3. Add the Approved column.** In `Form responses 1`, type `Approved` in cell T1. Select column T, then choose Insert > Tick box.

**4. Add the Public tab.** Add a new tab and name it `Public`. Paste this into cell A1 (it fills row 1 with the column names):

```
=SPLIT("name,title,institution,country,faculty_or_school,discipline,unit_code,unit_name,year_level,cohort_size,length_minutes,weighting_percent,year_started,ioa_format,contact_public,profile_url,resource_url", ",")
```

Paste this into cell A2 (it copies the approved rows):

```
=IFERROR(FILTER('Form responses 1'!B2:R, 'Form responses 1'!T2:T = TRUE), "")
```

**5. Publish the Public tab.** Choose File > Share > Publish to web. In the first box pick `Public` (not "Entire document"). In the second box pick "Comma-separated values (.csv)". Press Publish and copy the link.

**6. Tell the site.** In `_config.yml`, paste that link as `catalog_sheet_csv_url` and the form's address as `google_form_url`. Commit and push.

Share the sheet with colleagues as editors if they will help approve. Never publish the `Form responses 1` tab.

### Approve, correct or remove an entry

- **Approve:** read the row in `Form responses 1`, then tick its Approved box. If a new row has no tick box, type `TRUE` in the cell instead.
- **Correct:** edit the row in `Form responses 1`.
- **Remove:** untick the Approved box, or delete the row.
- **Submission from a GitHub issue:** type the details into a new row at the bottom of `Form responses 1` and tick Approved. Then comment on the issue and close it.

Changes show on the site within about five minutes.

### Before the sheet is connected

Until `catalog_sheet_csv_url` is filled in, the Catalog page shows the `[SAMPLE]` rows in `_data/catalog.csv`. Once the sheet is connected, that file is no longer used.

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
| Google Form address for catalog entries | `_config.yml` (`google_form_url`) |
| Published link of the catalog sheet's Public tab | `_config.yml` (`catalog_sheet_csv_url`) |
| GoatCounter site code | `_config.yml` (`goatcounter_code`) |
| Contact email shown on the Catalog and Contribute pages | `_config.yml` (`contact_email`) |
| Zenodo community name (currently `ioa-hub`) | `_config.yml` (`zenodo_community`) |
| Audience and topic of each video (guessed from titles, to check) | `_data/videos.yml` |
| Sample informal resources, marked `[SAMPLE]` | `_data/resources.yml` and `resources/files/` |
| Sample catalog rows, marked `[SAMPLE]` (shown until the sheet is connected) | `_data/catalog.csv` |

A video card shows "Video coming soon" until its YouTube ID is filled in. Analytics stay off until the GoatCounter code is filled in.

## Licences

- Site code: MIT. See `LICENSE`.
- Site text and informal resources: CC BY 4.0. See `LICENSE-content.md`.
- Zenodo resources keep the licence their authors chose.
