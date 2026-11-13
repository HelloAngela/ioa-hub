---
layout: page
title: Contribute
permalink: /contribute/
description: Three ways to contribute to IOA Hub. Add yourself to the catalog, share a citable resource, or suggest a video.
lead: There are three ways to add to IOA Hub, the hub for interactive oral assessment (IOA). None of them needs coding.
---

## 1. Add yourself to the catalog

The [catalog]({{ '/catalog/' | relative_url }}) lists people running an IOA. An entry has your name, institution, unit, cohort size and IOA format. A contact email or profile link is optional. We publish only what you agree to.

**No GitHub account:** fill in the {% if site.google_form_url contains "PLACEHOLDER" %}catalog form ({{ site.google_form_url }}){% else %}<a href="{{ site.google_form_url }}">catalog form</a>{% endif %}. It takes about five minutes.

**GitHub users:** open a [catalog entry issue](https://github.com/{{ site.github_username }}/ioa-hub/issues/new?template=catalog-entry.yml). The form has the same questions.

We check each entry before it appears. To change or remove your entry later, open an issue or email {{ site.contact_email }}.

## 2. Share a citable resource

Finished guides, rubrics and frameworks go on Zenodo, a free repository run by CERN. Zenodo gives your resource a DOI, a permanent link that others can cite.

1. Create a free account at [zenodo.org](https://zenodo.org/).
2. Choose "New upload" and add your file. PDF is best for guides and rubrics.
3. Fill in the title, authors and a short description.
4. Choose a licence. We recommend CC BY 4.0, which lets others reuse your work if they credit you.
5. Under "Communities", select the [IOA Hub community](https://zenodo.org/communities/{{ site.zenodo_community }}).
6. Publish. Your resource appears on the [Resources page]({{ '/resources/' | relative_url }}) within a day of the community accepting it.

<div class="note">
<p><strong>A published Zenodo record cannot be deleted.</strong> You can upload a new version, but the old one stays available. Check your file before you publish.</p>
</div>

## 3. Suggest a video or informal resource, or report a problem

Open a [suggestion issue](https://github.com/{{ site.github_username }}/ioa-hub/issues/new?template=suggest-resource.yml) to:

- suggest a video for the [Videos page]({{ '/videos/' | relative_url }})
- offer training slides, a workshop deck or a draft
- report a broken link or a mistake.

If you do not use GitHub, email {{ site.contact_email }}.
