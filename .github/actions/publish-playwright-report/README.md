# Publish Playwright report to external repo

This action publishes a Playwright HTML report into a separate repository so it can be served
by GitHub Pages without adding artifacts to the main repo history.

## GitHub setup (one-time)

1) Create the reports repository: `bigbluebutton/bigbluebutton-ci-playwright-reports`.
2) Enable GitHub Pages for that repo:
   - Settings -> Pages
   - Source: Deploy from a branch
   - Branch: `main` (or the default branch)
   - Folder: `/ (root)`
3) Create a fine-grained PAT:
   - Settings -> Developer settings -> Personal access tokens -> Fine-grained tokens
   - Repository access: Only `bigbluebutton/bigbluebutton-ci-playwright-reports`
   - Permissions: Contents -> Read and write
4) Add the token as a secret in the base repo (`bigbluebutton/bigbluebutton`):
   - Settings -> Secrets and variables -> Actions
   - New repository secret: `PLAYWRIGHT_REPORTS_REPO_TOKEN`

## Inputs

- `reports-repo`: `owner/name` of the reports repository.
- `token`: token with `contents: write` on the reports repo.
- `pr-number`: pull request number for the `pr-<number>/` folder.
- `report-path`: local path to the Playwright report directory.
