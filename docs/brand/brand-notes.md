# Brand notes for IOA Commons

IOA Commons is not an official University of Sydney website and is not formally affiliated with the University. The site takes cues from the University's visual identity without implying endorsement or using protected assets.

**Reference:** University of Sydney Visual Identity Guidelines, February 2023. A project copy is saved at [`assets/brand/brand-guidelines-2023.pdf`](../../assets/brand/brand-guidelines-2023.pdf) and excluded from the published site. Consult it when creating pages or components. These notes describe how IOA Commons applies the guidance; they are not University rules or permission to use University marks.

## Do not use

- The University logo, shield or coat of arms.
- The “Leadership for good” line or hashtag.
- The licensed brand fonts Apercu Pro and Lyon.

## Typography

The guidelines pair Apercu Pro with Lyon Display. IOA Commons uses free web fonts with a similar character:

| Use | IOA Commons font | Implementation |
|---|---|---|
| Headings, navigation, buttons, labels and body | Source Sans 3 | Regular 400; semibold 600; bold 700 where needed |
| Short editorial accent | Newsreader | Regular italic 400; regular roman 400 for page lead text |

Source Sans is the guideline's recommended substitute for Apercu. Newsreader is IOA Commons's substitute for Lyon; it is not an official University substitute.

- Set headings in Source Sans 3. The earlier site stylesheet used a serif face for all headings; that did not follow the guideline's sans-serif heading treatment.
- Use the serif sparingly: a short phrase in a heading, a tagline, a page lead, or a person's role. Keep mixed headline fonts at the same size.
- Do not use serif for body copy or long passages. Keep text left-aligned; do not justify paragraphs.
- Fonts are loaded from Google Fonts in `_layouts/default.html`; CSS font variables live at the top of `assets/css/style.css`.

## Colour

The CSS variables at the top of `assets/css/style.css` are the source of truth. Use them instead of raw colour values.

| Name | Hex | Variable | Use |
|---|---|---|---|
| Ochre | `#E64626` | `--ochre` | Brand accent, rules and large text; use text only at 24px or larger, or 18px bold or larger |
| Dark ochre | `#B8341A` | `--ochre-dark` | Links and small accent text |
| Charcoal | `#424242` | `--charcoal` | Body text, headings and footer |
| Black | `#000000` | `--black` | Focus treatment when needed |
| White | `#FFFFFF` | `--white` | Page background |
| Sandstone | `#FCEDE2` | `--sandstone` | Section bands, cards and notes |
| Light grey | `#F1F1F1` | `--grey-light` | Borders and table stripes |

Lead with ochre accents and use white, charcoal and sandstone to give them room. Tertiary colours (Heritage Rose, Jacaranda, Navy and Eucalypt) are for charts, diagrams and infographics, not general layout, tags or the footer.

The guideline's Accessible Ochre is `#CE3D20`. IOA Commons uses the darker `#B8341A` for links and small text because links also appear on sandstone and light-grey backgrounds. Keep text contrast at WCAG AA.

## Layout and imagery

- Leave generous whitespace and align text to the left.
- Include a clear ochre accent on each page.
- Prefer real, uncluttered photos of our people and places, with one clear subject and a simple background. Show a diverse range of people; avoid staged or generic stock imagery.
- Keep the existing accessibility requirements: readable contrast, visible keyboard focus, descriptive image text and semantic headings.

## Page patterns

- Page title: Source Sans 3. A short subtitle may use the `accent` class in Newsreader italic.
- Page lead: Newsreader regular, kept brief.
- Header: site name in Source Sans 3; tagline in Newsreader italic.
- Team: person's name in Source Sans 3; role may use Newsreader italic.

These are IOA Commons design choices, not official University endorsements. When in doubt, check the saved PDF and preserve the site's accessible, unaffiliated presentation.
