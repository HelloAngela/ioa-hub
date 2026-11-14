---
layout: page
title: Catalogue
permalink: /catalog/
description: A searchable catalogue of educators using oral assessments, by assessment type, institution, country and discipline.
lead: Find educators using interactive orals, viva-style examinations and hybrid oral assessment formats.
scripts:
  - catalog.js
---

Everyone listed has agreed to be here. Search by assessment type, institution, year level, student numbers or assessment length to find an educator using an oral assessment format like yours.

{% include catalog-table.html %}

## Add yourself

If you run an oral assessment, you can add your own entry to the catalogue. The [Contribute page]({{ '/contribute/' | relative_url }}) has a short form.

## Ask for removal or a correction

{% if site.intake_form_url contains "PLACEHOLDER" %}Use the shared team request form once it is set up to ask for a removal or correction.{% else %}[Ask the team to remove or correct your entry]({{ site.intake_form_url }}).{% endif %} Include the institution and name shown in the catalogue so we can find it.
