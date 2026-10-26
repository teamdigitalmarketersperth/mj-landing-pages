# MJ Landscapes & Maintenance — Landing Pages

Four standalone ad / A-B landing pages that share the design system from
[mjlandscapesmaintenance.com](https://mjlandscapesmaintenance.com/).

| Page | Offer | Angle |
| --- | --- | --- |
| `lawn-maintenance-v1/` | Lawn & garden maintenance | Classic, trust-led flow |
| `lawn-maintenance-v3/` | Lawn & garden maintenance | Form in the hero, plans band, sticky mobile CTA |
| `landscape-construction-v2/` | Design & construction | Portfolio / gallery-led, premium |
| `landscape-construction-v4/` | Design & construction | Process-led, budget-qualifying (form appears twice) |

## Structure

```
assets/css/styles.css   shared design system (tokens, components, breakpoints 600/768/1024)
assets/js/main.js       sticky header, mobile drawer, FAQ accordion, form validation,
                        plan → package pre-select, sticky mobile CTA
<variant>/index.html    one self-contained page per folder
```

Pages are plain HTML. The only external dependencies are Google Fonts and the images,
which are loaded straight from the live site's `wp-content/uploads`.

## Preview locally

From this folder:

```bash
python -m http.server 8000
# open http://localhost:8000/lawn-maintenance-v1/
```

Opening `index.html` straight from disk also works.

## Deploying

Each page links its assets via `../assets/`, so deploy the `assets/` folder next to the
variant folders (e.g. `example.com/assets/` + `example.com/lawn-maintenance-v1/`).
To deploy a page on its own, copy `assets/` into the page's folder and change the two
`../assets/` references to `assets/`.

All pages include `<meta name="robots" content="noindex, follow">` so they don't compete
with the main site in search results. Remove it if you want a variant indexed.

## Wiring the quote forms

Every form is `<form class="quote-form" action="#" method="post" novalidate>`, and each one
is preceded by an `<!-- FORM ENDPOINT -->` comment.

1. Set `action` to your handler (CRM webhook, Formspree, Gravity Forms endpoint, etc.).
2. In `assets/js/main.js`, find the `WIRE THE REAL ENDPOINT HERE` comment in the submit handler.
   Replace `showSuccess()` with a `fetch(form.action, { method: 'POST', body: new FormData(form) })`
   and call `showSuccess()` when it resolves.
3. Each form sends a hidden `landing_page` field (e.g. `lawn-maintenance-v3`) so you can
   attribute leads to a variant.

Field names: `full_name`, `phone`, `email`, `street_address`, `suburb`, `package`,
`mowing_services[]`, `gardening_services[]`, `job_description` (maintenance) and
`landscape_plan`, `budget`, `details`, `full_name`, `phone`, `email`, `address` (construction).

## Analytics

None are included. Add your tag (GA4, Google Ads, Meta Pixel, etc.) just before `</head>`
in each `index.html`. Fire the conversion event inside `showSuccess()` in `main.js`.
`landing_page` tells you which variant converted.

## Notes

- **Contrast.** The brand taupe `#918D82` gives about 3.3:1 against white. That passes WCAG AA
  for large text and UI components, but not for the 13–14px button labels and eyebrows.
  It's kept for brand fidelity. Darken it to about `#6F6C63` in `:root` if you need strict AA.
- **No header.** The pages deliberately have no header or navigation, so paid traffic has no exits
  and stays focused on the quote form. The brand, contact details and site links are in the footer.

## Motion

Everything lives in `styles.css` and `main.js`, with no animation library.

- **Hero load sequence:** the photo settles from a slight zoom, the headline rises line by line,
  then the subline, CTAs and meta row follow. It starts when the hero image has decoded, or after 1.2s at the latest.
- **Scroll reveals:** section headings rise in, images open with a curtain wipe, stats count up,
  and the v4 process line draws across. Mark an element with `data-reveal` (or `data-reveal="image"`
  on an image wrapper) to opt in. Put `data-stagger` on a parent to cascade its children.
- **One marquee band per page,** plus interaction motion: buttons fill on hover, the FAQ expands smoothly,
  mobile menu links stagger in, and testimonials crossfade (auto-advance every 7s, paused on hover or focus).
- **Reduced motion:** with the OS "reduce motion" setting on, everything shows immediately, counters
  display their final values and the marquee stops. Without JavaScript, all content stays visible.
- **Copy claims** to confirm with the client: "No lock-in contracts", "Fully insured" and "Same crew each
  visit" (v3), the plan inclusions in the v3 "Choose your plan" band, and "QBCC licensed" (taken
  from the accreditation logo).
