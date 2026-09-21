# Sunny's portfolio

A static, recruiter-focused website built with Astro and TypeScript. It contains
independent project case studies, Markdown/MDX articles, and click-to-load YouTube
walkthroughs. Hosting is prepared for GitHub Pages; deployment is manual.

## Guide outline

1. [Run the website locally](#run-the-website-locally)
2. [Find the right file](#find-the-right-file)
3. [Add a new article](#add-a-new-article)
4. [Add a new project](#add-a-new-project)
5. [Add a new video](#add-a-new-video)
6. [Modify or unpublish existing content](#modify-or-unpublish-existing-content)
7. [Add images, links, and code](#add-images-links-and-code)
8. [Update your profile, résumé, and design](#update-your-profile-résumé-and-design)
9. [Validate and deploy](#validate-and-deploy)
10. [Troubleshooting](#troubleshooting)

## Run the website locally

Use Node.js 22.12 or later and npm. CI uses Node 22. Run these commands in
PowerShell from the repository folder:

```powershell
Set-Location D:\projects\portfolio_website
npm ci
npm run dev
```

Open the local address printed in the terminal, including `/portfolio/`.
The usual address is [http://localhost:4321/portfolio/](http://localhost:4321/portfolio/).
Saving a source file updates the development site automatically.

To inspect the production output:

```powershell
npm run build
npm run preview
```

Production preview serves the last build. After further edits, rebuild and refresh
the browser. Do not edit `dist/`: it is generated and overwritten during builds.

## Find the right file

| What you want to change                        | Location                 |
| ---------------------------------------------- | ------------------------ |
| Articles                                       | `src/content/articles/`  |
| Project case studies                           | `src/content/projects/`  |
| Video descriptions and YouTube IDs             | `src/content/videos/`    |
| Starter content files                          | `templates/`             |
| Contact links, description, résumé path        | `src/config.ts`          |
| Homepage introduction and sections             | `src/pages/index.astro`  |
| About page narrative                           | `src/pages/about.astro`  |
| Header, footer, shared metadata                | `src/layouts/Base.astro` |
| Colors, typography, spacing, responsive styles | `src/styles/global.css`  |
| Public images and PDFs                         | `public/`                |
| Required content fields and validation         | `src/content.config.ts`  |
| Automated checks and manual deployment         | `.github/workflows/`     |

Content files have two parts: YAML metadata between the opening `---` lines
(called **frontmatter**), followed by the Markdown body. You can edit these files
in Notepad++, VS Code, or another text editor. Save as UTF-8.

Use lowercase, hyphenated filenames without spaces. A file such as
`src/content/articles/my-rag-notes.md` becomes `/portfolio/articles/my-rag-notes/`.
Use `.md` for ordinary writing; use `.mdx` when embedding Astro components.

### Drafts and dates

- New content defaults to `draft: true` if the field is omitted.
- Drafts are excluded from detail pages, listings, the homepage, RSS, and sitemap,
  **including during local development**.
- To preview a draft page, temporarily set `draft: false` locally. Restore
  `draft: true` before sharing a change that should remain unpublished.
- Files in a public GitHub repository are readable even when marked as drafts.
- Dates use `YYYY-MM-DD`. A future date does **not** schedule publication:
  `draft: false` includes the entry in the next build regardless of its date.
- Setting `draft: false` changes build eligibility; the live site only changes
  after a successful deployment.

## Add a new article

1. Copy the starter file, choosing a filename that is not already in use:

   ```powershell
   Copy-Item templates/article.md src/content/articles/my-rag-notes.md
   ```

2. Open the new file and replace its metadata and body. For example:

   ````markdown
   ---
   title: 'RAG notes: choosing chunk boundaries'
   summary: An explanation of the tradeoffs behind a chunking strategy.
   tags: [RAG, Python, Retrieval]
   draft: true
   published: 2026-09-21
   ---

   Introduce the question and explain why it matters.

   ## The approach

   Describe the implementation and the reasons for your choices.

   ```python
   print("Replace this with a useful example")
   ```

   ## Evidence and limitations

   Explain what was tested and what remains unknown.
   ````

3. Use `##` headings for sections; the article's table of contents uses those
   headings automatically. The page already renders the title, so avoid a second
   `#` title in the body.
4. Temporarily set `draft: false` and preview
   `/portfolio/articles/my-rag-notes/` locally.
5. Follow [validation and deployment](#validate-and-deploy) when ready to publish.

Required article fields are `title`, `summary`, and `published`. Optional fields
include `tags`, `cover`, and `updated`. Articles appear newest first; the homepage
shows the three latest published articles. To record a later substantive edit,
keep the original `published` date and add `updated: 2026-09-22` with the actual date.

## Add a new project

1. Copy the project template:

   ```powershell
   Copy-Item templates/project.md src/content/projects/my-project.md
   ```

2. Replace the metadata. The repository URL below is a placeholder to replace
   with the actual project URL:

   ```yaml
   ---
   title: My project
   summary: The problem this project solves and the approach taken.
   tags: [Python, Applied AI]
   draft: true
   repository: https://github.com/sunshine-engineer/portfolio
   status: In progress
   featuredOrder: 3
   ---
   ```

3. Complete the template's sections: problem, architecture, your contribution,
   technical decisions, validation, and limitations/next steps.
4. Set `draft: false` for local preview at `/portfolio/projects/my-project/`.

Project-specific fields:

| Field           | Behavior                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------- |
| `repository`    | Required full repository URL                                                                |
| `status`        | Required: exactly `In progress`, `Portfolio prototype`, or `Complete`                       |
| `featuredOrder` | Optional positive integer; includes the project on the homepage, with smaller numbers first |
| `demo`          | Optional full URL of an actual working demo                                                 |
| `video`         | Optional video filename without its extension, such as `agentic-walkthrough`                |

Use distinct featured-order values for predictable ordering. Remove
`featuredOrder` to remove a project from the homepage while keeping its listing
and detail page. Related video links are hidden while that video is a draft.

Keep professional production experience distinct from independent portfolio work.
Include actual evidence for metrics, deployment claims, and test results.

## Add a new video

1. Upload your recording to YouTube and allow embedding. Do not commit the video
   file to this repository.
2. Copy the template:

   ```powershell
   Copy-Item templates/video.md src/content/videos/my-walkthrough.md
   ```

3. Edit the metadata and body:

   ```yaml
   ---
   title: My project walkthrough
   summary: What the viewer will see and learn.
   tags: [Walkthrough, Agents]
   draft: true
   published: 2026-09-21
   # Add the real ID before publishing:
   # youtubeId: YOUR_VIDEO_ID
   # Optional references to existing content:
   project: agentic-demo
   article: evidence-before-confidence
   ---
   ```

4. Extract the actual eleven-character ID from your YouTube URL. For
   `https://www.youtube.com/watch?v=ABCDEFGHIJK`, the ID is `ABCDEFGHIJK`.
   Add `youtubeId: <your actual ID>` using the real value, without angle brackets.
   Do not paste the complete URL into this field.
5. Write a summary and optional timestamps below the metadata. Add a local
   thumbnail with `cover: images/my-walkthrough.webp` if available.
6. Change `draft` to `false`, open `/portfolio/videos/my-walkthrough/`, and check
   both the play button and the direct YouTube link.

Published videos require a YouTube ID. `project` and `article` reference existing
content filenames, without extensions; omit them if unrelated. A project's
`video` reference is separate: add it to the project if you also want its case
study to link back to the video.

The YouTube iframe loads only after the play button is pressed. Browser tests
verify activation with an intercepted player request, not actual YouTube playback.

## Modify or unpublish existing content

1. Locate the existing file in the appropriate `src/content/` directory.
2. Edit the text below the frontmatter, or adjust metadata such as `title`,
   `summary`, `tags`, `status`, or `cover`.
3. Preserve its filename to preserve its URL. Changing the title does not change
   the URL.
4. For a substantive article revision, update the optional `updated` date while
   retaining its original `published` date.
5. Preview the detail page and listing, then validate and redeploy.

Examples already in this repository:

- `src/content/projects/autodocs.md`
- `src/content/projects/agentic-demo.md`
- `src/content/articles/evidence-before-confidence.mdx`
- `src/content/videos/agentic-walkthrough.md` (unpublished recording outline)

To **unpublish**, set `draft: true` and redeploy. The generated page, listing entry,
feed entry, and sitemap entry will be removed. Previously shared URLs will stop
working; this does not erase Git history or external copies.

To **delete**, remove the source file and remove any references to its filename
from other entries. Do not delete shared images until you confirm nothing uses them.

To **rename**, update all links and content references as well. Automatic redirects
are not implemented; prefer keeping an established filename.

## Add images, links, and code

Put small, optimized images in `public/images/`. A cover field is relative to
`public/`, so use `cover: images/my-diagram.svg`, not a local Windows path or
`public/images/my-diagram.svg`. Public assets are served unchanged.

In an ordinary Markdown body, use the configured site base path:

````markdown
![Architecture showing ingestion and retrieval](/portfolio/images/my-diagram.svg)

[Read the agent case study](/portfolio/projects/agentic-demo/)

[View the source](https://github.com/sunshine-engineer/AgenticAI_Demo)

```python
print("Syntax highlighting is selected by the code-fence language")
```
````

Replace example image paths with actual files. Use descriptive image alt text.
Root-relative Markdown links beginning `/portfolio/` must be updated if the site's
base path changes. A plain relative link resolves from the rendered page URL,
not from the source-file folder.

Inside `.astro` or `.mdx` components, use the `href()` helper from `src/config.ts`
for internal links. For an article directly inside `src/content/articles/`, an
MDX example is:

```mdx
import { href } from '../../config';

<a href={href('projects/')}>Explore all projects</a>
```

Place MDX imports after the frontmatter. Astro's `Image` component is available
for imported raster assets when you need build-time optimization; the supplied
SVG diagrams and public covers are served directly.

## Update your profile, résumé, and design

- Edit `src/config.ts` to change email, LinkedIn, GitHub, shared description, and
  résumé path. Empty email, LinkedIn, and résumé fields are hidden.
- Add your real PDF at `public/resume.pdf`, then set `resume: 'resume.pdf'` in
  `src/config.ts`. This enables download links on the homepage and About page.
  Test the download after building.
- Edit `src/pages/index.astro` for the homepage introduction and experience line.
  Edit `src/pages/about.astro` for the About narrative and skill groups.
- The visible name, branding, and some page text are currently written directly
  in page/layout files. Changing `profile.name` or `profile.title` alone does not
  update every visible label; inspect `src/layouts/Base.astro` too.
- Edit the CSS variables at the start of `src/styles/global.css` for shared
  colors. The same file contains typography, spacing, and mobile breakpoints.
- Replace `public/social-card.png` to change the sharing image. Its SVG source
  is included; editing the SVG alone does not regenerate the PNG.

## Validate and deploy

### Local checks

For a content-only change, preview it and run:

```powershell
npx prettier --write README.md src/content templates
npm run check
npm run build
npm run preview
```

Check spelling, links, images, dates, code blocks, and mobile readability. A
successful schema check does not verify factual claims or external-link availability.

For layout or behavior changes, also run:

```powershell
npm run format:check
npx playwright install chromium
npm test
```

Build before `npm test`; the suite uses production preview on port 4322. Tests
create temporary content fixtures, remove them afterward, and rebuild the clean
production output. CI runs formatting checks, Astro checks, the build, and browser
tests for pull requests and pushes to `main`.

### Publish or update the live site

Deployment is **manual only**. Saving files or pushing a commit does not update
the live site automatically.

1. Review your changes and confirm which entries have `draft: false`.
2. Commit the intended source changes and push them through your normal review
   workflow to `main`. Commit `package-lock.json` when dependencies change;
   do not commit generated output, secrets, or video files.
3. For the first deployment, select **GitHub Actions** under repository
   **Settings → Pages**.
4. In **Actions → Deploy to GitHub Pages → Run workflow**, choose `main`.
5. Wait for both validation and deployment to succeed.
6. Verify the homepage, changed pages, images, résumé if configured, and feeds at
   [the portfolio URL](https://sunshine-engineer.github.io/portfolio/).

Use this same manual workflow for subsequent content updates. Failed validation
blocks deployment. To roll back, restore the last known-good source through your
Git workflow and deploy again.

For a custom domain, update `site` and `base` in `astro.config.mjs`, update the RSS
origin in `src/pages/rss.xml.ts`, adjust hardcoded Markdown base paths and test
expectations, configure Pages/DNS, and verify the result before publishing.

## Troubleshooting

| Symptom                                       | What to check                                                                                                                                            |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New content is missing or its URL returns 404 | Set `draft: false` for preview, check the filename-derived URL, and include `/portfolio/`.                                                               |
| Edits do not appear in production preview     | Run `npm run build` again and refresh the browser.                                                                                                       |
| Live website still shows old content          | Push the reviewed change, then manually run the deployment workflow.                                                                                     |
| Build reports a schema/frontmatter error      | Check YAML indentation, required fields, exact status values, date formats, and full URLs. Quote titles containing a colon.                              |
| A video fails validation                      | Supply the actual eleven-character YouTube ID before setting `draft: false`.                                                                             |
| YouTube player cannot play                    | Confirm the recording is available and embedding is allowed; try the direct YouTube link.                                                                |
| Image is broken                               | Verify spelling and case, ensure the file exists, and check the `/portfolio/` base path. Hosting is case-sensitive.                                      |
| Related content link is absent                | Check that the referenced filename exists and the target has `draft: false`.                                                                             |
| Project is absent from the homepage           | Give the published project a positive `featuredOrder`.                                                                                                   |
| Résumé link is absent                         | Add the real PDF and configure `profile.resume`.                                                                                                         |
| Browser tests report stale fixtures           | Ensure no test run is active, then remove only the named `test-player-fixture.md` and `test-draft-fixture.md` files reported by the test setup; rebuild. |

## Content evidence and maintenance

The initial case studies summarize project READMEs inspected on September 21,
2026; their project tests were not rerun for this website. AutoDocsGenAI's source
README contains inconsistent stage-status descriptions, so its case study limits
its claims. Update those pages when verified project evidence changes.

The first article is included as published content in the build; review its wording
before deploying publicly. The video outline remains a draft until a real recording
is available.

Keep credentials out of source files. Use the committed npm lockfile for repeatable
installs and review dependency upgrades. TypeScript currently stays on 6.x because
the installed Astro checker requires its programmatic API.
