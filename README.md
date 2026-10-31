# Mohd Saif — Personal Portfolio

A dependency-free, responsive portfolio for Mohd Saif. The site is built with semantic HTML, CSS and vanilla JavaScript, so it runs as a static site and needs no package installation or build step.

## Run locally

From this folder, start any static file server. For example:

```powershell
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000). You can also open `index.html` directly, though a local server is a better way to preview navigation and asset paths.

## Update personal details

Edit `profile.js`. It holds Saif’s name, location, education, introduction, GitHub profile and portrait paths. Only the supplied GitHub account is linked.

The profile image areas currently use original SVG placeholders that do not depict a real person. To add a real portrait, place it at `images/saif-portrait.webp`, then set `media.portrait.available` to `true` in `profile.js`. To replace the abstract avatar, place the stylised avatar at `images/saif-avatar-placeholder.webp` and set `media.avatar.available` to `true`. The existing placeholders remain as the fallback.

## Add a real project

Edit the array in `projects.js`. Each entry can include:

```js
{
  title: "Project title",
  description: "What it does and what you built.",
  technologies: ["HTML", "CSS", "JavaScript"],
  image: "images/project-name.webp", // optional
  imageAlt: "A clear description of the screenshot.",
  demoUrl: "https://example.com", // optional
  repoUrl: "https://github.com/saif011hr/example" // optional
}
```

The projects area shows a GitHub invitation while the array is empty. Add only projects and links that are real and ready to share.

## Customize the design

- `index.html` contains the page sections and navigation.
- `style.css` contains the visual system, responsive layouts, theme colors and reduced-motion rules.
- `script.js` contains the theme switch, responsive menu, skill filters, command palette, scroll progress, reveal effects and project rendering.
- `404.html` is the matching not-found page.
- `images/` contains the original placeholder artwork and favicon.

The hero monogram is an original inline SVG with CSS pointer-driven tilt. It does not need WebGL or a 3D library, and has no image or model download. The portrait and avatar are replaceable SVG placeholders. The site respects `prefers-reduced-motion` and disables pointer effects on touch devices.

## Deploy

This is a static site. On Vercel, select the **Other** framework preset, leave the build command empty, and use the project folder as the output directory. The same folder can be hosted by GitHub Pages or any static web host. No environment variables or server-side services are required.
