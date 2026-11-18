---
layout: page
title: Contribute
permalink: /contribute/
description: How to add an oral assessment to the catalogue, share a resource, or suggest a publication or video.
lead: Share work on oral assessment, including interactive oral assessment (IOA), viva-style examinations and hybrid formats.
---

## 1. Add yourself to the catalogue

Would you like educators using similar oral assessments to contact you? Add yourself to the [catalogue]({{ '/catalog/' | relative_url }}). You can include a public contact or profile link if you’d like people to get in touch. We publish only the details you approve.

Fill in the {% if site.google_form_url contains "PLACEHOLDER" %}catalogue form once its link is set up{% else %}<a href="{{ site.google_form_url }}">catalogue form</a>{% endif %}. It takes about five minutes. The team checks submissions in the linked sheet before an entry appears. Fill in the form once for each unit. If you share a unit with colleagues, each of you can add yourself with the same unit code, and you will appear together on one row.

To change or remove your entry later, {% if site.intake_form_url contains "PLACEHOLDER" %}use the shared team request form once it is set up.{% else %}[send the team a request]({{ site.intake_form_url }}).{% endif %}

## 2. Publish a citable resource on Zenodo

For a formal, citable publication, share a guide, rubric or framework through Zenodo, a free research repository run by CERN (the European Organization for Nuclear Research). Zenodo assigns a DOI when you publish the record. You can then request to add it to the IOA Commons community; community moderators review that request before it appears in the community and on our Teaching materials page.

1. Create a free account at [zenodo.org](https://zenodo.org/).
2. Choose "New upload" and add your file. PDF is best for guides and rubrics.
3. Fill in the title, authors and a short description.
4. Choose a licence. We recommend CC BY 4.0, which lets others reuse your work if they credit you.
5. Under "Communities", select the [IOA Commons community](https://zenodo.org/communities/{{ site.zenodo_community }}).
6. Publish the record, then request to add it to the IOA Commons community. Once moderators accept it, the record appears on the [Teaching materials page]({{ '/resources/' | relative_url }}) within a day.

<div class="note">
<p><strong>Zenodo records are formal publications.</strong> A published record stays available and has a DOI. You can update it by publishing a new version, so check your file before publishing.</p>
</div>

## 3. Share draft or working materials

Send a sharing link to slides, workshop materials, templates or drafts that are ready for public sharing (from Google Drive, OneDrive, Dropbox or similar) through the {% if site.intake_form_url contains "PLACEHOLDER" %}shared request form once its link is set up{% else %}<a href="{{ site.intake_form_url }}">shared IOA Commons request form</a>{% endif %}. The team adds submitted files to the website through GitHub, so you do not need a GitHub account. Materials are shared as supplied and may be labelled as drafts. Please make sure you have permission to share the file and remove confidential, personal or student information. To update or remove a file later, use the same form.

Each file must be under 20 MB, because shared materials are stored in the site's GitHub repository. If a file is larger, compress the images in it or split it into smaller files. You can also publish it on Zenodo instead (see section 2), which accepts up to 50 GB per record. Share videos as a link (for example to YouTube) rather than as a file.

## 4. Suggest a publication or video, or report a problem

{% if site.intake_form_url contains "PLACEHOLDER" %}Use the shared IOA Commons request form once it is set up to:{% else %}Use the [shared IOA Commons request form]({{ site.intake_form_url }}) to:{% endif %}

- suggest an article or post for the [Publications page]({{ '/publications/' | relative_url }}). Send the link only, nothing needs uploading
- suggest a video for the [Videos page]({{ '/videos/' | relative_url }})
- report a broken link or a mistake.

The team reviews submissions in the linked response sheet, assigns an owner and updates the request status there. Please leave out sensitive personal or student information.
