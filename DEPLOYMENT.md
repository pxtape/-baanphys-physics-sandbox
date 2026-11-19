# M1-01.5 — GitHub repository and continuous deployment

Status: **COMPLETE**, live HTTP and Chrome verification recorded 2026-11-19.
M1-02 is NOT STARTED and awaits separate approval.

- Repository: https://github.com/pxtape/-baanphys-physics-sandbox
- Public preview: https://pxtape.github.io/-baanphys-physics-sandbox/
- Successful first main deployment: https://github.com/pxtape/-baanphys-physics-sandbox/actions/runs/44270951839
- Successful development checks: https://github.com/pxtape/-baanphys-physics-sandbox/actions/runs/44269819955
- First deployed application/configuration commit: `268e98dd60cfc280c0bb1274777450cce93cba6e`.

## Repository and history

The owner created `pxtape/-baanphys-physics-sandbox` with a leading hyphen. It was
found by public repository search after the originally planned spelling returned
404. The repository was empty and Pages was already configured for Actions.
The integration can push source/workflows but cannot rename repositories (HTTP
403), so the existing name is retained. No further owner setup is required for
the current deployment. This supersedes the earlier creation-permission blocker.

M0 `65dfde9`, M0.5 `f1f5ad0`, M1-01 `97d0fa8`, and deployment `268e98d` are preserved.
The `origin` remote uses a credential-free HTTPS URL. Stable `main` and development
branch `chore/m1-01-5-pages` were both pushed. The deployment branch passed checks
before main advanced via fast-forward. There was no force-push, overwritten
remote/history, credential commit or change to physics thresholds.

## Continuous deployment

`.github/workflows/deploy.yml` uses Node **24** and exact lockfiles:

1. Root `npm ci`, typecheck, lint and 23 architecture boundary tests.
2. Python 3.12 with pinned jsonschema, then 25 M0 structural fixtures.
3. Isolated PoC `npm ci --ignore-scripts` and all 13 existing verification tests.
4. Production build and the actual built-artifact Pages HTTP smoke check.
5. Upload/deploy `dist/` only for successful main runs; PR/development checks do
   not deploy. The deploy job depends on checks and uses Pages/OIDC permissions
   in the `github-pages` environment. No personal token/custom secret is needed.

Official actions are pinned to release SHAs. All original tests and archived
physics failures remain intact; a successful deployment does not certify rolling
or any new mechanics. Only built application files in dist are deployed to Pages.

## Verification evidence

First main run `44270951839` completed successfully, including checks/build and
Pages deployment. Public requests to the project index and a refreshed request
both returned **200 text/html**, each 627 bytes. Deployed assets also returned 200:

| Asset | MIME type | Bytes |
| --- | --- | --- |
| `assets/index-CS1v1vVh.js` | application/javascript | 220668 |
| `assets/index-BBEM1tkN.css` | text/css | 1709 |

The public project URL was opened and reloaded in shared Chrome. The React
foundation page and stylesheet rendered correctly after refresh. The public
HTTPS link does not require local development services or sign-in and can be
opened from an iPad; **physical iPad/Safari testing has not been performed**.
This remains a foundation preview, with no scene editing or simulation controls.

## Local and future deployment commands

Use Node 24+ in this checkout:

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run test:m0
npm --prefix poc/engine-comparison ci --ignore-scripts
npm run test:poc
npm run build
npm run test:pages
npm run preview
```

The preview is http://localhost:4173/-baanphys-physics-sandbox/. Vite's base is
`/-baanphys-physics-sandbox/` in development and production. The smoke check
starts a temporary production preview on loopback port 4175 and checks the index
twice plus JavaScript/CSS paths, status and MIME types.

For later work use a feature branch, run checks and open a PR into main. Prefer
requiring **Checks and build** in branch rules where available. Only merging or
pushing main publishes; never force-push. The workflow can also be dispatched
manually on main. To inspect a run:

```sh
gh run list --repo pxtape/-baanphys-physics-sandbox --workflow deploy.yml
gh run watch RUN_ID --repo pxtape/-baanphys-physics-sandbox --exit-status
gh api repos/pxtape/-baanphys-physics-sandbox/pages --jq .html_url
```

Pages does not provide arbitrary SPA history fallbacks. Refresh verification
currently covers the project index; future `/player/...` routes need an explicit
routing solution before that feature is published. No router, domain/scene model,
production physics adapter or timestep change was introduced by this task.
