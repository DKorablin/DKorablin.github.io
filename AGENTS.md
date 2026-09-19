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
| `_config.yml` | Site title, `profiles` (GitHub/GitLab links with an `id`), default layout, `exclude:` (`scripts/`, `AGENTS.md`), compressed Sass |
| `_layouts/default.html` | Page shell: sidebar (`toc.html` + footer with profile links / build time) and `<main>` |
| `_layouts/latest-json.html` | `layout: null` template that renders the newest release of a project as JSON |
| `_includes/toc.html` | Sidebar list; built automatically from every file in `_data/` (sorted by name) |
| `_includes/files_list.html` | Release list (tag, date, files with sizes, "Show N older releases" toggle) |
| `js/files_list.js` | `toggleOlderReleases()` used by `files_list.html` |
| `css/a.scss` | The only stylesheet (front-matter'd, compiled to `/css/a.css`) |
| `_data/<Project>.yml` | Release list for one project, **newest first** |
| `<Project>/index.html` | Project page (description, screenshots, `files_list.html` include) |
| `<Project>/latest.json` | Front-matter-only file using `latest-json` layout; permalink `/<Project>/latest.json` |
| `<Project>/v<X.Y.Z>/...` | Release artifacts (binary files committed to git) |
| `scripts/prune_releases.py` | Deletes old releases (data entries + folders) |
| `README.md` | Doubles as the site home page |

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

The data file name **must equal** the project folder name (the sidebar links to `/<name>`, `latest-json.html` looks up `site.data[page.project]`, and the prune script maps `_data/<name>.yml` -> `<name>/<tag>/`).

## Releases are added externally

New releases are normally committed by the release pipelines of the source repositories (commits like "Add release v1.0.3 for FakeGpsMaui"): they add `<Project>/<tag>/<files>` and prepend an entry to `_data/<Project>.yml`. Do not hand-edit release entries unless asked. When adding a **new project**, create all of:

1. `_data/<Project>.yml`
2. `<Project>/index.html` (front matter `layout: default`, `title: <Project>`; include `{% include files_list.html releases=site.data.<Project> %}`)
3. `<Project>/latest.json` (front matter: `layout: latest-json`, `permalink: /<Project>/latest.json`, `project: <Project>`)

## Release pruning

`scripts/prune_releases.py` keeps the newest `KEEP_COUNT` entries per `_data/*.yml` (env var is **required**, integer >= 1), deletes the dropped `<Project>/<tag>/` folders and rewrites the YAML. It runs quarterly (`0 3 1 */3 *`) on both hosts and commits "Prune old releases":

- GitHub: `.github/workflows/cleanup-releases.yml` (also manually dispatchable; default 5).
- GitLab: `prune-releases` job in `.gitlab/workflows/main.yml`. Disabled unless `ENABLE_PRUNE=true` (so the mirror doesn't diverge from the primary); needs masked variable `PRUNE_TOKEN`.

Run locally: `KEEP_COUNT=5 python scripts/prune_releases.py` (needs `pyyaml`). It is destructive (deletes folders) - check `git status` afterwards.

## Host-specific footer

The footer shows `Built on <time>` only next to the host that produced the build; the other host shows `.`. Detection is via Jekyll's environment (`jekyll.environment`):

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

## Conventions

- Indentation in templates/CSS/JS/HTML is **tabs**; YAML uses 2 spaces.
- Keep the site dependency-free: plain Liquid, vanilla JS, single SCSS file. (Primer CSS is loaded from a CDN in `default.html`.)
- Jekyll only processes files with front matter - `latest.json` and `css/a.scss` start with `---` for that reason.
- GitHub Pages also enables `jekyll-optional-front-matter`, so **any `.md` file without front matter is rendered by Jekyll, including Liquid**. Docs that contain `{% ... %}`/`{{ ... }}` (like this file) must be listed under `exclude:` in `_config.yml`, otherwise the Pages build fails with a Liquid syntax error. Add new non-site markdown files there too.
- Large binaries live in git; avoid adding files that aren't release artifacts or project-page images (`*-200.png` are thumbnails of the full-size image).
- Commit messages in history are short and prefixed by area (e.g. `CI/CD: ...`, `Add release vX for Project`).
