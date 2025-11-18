# GitHub Toolkit — TODO

This small frontend project provides a few GitHub utilities: generate repository ZIP links and view public profile/recent repos.

## Tasks

- [ ] Improve UX for ZIP generator (validation, clearer errors)
- [ ] Add tests (basic smoke tests for UI flows)
- [ ] Add caching / rate-limit handling for GitHub API requests
- [ ] Add deploy instructions (GitHub Pages / Netlify)
- [ ] Add CI for linting and basic checks

## Files added in this change

- `todo.md` — this file (project tasks and run instructions)
- `package.json` — minimal npm config and helpful scripts

## Run locally

Install Node.js (if you don't have it). To serve the static site locally, run:

```powershell
npm start
```

This project uses `npx http-server` via the `start` script to serve the current folder on port 8080.

## Notes / Next steps

- Consider adding a small backend or serverless function to proxy GitHub API requests if you hit rate limits.
- Add simple unit/visual tests for `script.js` flows.
