# AGENTS.md

Guidance for AI agents working in this repository.

## What this repo is

A static **Jekyll** site that distributes builds of private apps/libraries (APKs, zips) directly, instead of through an app store. It is deployed to **two hosts at once**:

- **GitHub Pages** (primary, branch `main`) - built by GitHub's built-in Jekyll build, no workflow needed.
- **GitLab Pages** (mirror) - `main` is pushed to GitLab by `.github/workflows/gitlab-sync.yml`; GitLab builds it with `.gitlab/workflows/main.yml`.

There is no application code and no test suite. The "code" is Liquid templates, YAML data, one SCSS file, one small JS file and one Python script.

## Layout

| Path | Purpose |
|---|---|
| `_config.yml` | Site title, `profiles` (GitHub/GitLab links with an `id`), `groups` (sidebar/home sections with an `id`, `name`, `color`), default layout, `exclude:` (`scripts/`, `AGENTS.md`, `README.md`), compressed Sass |
| `_layouts/default.html` | Page shell: mobile top bar (burger), sidebar (`toc.html` + footer with profile links / build info), overlay and `<main>` |
| `_layouts/project.html` | Project page: hero (icon, title, tagline, platform badges), download buttons for the latest release, `files_list.html`, then the page content with an "On this page" list |
| `_layouts/latest-json.html` | `layout: null` template that renders the newest release of a project as JSON |
| `index.html` | Home page: intro plus a card grid per group, built from the project pages |
| `_includes/toc.html` | Sidebar navigation; every page using `layout: project`, grouped by `group` (order from `_config.yml`) and sorted by `project` |
| `_includes/project_card.html` | Home page card for one project |
| `_includes/files_list.html` | Release history (latest highlighted, older releases in a `<details>`); called by `project.html` |
| `_includes/filesize.html` | Formats a byte count (`B`/`KB`/`MB`/`GB`) |
| `js/lightbox.js` | Enlarges images in a `.gallery` on click (plain links without JS) |
| `js/page_toc.js` | Builds the "On this page" list from the `h2`/`h3` of a project page |
| `css/a.scss` | The only stylesheet (front-matter'd, compiled to `/css/a.css`) |
| `_data/<Project>.yml` | Release list for one project, **newest first** |
| `<Project>/index.html` | Project page: front matter (see below) plus the description HTML, screenshots, etc. |
| `<Project>/latest.json` | Front-matter-only file using `latest-json` layout; permalink `/<Project>/latest.json` |
| `<Project>/v<X.Y.Z>/...` | Release artifacts (binary files committed to git) |
| `scripts/prune_releases.py` | Deletes old releases (data entries + folders) |
| `scripts/remove_release.py` | Deletes one specific release (data entry + folder) |
| `README.md` | Repository readme only (excluded from the site; the home page is `index.html`) |

Projects currently: AutoClickerMaui, FakeGpsMaui, Flatbed-Dialog, Flatbed-Dialog-Lite, Flatbed-MDI, Flatbed-MDI-Avalon, Flatbed-MDI-AvaloniaUI, Flatbed-WorkerService.

## Data model

`_data/<Project>.yml` is a YAML list, newest first (index 0 is "latest" - `latest.json` and the toc rely on this):

```yaml
- tag: "v1.0.3"
  date: "2026-09-12"
  files:
    - name: "FakeGpsMaui-main-.apk"
      url: "/FakeGpsMaui/v1.0.3/FakeGpsMaui-main-.apk"
      size: 29399862        # bytes
```

The data file name **must equal** the project folder name (`project.html`, the home cards and `latest-json.html` look up `site.data[page.project]`, and the prune script maps `_data/<name>.yml` -> `<name>/<tag>/`). The sidebar and home page are built from the `layout: project` pages, so a `_data` file without a project page is not listed.

## Releases are added externally

New releases are normally committed by the release pipelines of the source repositories (commits like "Add release v1.0.3 for FakeGpsMaui"): they add `<Project>/<tag>/<files>` and prepend an entry to `_data/<Project>.yml`. Do not hand-edit release entries unless asked. When adding a **new project**, create all of:

1. `_data/<Project>.yml`
2. `<Project>/index.html` with this front matter, followed by the description (no `<h1>`: the layout renders it; start sections at `<h2>`):
   ```yaml
   layout: project
   title: Display name          # sidebar, card, hero and <title>
   project: <Project>           # must equal the folder / _data file name
   group: apps                  # an `id` from `groups` in _config.yml
   icon: AB                     # 2-3 letters for the coloured tile
   tagline: One-line summary
   platforms: [Android 5.0+, .NET MAUI]
   ```
3. `<Project>/latest.json` (front matter: `layout: latest-json`, `permalink: /<Project>/latest.json`, `project: <Project>`)

## Release pruning

`scripts/prune_releases.py` keeps the newest `KEEP_COUNT` entries per `_data/*.yml` (env var is **required**, integer >= 1), deletes the dropped `<Project>/<tag>/` folders and rewrites the YAML. It runs quarterly (`0 3 1 */3 *`) on both hosts and commits "Prune old releases":

- GitHub: `.github/workflows/cleanup-releases.yml` (also manually dispatchable; default 5).
- GitLab: `prune-releases` job in `.gitlab/workflows/main.yml`. Disabled unless `ENABLE_PRUNE=true` (so the mirror doesn't diverge from the primary); needs masked variable `PRUNE_TOKEN`.

Run locally: `KEEP_COUNT=5 python scripts/prune_releases.py` (needs `pyyaml`). It is destructive (deletes folders) - check `git status` afterwards.

### Removing one specific release

`scripts/remove_release.py` deletes a single release: the entry in `_data/<PROJECT>.yml` and the `<PROJECT>/<VERSION>/` folder (env vars `PROJECT` and `VERSION` are **required**; `PROJECT` must match an existing `_data` file, `VERSION` an existing tag; it refuses to remove a project's only release). Commits "Remove release <VERSION> of <PROJECT>". Manual only:

- GitHub: `.github/workflows/remove-release.yml` (Actions > Remove release > Run workflow; inputs `project`, `version`).
- GitLab: `remove-release` job in `.gitlab/workflows/main.yml`. Run a pipeline manually with `ENABLE_PRUNE=true`, `REMOVE_PROJECT`, `REMOVE_VERSION`; same `PRUNE_TOKEN` as pruning. When `REMOVE_VERSION` is set, `prune-releases` is skipped so the two jobs never push concurrently.

Run locally: `PROJECT=AutoClickerMaui VERSION=v1.1.7 python scripts/remove_release.py`.

## Host-specific footer

The sidebar footer always links to every profile and shows `Built on <host>` plus the build time for the host that produced the build. Detection is via Jekyll's environment (`jekyll.environment`):

- GitHub Pages builds with `JEKYLL_ENV=production` (cannot be changed) -> treated as GitHub.
- The GitLab `pages` job sets `JEKYLL_ENV: gitlab` -> treated as GitLab.
- Profiles in `_config.yml` have `id: github` / `id: gitlab`; the layout matches the current host to a profile `id`. Adding a host means: new profile with `id`, and a matching `JEKYLL_ENV` value in that host's build.

## CI/CD notes

- GitLab CI config is `.gitlab/workflows/main.yml` (the project's "CI/CD configuration file" must point there). A root-level `.gitlab-ci.yml` exists **untracked** and is a stale experiment (references `master`); do not edit it, and do not treat it as the source of truth.
- Default branch is `main` (moved from `master`). The mirror push in `gitlab-sync.yml` targets `main` on `gitlab.com/DKorablin/dkorablin.gitlab.io`.
- `Gemfile` uses the `github-pages` gem so local/GitLab builds match GitHub Pages' Jekyll/Sass versions.

## Local preview

```
bundle install
bundle exec jekyll serve      # http://127.0.0.1:4000
JEKYLL_ENV=gitlab bundle exec jekyll serve   # preview the GitLab footer variant
```
Check the mobile layout at <= 700px width (browser dev tools): burger in the top bar opens the sidebar.

## Conventions

- Indentation in templates/CSS/JS/HTML is **tabs**; YAML uses 2 spaces.
- Keep the site dependency-free: plain Liquid, vanilla JS, single SCSS file. Primer CSS (loaded from a CDN in `default.html`, *before* `a.css`) provides the base styles, `btn`/`Label`/`Counter`/`flash`/`markdown-body` components and the light/dark theme (`data-color-mode="auto"` on `<html>`). Use its CSS variables (`var(--color-fg-muted)`, ...) in `a.scss` instead of hard-coded colors so dark mode keeps working.
- The mobile sidebar (<= 700px wide) is off-canvas and toggled by the `#nav-toggle` checkbox with CSS only; keep the checkbox, `.topbar` burger label, `.sidebar` and `.nav-overlay` siblings in that order or the `~` selectors stop matching.
- Project page content is plain HTML wrapped by `.markdown-body` (Primer styles tables, code, lists). It is HTML, not Markdown: `**bold**` or backticks will show up literally. Screenshots: `<div class="gallery"><a href="full.png"><img src="thumb-200.png" alt="..."></a></div>`.
- Jekyll only processes files with front matter - `latest.json` and `css/a.scss` start with `---` for that reason.
- GitHub Pages also enables `jekyll-optional-front-matter`, so **any `.md` file without front matter is rendered by Jekyll, including Liquid**. Docs that contain `{% ... %}`/`{{ ... }}` (like this file) must be listed under `exclude:` in `_config.yml`, otherwise the Pages build fails with a Liquid syntax error. Add new non-site markdown files there too.
- Large binaries live in git; avoid adding files that aren't release artifacts or project-page images (`*-200.png` are thumbnails of the full-size image).
- Commit messages in history are short and prefixed by area (e.g. `CI/CD: ...`, `Add release vX for Project`).
