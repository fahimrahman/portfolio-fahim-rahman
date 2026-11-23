# Fahim Rahman portfolio

A self-contained portfolio about software engineering, solution architecture, and conversational AI, adapted from the supplied portfolio prototype.

Website: https://fahimrahman.github.io/portfolio-fahim-rahman/

## Structure

`index.html` contains the page, styles, scroll choreography, theme switch, and experience dialogs. Visuals use HTML, CSS, and inline SVG. No build step or external dependencies are required.

`assets/` contains the favicon and social preview. The repository also includes a custom `404.html`, a sitemap, and crawler configuration.

## Preview and publish

Serve this folder with any static HTTP server. GitHub Pages publishes the root of `main`; commits to that branch update the site.

## Contact

Email links use the standard `mailto:` protocol. Opening an email application requires a browser and device with a configured mail handler.

## Motion and themes

Scroll updates are throttled with `requestAnimationFrame`. Reduced-motion preferences are supported. The light/dark preference is stored locally and can be supplied through the `theme` query parameter.

The architectural illustrations are explanatory visuals, with no live AI, audio recording, or employer-system connection. The original CV and phone number are not included.
