---
layout: page
title: Catalogue
permalink: /catalog/
description: A searchable catalogue of educators using oral assessments, by assessment type, institution, country and discipline.
lead: Find educators using interactive orals, viva-style examinations and hybrid oral assessment formats.
scripts:
  - catalog.js
---

Each row is a unit that uses an oral assessment, with the people who run it. Filter by discipline, assessment type or number of students to find an example close to your own. Everyone listed in the main table has agreed to be here. Below it, you can open more examples taken from published articles and case studies; the filters apply to both.

{% include catalog-table.html %}

## Add yourself

If you run an oral assessment, you can add your own entry to the catalogue. The [Contribute page]({{ '/contribute/' | relative_url }}) has a short form.

## Ask for removal or a correction

{% if site.intake_form_url contains "PLACEHOLDER" %}Use the shared team request form once it is set up to ask for a removal or correction.{% else %}[Ask the team to remove or correct your entry]({{ site.intake_form_url }}).{% endif %} Include the institution and name shown in the catalogue so we can find it.
