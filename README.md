# IOA Hub

The website for IOA Hub (Interactive Oral Assessment Hub). It was developed by a team based at the University of Sydney and is maintained by Dr Angela Sun. It covers oral assessment broadly, including interactive oral assessment (IOA), viva-style examinations and hybrid formats. It is built with Jekyll and hosted on GitHub Pages.

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

### Set up both forms (once)

A script builds the catalogue form, the request form and both response sheets for you. It is in `docs/google-forms/create-forms.gs`.

1. Go to <https://script.google.com> while signed in to the Google account that should own the forms. Choose **New project**.
2. Delete the sample code. Open `docs/google-forms/create-forms.gs` in VS Code, copy all of it, and paste it in. Press Save.
3. In the bar at the top, choose `createIoaHubForms` and press **Run**. Google asks for permission to manage your forms and sheets: choose your account, then Advanced > Go to project, then Allow.
4. When it finishes, the Execution log shows two form links and two sheet links. All four files are also in your Google Drive.
5. Open the **IOA Hub catalogue responses** sheet. Choose File > Share > Publish to web. In the first box pick `Public` (not "Entire document"). In the second box pick "Comma-separated values (.csv)". Press Publish and copy the link.
6. In `_config.yml`, paste:
   - the catalogue form link as `google_form_url`
   - the request form link as `intake_form_url`
   - the published CSV link as `catalog_sheet_csv_url`

   Then commit and push.

Run the script only once. A second run makes a second set of forms.

Open each form and check the wording before you share it. You can change question text, help text and the description freely. In the catalogue form, **do not add, remove or reorder questions**: the Public tab copies columns B to S by position. If you need a new question, add it after Consent and ask for help updating the Public tab.

Share the sheets with colleagues as editors if they will help. Never publish the `Form responses 1` tab of either sheet.

### What the catalogue sheet contains

- `Form responses 1`: every submission. Column A is the timestamp, B to S are the 18 answers, T is consent and U is **Approved**. Each new response gets an empty tick box in column U automatically.
- `Public`: approved rows only, without the timestamp or consent answer, under the column names the Catalogue page reads. It fills itself; do not type in it.

### Approve, correct or remove an entry

- **Approve:** read the row in `Form responses 1`, then tick its Approved box. If a row has no tick box, type `TRUE` in the cell instead.
- **Correct:** edit the row in `Form responses 1`.
- **Remove:** untick the Approved box, or delete the row.

Changes show on the site within about five minutes.

### How an approved entry reaches the site

1. Someone submits the catalogue form. Their answers become a new row in `Form responses 1`, with an empty Approved tick box.
2. You tick Approved. The `Public` tab copies the row straight away.
3. Google refreshes the published CSV copy of the `Public` tab about every five minutes.
4. Each time someone opens the Catalogue page, it reads that CSV. Nothing needs editing, committing or pushing.

### Get an email when someone submits

Google does not email you about new submissions unless you turn it on.

- **For yourself:** open each form in Google Forms, go to the **Responses** tab, click the three dots (⋮) and choose **Get email notifications for new responses**. Do this for both forms.
- **For team members:** each person opens the response sheet and chooses **Tools > Notification settings > Edit notifications**, then **"A user submits a form"**.

## Shared requests: suggestions, materials, corrections and contact

Everything that is not a catalogue entry goes through the **IOA Hub request form**: suggested publications and videos, draft or working materials to share, catalogue corrections and removals, website problems and general questions. The **IOA Hub requests** sheet is the team's to-do list.

- Columns A to I hold the answers. The script adds `Status`, `Owner`, `Team notes` and `Last updated` (J to M).
- Each new request gets the status `New` and today's date automatically. The other statuses are `In progress`, `Waiting for submitter`, `Done` and `Closed`.
- Team notes are internal. Never publish this sheet.

People share materials as a link to a file in their own Google Drive, OneDrive or Dropbox. The form has no file upload question, because Google Forms makes everyone sign in to a Google account to upload. To add a shared file to the site, download it, put it in `resources/files/` and follow "Add an informal resource" above.

Requests do not change the site by themselves. Someone acts on each one, then sets its Status to `Done`:

| Request | What to do |
|---|---|
| Publication | Add an entry to `_data/publications.yml`, then commit and push |
| Video | Add it to the YouTube playlist. The site picks it up within a day |
| Draft or working materials | Download the file, put it in `resources/files/`, add an entry to `_data/resources.yml`, then commit and push |
| Catalogue correction | Edit the row in the catalogue sheet. Shows within about five minutes, no push |
| Catalogue removal | Untick Approved or delete the row in the catalogue sheet. Gone within about five minutes, no push |
| Website problem | Fix the page, then commit and push |

After a push, GitHub Pages updates the live site within a couple of minutes. You can also paste a request into an AI coding assistant and ask it to make the change.

### Before the sheet is connected

Until `catalog_sheet_csv_url` is filled in, the Catalogue page shows the `[SAMPLE]` rows in `_data/catalog.csv`. Once the sheet is connected, that file is no longer used.

## Website analytics (GoatCounter)

The site counts visits with GoatCounter, which uses no cookies, so no consent banner is needed. Google Analytics would need one. The dashboard is at <https://ioahub.goatcounter.com>. Sign in with the GoatCounter account.

- **What it shows:** page views, the most visited pages, where visitors came from, their countries and screen sizes.
- **Events:** clicks on every resource download and Zenodo link are counted, so you can see how often each resource is opened. Find them under **Events** on the dashboard.
- **Only the live site is counted.** Local previews do not load the counter. The site code is `goatcounter_code: ioahub` in `_config.yml`.
- **Leave out your own visits:** in GoatCounter, go to **Settings** and add your IP address under **Ignore IPs**.
- **When `ioahub.au` is connected,** nothing changes in GoatCounter.

## Instructions for AI assistants

`AGENTS.md` describes the site, its rules and the decisions made so far, for any AI coding assistant (Claude Code, Codex, Copilot, Cursor, Gemini and others). When you make a decision that should stick, ask the assistant to add it to `AGENTS.md`. `CLAUDE.md` only points Claude Code to `AGENTS.md`; do not edit it.

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
| Public contact email (footer and About page) | `_config.yml` (`contact_email`) |
| Audience and topic of each video (guessed from titles, to check) | `_data/videos.yml` |
| Sample informal resources, marked `[SAMPLE]` | `_data/resources.yml` and `resources/files/` |
| Sample catalogue rows, marked `[SAMPLE]` (shown until the sheet is connected) | `_data/catalog.csv` |

A video card shows "Video coming soon" until its YouTube ID is filled in.

## Licences

- Site code: MIT. See `LICENSE`.
- Site text and informal resources: CC BY 4.0. See `LICENSE-content.md`.
- Zenodo resources keep the licence their authors chose.
