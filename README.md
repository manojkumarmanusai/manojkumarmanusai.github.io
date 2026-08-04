# manojkumarmanusai.github.io

Personal portfolio and online CV of **Manoj Kumar** — Software Engineer based in Bangalore, India.

**Live site:** [https://manojkumarmanusai.github.io/](https://manojkumarmanusai.github.io/)

## Features

- **Dark / light theme toggle** — dark by default, with the choice persisted in `localStorage`. First-time visitors get their OS color-scheme preference. The toggle lives in the nav menu on desktop and stays always visible next to the hamburger on mobile.
- **Scroll-linked animations** — sections animate in on entry and out on exit while scrolling, with direction-aware exits and staggered reveals. Fully disabled for users with `prefers-reduced-motion`.
- **Interactive scroll progress bar** — a slim bar under the navbar tracks reading progress; clicking anywhere along it jumps to that position on the page.
- **Animated skill charts** — easy-pie-chart donuts that lazy-initialize on scroll and re-render with theme-appropriate colors when the theme changes.
- **Experience & education timeline** — alternating cards with tech-stack tags.
- **Contact form** — posts to a Google Apps Script endpoint, with client-side validation (jqBootstrapValidation), a honeypot field for spam, and input length limits.
- **SEO ready** — JSON-LD `Person` structured data, Open Graph / Twitter Card metadata, `robots.txt`, `sitemap.xml`, and a themed `404.html` for GitHub Pages.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Markup / styling | HTML5, CSS3 (custom properties for theming), Bootstrap 3.4.1 |
| Scripting | jQuery 3.7.1, vanilla JS (IntersectionObserver, matchMedia) |
| Charts | easy-pie-chart |
| Smooth scrolling | SmoothScroll |
| Form validation | jqBootstrapValidation |
| Fonts / icons | Google Fonts (Inter, Open Sans), Font Awesome 6 |
| Backend (contact form) | Google Apps Script |
| Hosting | GitHub Pages |

## Project Structure

```
.
├── index.html          # Single-page site
├── 404.html            # Themed error page served by GitHub Pages
├── css/
│   ├── bootstrap.min.css
│   └── style.css       # All custom styles and theme variables
├── js/
│   ├── main.js         # Theme toggle, animations, charts, progress bar
│   ├── contact_me.js   # Contact form submission
│   └── ...             # jQuery, Bootstrap, plugins
├── img/                # Images
├── resume/             # Downloadable resume (PDF)
├── robots.txt
└── sitemap.xml
```

## Theming

All colors flow from CSS custom properties defined in `css/style.css`. The dark palette lives under `:root` and the light palette under `[data-theme="light"]`. An inline script in `<head>` applies the saved (or OS-preferred) theme before first paint to avoid a flash, and `js/main.js` keeps the toggle buttons, the `theme-color` meta tag, and the chart colors in sync.

## Running Locally

No build step — it's a static site. Serve the folder with any static server:

```bash
python3 -m http.server 9000
```

Then open [http://localhost:9000](http://localhost:9000).

> **Note:** The contact form posts to a live Google Apps Script endpoint, so submissions from local testing are delivered for real.

## License

Personal project — content © Manoj Kumar.
