# Repository Guidelines

Syncnext channel plugins live here; keep contributions reproducible and aligned with the in-app API expectations.

## Project Structure & Module Organization

- Root-level `plugin_*` directories map one-to-one with providers. Each includes `config.json`, executable logic (`app.js`/`main.js`), and helper libraries such as `txml.js`.
- Shared references sit at the repo root: `doc.md` documents `$http`/`$next`, `node_Test.js` is the parsing harness, and `localServer.sh` + `test/` host captured HTML or `.m3u8` payloads.

## Build, Test, and Development Commands

- `npm install` — installs browserify and utility deps required by plugins.
- `node node_Test.js` — runs the reference parser; copy it when stubbing new endpoints or validating JSON structures.
- `npx browserify plugin_wogg/app.js -o plugin_wogg/dist.js` — bundle a plugin into a single file when Syncnext needs packaged output (replace the paths per plugin).
- `bash localServer.sh` — serves `test/` on `http://localhost:8000` for quick manual playback tests against stored fixtures.

## Coding Style & Naming Conventions

- Use 2-space indentation, semicolons, and prefer `const`/`let`; limit `var` to legacy sections.
- Export the canonical entry points (`Home`, `Search`, `Play`, `Category`) expected by Syncnext and avoid polluting the global scope.
- Keep folders snake-cased as `plugin_<provider>` and reuse that prefix in file names plus commit messages for discoverability.
- Break complex scraping into helpers (e.g., `buildMediaData`) and leave concise comments when formatting or signature logic is non-obvious.

## Testing Guidelines

- Ship a deterministic test case per plugin: a Node harness patterned after `node_Test.js` or a fixture in `test/` that mirrors the upstream response.
- Validate inside Syncnext before opening a PR—confirm `$next.toSearchMedias`, `$next.toEpisodes`, and playback helpers emit valid JSON, and strip debug `print()` calls afterwards.

## Commit & Pull Request Guidelines

- Mirror the existing history: short imperative subjects (Chinese or English), scoped prefixes such as `plugin_olevod:` or `config:`, and `[WIP]` only when follow-up commits are expected.
- PR descriptions must call out the plugin(s) touched, the validation commands/fixtures used, and any limitations or VIP-only gaps; attach screenshots or Syncnext logs whenever the UI changes.
- Link Notion tasks or GitHub issues in the body so releases can be traced later.

## Security & Configuration Tips

- Do not commit private API keys or cookies; use placeholders in `config.json` and document how operators should inject secrets at runtime.
- Probe remote URLs with `$http.head` (or a lightweight `$http.fetch`) before surfacing them in `Play` responses to avoid dead or geo-blocked links.
