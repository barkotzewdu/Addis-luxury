# CRITICAL RULES - MUST FOLLOW

## RESPONSES

- Keep responses concise and to the point - unless the user asks otherwise

## PLANNING MODE

- Always ask clarifying questions
- Never assume design, tech stack or features

## TESTING

- Use any testing tools, libraries available to the project for testing your changes
- Never assume your changes simply work, always test!
- If the project does not have any testing tools, scripts, MCP tools, skills, etc. available for testing, ask the user whether testing should be skipped.

## UI DESIGN

- Always follow the UI design system when creating or reviewing components or pages.
- Design System: @DESIGN.md

## PLAYWRIGHT MCP (BROWSER AUTOMATION & VISUAL TESTING)

Playwright MCP gives real browser control (navigate, click, type, screenshot). Defined in `opencode.json` under `mcp` as `playwright` (`default_npx @playwright/mcp@latest`). Requires Node.js; first run downloads it via npm.

Available tools (24): `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_press_key`, `browser_hover`, `browser_take_screenshot`, `browser_wait_for`, `browser_resize`, `browser_find`, `browser_tabs`, `browser_evaluate`, `browser_network_requests`, `browser_console_messages`, `browser_handle_dialog`, `browser_select_option`, `browser_fill_form`, `browser_file_upload`, `browser_drag`, `browser_drop`, `browser_navigate_back`, `browser_close`, `browser_network_request`, `browser_run_code_unsafe`.

### Usage rules

- USE ONLY WHEN NECESSARY. Skip the browser unless either: (a) the user explicitly asks you to use it, or (b) you cannot confidently proceed without seeing the page (e.g. layout/UI clarification needed). If you fully understand the prompt, skip it to save time.
- Workflow: `browser_navigate` -> `browser_snapshot` (read live DOM, prefer over `evaluate`) -> `browser_click`/`browser_type` -> `browser_wait_for` -> screenshot.
- When used, test desktop and mobile (resize to 375x812) when layout changes; step through multi-page flows and screenshot each page.
- `file://` URLs are blocked by default. Serve locally (`npx serve .`) or add `--allow-unrestricted-file-access` to `opencode.json` args.
- If browser tools are unavailable, ask the user to restart opencode (MCP reconnect).
- Run is headed by default; add `--headless` for automated runs.

## DEPLOYMENT (`gh` CLI only — no git)

Repo `barkotzewdu/Addis-luxury` (private, branch `main`). Git is NOT installed. Push via GitHub Git Data API with `gh api`:

1. `GET /repos/{repo}/commits/main` -> `headSha`, tree sha.
2. `POST /git/blobs` per file: `{content:<base64>,encoding:"base64"}`.
3. `POST /git/trees`: `{base_tree:<tree sha>,tree:[{path,mode:"100644",type:"blob",sha}]}`.
4. `POST /git/commits`: `{message,tree,parents:[headSha]}`.
5. `PATCH /git/refs/heads/main`: `{sha,force:false}`.

Pipe JSON via `--input -`. `base_tree` keeps repo-only files. Deploy only: `*.html`, `css/`, `js/`, `images/`, `.htaccess`, `sitemap.xml`, `AGENTS.md`. Exclude `.playwright-mcp/`, `.opencode/`, `opencode.json`.