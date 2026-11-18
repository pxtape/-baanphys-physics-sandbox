# M1-01.5 — GitHub repository and deployment handoff

Status: repository found on 2026-11-18 at `pxtape/-baanphys-physics-sandbox`; deployment in progress. The leading hyphen is retained because the integration cannot rename repositories. M1-02 is not started.

## What exists

- Local M0 commit `65dfde9`, M0.5 commit `f1f5ad0`, and M1-01 commit `97d0fa8`
  are preserved. Deployment changes are on `chore/m1-01-5-pages`, separate from
  stable `main` until checks and publication are ready.
- `.github/workflows/deploy.yml` uses Node 24, `npm ci` with exact lockfiles,
  typecheck, lint, 23 architecture tests, 25 M0 schema fixtures, 13 PoC verification
  tests, production build and an actual built-artifact HTTP smoke check.
- Only a successful `main` run can upload/deploy `dist/`. PR/development runs
  cannot deploy. Permissions are read-only for checks; only the deploy job gets
  Pages write and OIDC. Official actions are pinned to verified release SHAs.
- Vite uses `/-baanphys-physics-sandbox/`. `npm run test:pages` starts the real
  production preview on loopback port 4175 and checks the project index twice,
  JavaScript and stylesheet URLs, nonempty responses and correct MIME types.
- No secrets, token values or credential-bearing remote URLs are committed.
  No remote was configured for an uncreated/inaccessible repository. There was
  no force-push, remote replacement, public deployment or M1-02 implementation.

## Historical authorization blocker (resolved by owner creation)

`gh auth status` and `gh api user` succeed as **pxtape** with network permission.
Both the GitHub connector and CLI return 404 for the requested repository.
`gh repo create pxtape/-baanphys-physics-sandbox --public` was actually attempted
and denied: **GraphQL: Resource not accessible by integration (createRepository)**.
This is GitHub's permission denial, not a failed application check. No repository
was created. Do not retry by overwriting a repository or changing visibility of
unrelated existing data.

Intended repository: `https://github.com/pxtape/-baanphys-physics-sandbox`.
Intended project website: `https://pxtape.github.io/-baanphys-physics-sandbox/`.
**Neither address has been verified as created/live.** These are configuration
and handoff targets only, not completed deliverables.

## Original owner setup instructions (historical)

1. Sign in to GitHub as **pxtape** and create an **empty public** repository named
   **baanphys-physics-sandbox**. Do not initialize a README, license or gitignore:
   the local history/files already exist. If that repository already exists,
   inspect it and its history first; do not overwrite or force-push it.
2. Give the connected GitHub app access to that specific repository. Pushing
   source plus this workflow needs **Contents: read/write** and **Workflows:
   read/write**. Verification needs **Actions: read** (write to dispatch/re-run).
   Enabling/configuring Pages via API needs **Pages: read/write** and
   **Administration: read/write**. App permissions may be fixed: merely selecting
   the repository does not grant missing app permissions. Re-authorize through
   the normal account/integration UI if supported; never share a token in chat.
3. In repository **Settings → Pages**, select **Source: GitHub Actions**. Ensure
   Actions are enabled and official actions are permitted by account/org policy.
   Keep the `github-pages` environment restricted to stable `main` deployments.
4. If this integration cannot receive the required access, perform the remaining
   commands on your own trusted computer with an authorized GitHub CLI login:

   ```sh
   gh auth login --hostname github.com --git-protocol https --scopes repo,workflow
   gh auth setup-git
   ```

   Existing `GH_TOKEN`/`GITHUB_TOKEN` variables override stored CLI authentication;
   clear those locally if they point to the restricted integration. Do not put
   credentials into Git remotes/files. A classic PAT needs `repo` and `workflow`
   scopes; a fine-grained token needs the repository permissions above. For
   manually configured Pages, no personal access token is stored in Actions:
   the workflow uses the automatically issued `GITHUB_TOKEN` and OIDC.

## Push without replacing history

Run in this existing checkout after the empty repository exists and access works:

```sh
git remote -v
# Only if origin is absent; never overwrite an existing remote:
git remote add origin https://github.com/pxtape/-baanphys-physics-sandbox.git
git ls-remote --heads origin
# A newly created repository should be empty. Stop on unrelated existing history.
git push -u origin chore/m1-01-5-pages
git switch main
git merge --ff-only chore/m1-01-5-pages
git push -u origin main
```

The first push publishes the checked development branch. The fast-forward keeps
all original commits and advances stable main without rewriting history; main
then runs the complete checks and deployment. For subsequent changes, prefer
feature branches and PRs into main. Where branch rules are available, require
**Checks and build** before merge. Never use `--force`. If an existing repository
has different history, stop and reconcile it explicitly rather than replacing it.

## Verify the external deployment

```sh
gh run list --repo pxtape/-baanphys-physics-sandbox --workflow deploy.yml
gh run watch RUN_ID --repo pxtape/-baanphys-physics-sandbox --exit-status
gh api repos/pxtape/-baanphys-physics-sandbox/pages --jq .html_url
```

Open the actual URL returned by GitHub on desktop and iPad. Confirm the BaanPhys
foundation page renders, JavaScript/CSS return 200 with correct MIME types in
browser developer tools, and refreshing the project index works. Record the
successful Actions URL, deployed commit and live checks in PROGRESS.md before
marking M1-01.5 complete. Neither a passing local smoke test nor a successful push
alone proves Pages is deployed. Real iPad testing remains a manual check.

Pages does not provide arbitrary SPA history fallbacks. Current verification
covers the project index only; future `/player/...` URLs need a separately agreed
routing solution before that feature is published. No domain/physics/scene-model
change or timestep adjustment is part of this deployment task.

## Repository discovery — 2026-11-18

The owner-created public repository was found as `pxtape/-baanphys-physics-sandbox`
(with a leading hyphen), empty and with main as the default branch. Both the
connector and CLI can access it; Pages is configured for workflow deployments.
A rename to the originally planned name was attempted but denied by the
integration with HTTP 403. The existing name is retained rather than requiring
more owner setup. Vite and the artifact smoke check now use
`/-baanphys-physics-sandbox/`. The package name and architecture are unchanged.
The historical missing-repository status above no longer describes current access.
