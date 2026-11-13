---
layout: default
title: Home
permalink: /
scripts:
  - videos.js
---
<section class="hero">
<div class="container">
<h1>Interactive oral assessment, in one place</h1>
<p>IOA Hub collects videos, teaching resources and a catalog of people running interactive oral assessment (IOA) in different institutions.</p>
<p>An IOA is a short (about 10 minute), organic conversation, assessed against learning objectives and set in a discipline-relevant scenario. Students show learning by explaining and defending an argument. It rewards reasoning, not recall.</p>
</div>
</section>

<section class="band band--videos" aria-labelledby="videos-heading">
<div class="container">
<div class="carousel" data-carousel>
<div class="carousel__head">
<div>
<h2 id="videos-heading">Hear from staff and students</h2>
<hr class="rule">
</div>
<div class="carousel__controls" hidden>
<button type="button" class="carousel__button" data-carousel-previous aria-label="Previous videos"><span aria-hidden="true">&larr;</span></button>
<button type="button" class="carousel__button" data-carousel-next aria-label="More videos"><span aria-hidden="true">&rarr;</span></button>
</div>
</div>
<ul class="carousel__track" tabindex="0" aria-label="Featured videos">
{% for item in site.data.playlist.videos limit: 8 %}
{% include video-card.html item=item %}
{% endfor %}
</ul>
<p class="carousel__more"><a href="{{ '/videos/' | relative_url }}">See all videos</a></p>
</div>
</div>
</section>

<section class="band band--sandstone" aria-labelledby="explore-heading">
<div class="container">
<h2 id="explore-heading">What is on IOA Hub</h2>
<hr class="rule">
<ul class="grid">
<li class="card">
<h3>Videos</h3>
<p>Staff and students talk about preparing for an IOA, handling nerves and running the assessment.</p>
<p class="card__action"><a href="{{ '/videos/' | relative_url }}">Watch the videos</a></p>
</li>
<li class="card">
<h3>Resources</h3>
<p>Guides, rubrics and frameworks with a DOI you can cite, training slides, and a list of publications.</p>
<p class="card__action"><a href="{{ '/resources/' | relative_url }}">Browse the resources</a></p>
</li>
<li class="card">
<h3>Catalog</h3>
<p>A searchable list of who is running IOA, in which unit, at which institution.</p>
<p class="card__action"><a href="{{ '/catalog/' | relative_url }}">Search the catalog</a></p>
</li>
</ul>
</div>
</section>

<section class="band" aria-labelledby="contribute-heading">
<div class="container">
<h2 id="contribute-heading">Contribute</h2>
<hr class="rule">
<div class="prose">
<p>If you run an IOA, add yourself to the catalog. It takes about five minutes. You can also share a resource or suggest a video.</p>
<p>Staff at any institution can also join the <a href="https://bit.ly/IOAexchange">Interactive Oral Exchange</a>, a community of practice for people who run an IOA or plan to.</p>
<p><a class="button" href="{{ '/contribute/' | relative_url }}">How to contribute</a></p>
</div>
</div>
</section>
