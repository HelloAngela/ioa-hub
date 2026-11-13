# IOA Hub

The website for IOA Hub (Interactive Oral Assessment Hub), led by Dr Angela Sun at the University of Sydney. It is built with Jekyll and hosted on GitHub Pages.

This guide covers the everyday jobs. You only ever need to edit the files in `_data/`, the six `.md` pages, and `_config.yml`. The layout code is in `_layouts/`, `_includes/` and `assets/`, and you can leave it alone.

## Add a video

Videos stay on YouTube. Open `_data/videos.yml` and add an entry at the bottom:

```yaml
- title: Calibrating markers before an IOA
  youtube_id: "abc123XYZ00"
  description: Two unit coordinators explain how they ran a one-hour calibration session.
  audience: staff
  topic: calibration
  people: Name One and Name Two, UNIT1001
```

- `youtube_id` is the part of the YouTube address after `v=`. For `https://www.youtube.com/watch?v=abc123XYZ00` it is `abc123XYZ00`.
- `audience` is `staff`, `students` or `both`.
- `topic` is one word. A new word adds a new filter button on the Videos page.
- `people` is optional.

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

## Add a catalog entry

Open `_data/catalog.csv` and add one line at the bottom. The columns are, in order:

```
name,title,institution,country,faculty_or_school,discipline,unit_code,unit_name,cohort_size,year_started,ioa_format,contact_public,profile_url,resource_url,consent_date
```

Example:

```
Dr Jane Citizen,Senior Lecturer,University of Somewhere,Australia,School of Chemistry,Chemistry,CHEM2001,Organic Chemistry,300,2024,"10 minute one-to-one conversation, in person",jane.citizen@somewhere.edu,https://somewhere.edu/jane,,2026-11-14
```

- Leave a field empty if you have nothing for it, but keep the comma.
- If a value contains a comma, put double quotes around it, as in the format above.
- `consent_date` is the date the person agreed to be listed, written as `YYYY-MM-DD`. **A row with no consent date is not shown on the site.** The date itself is never shown.
- `contact_public` holds only what the person agreed to publish.

## Approve a catalog submission from an issue

1. Open the issue on GitHub and read the details. Check the consent box is ticked.
2. Add a line to `_data/catalog.csv` using the details in the issue (see above). Use the date of the issue as `consent_date`.
3. Commit the change with a message such as `Add catalog entry for Jane Citizen`, and push.
4. Comment on the issue to say the entry is live, then close it.

For Google Form submissions, do step 2 using the form response, with the date of the response as `consent_date`.

To remove someone, delete their line from `_data/catalog.csv`.

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
| GoatCounter site code | `_config.yml` (`goatcounter_code`) |
| Contact email shown on the Catalog and Contribute pages | `_config.yml` (`contact_email`) |
| Zenodo community name (currently `ioa-hub`) | `_config.yml` (`zenodo_community`) |
| YouTube IDs and descriptions for the two videos | `_data/videos.yml` |
| Sample informal resources, marked `[SAMPLE]` | `_data/resources.yml` and `resources/files/` |
| Sample catalog rows, marked `[SAMPLE]` | `_data/catalog.csv` |

A video card shows "Video coming soon" until its YouTube ID is filled in. Analytics stay off until the GoatCounter code is filled in.

## Licences

- Site code: MIT. See `LICENSE`.
- Site text and informal resources: CC BY 4.0. See `LICENSE-content.md`.
- Zenodo resources keep the licence their authors chose.
