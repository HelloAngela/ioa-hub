---
layout: default
title: Home
permalink: /
scripts:
  - videos.js
---
<section class="hero">
<div class="container">
<h1>Oral assessment resources</h1>
<p>Find and share resources on oral assessment, including interactive oral assessments (IOAs), viva-style exams and Honours vivas.</p>
<p>An IOA is a short (about 10-minute) conversation in a discipline-relevant scenario. Students explain and defend their thinking against learning objectives.</p>
</div>
</section>

<section class="band band--videos" aria-labelledby="videos-heading">
<div class="container">
<div class="carousel" data-carousel>
<div class="carousel__head">
<div>
<h2 id="videos-heading">Staff and student experiences</h2>
<hr class="rule">
</div>
<div class="carousel__controls" hidden>
<button type="button" class="carousel__button" data-carousel-previous aria-label="Previous videos"><span aria-hidden="true">&larr;</span></button>
<button type="button" class="carousel__button" data-carousel-next aria-label="More videos"><span aria-hidden="true">&rarr;</span></button>
</div>
</div>
<ul class="carousel__track" tabindex="0" aria-label="Featured videos" data-carousel-pick="8">
{% for item in site.data.playlist.videos %}
{% include video-card.html item=item %}
{% endfor %}
</ul>
<p class="carousel__more"><a href="{{ '/videos/' | relative_url }}">All videos</a></p>
</div>
</div>
</section>

<section class="band band--sandstone" aria-labelledby="explore-heading">
<div class="container">
<h2 id="explore-heading">Resources and examples</h2>
<hr class="rule">
<ul class="grid">
<li class="card">
<h3>Videos</h3>
<p>Staff and students share oral assessment practice. The current video collection focuses on IOA.</p>
<p class="card__action"><a href="{{ '/videos/' | relative_url }}">Watch the videos</a></p>
</li>
<li class="card">
<h3>Resources</h3>
<p>Guides, rubrics, publications, training slides and other shared materials.</p>
<p class="card__action"><a href="{{ '/resources/' | relative_url }}">Resources and publications</a></p>
</li>
<li class="card">
<h3>Catalogue</h3>
<p>Educators using IOA, viva-style exams and hybrid formats, by unit and institution.</p>
<p class="card__action"><a href="{{ '/catalog/' | relative_url }}">Search the catalogue</a></p>
</li>
</ul>
</div>
</section>

<section class="band" aria-labelledby="contribute-heading">
<div class="container">
<h2 id="contribute-heading">Sharing and community</h2>
<hr class="rule">
<div class="prose">
<p>Educators can add an oral assessment to the catalogue or share a resource or example with others.</p>
<p>The <a href="https://bit.ly/IOAexchange">Interactive Oral Exchange</a> is a community of practice hosted by the University of Sydney. Educators from any institution are welcome.</p>
<p><a class="button" href="{{ '/contribute/' | relative_url }}">Sharing resources</a></p>
</div>
</div>
</section>
