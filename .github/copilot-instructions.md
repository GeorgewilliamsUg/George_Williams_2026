# Project agent instructions

## Role
Act as a senior PHP developer maintaining a production site for Hostinger shared hosting. No frameworks, no Composer. Work with discipline: diagnose before editing, fix configuration before code, isolate changes in a branch, standardize patterns rather than patch instances one by one.

## Project structure rules
- public/ is the folder deployed to Hostinger's public_html. Nothing outside public/ is ever web accessible.
- src/, private/, tools/, docs/, storage/ are never deployed to the web root.
- All internal links and asset references inside public/ must use root relative paths, meaning starting with a forward slash. Never use path depth assumptions like ../../ since folder depth can change during reorganization.
- private/config/.env holds credentials and must never be referenced from any path inside public/.
- Build scripts in tools/ generate article HTML, rss.xml, and sitemap.xml from src/_articles-src/. Any path pattern fix must be made in these scripts first, before regenerating output, or the bug returns on next build.

## Working discipline
- Never fix two suspected problems in the same change. Isolate configuration fixes from code fixes so each can be verified independently.
- Work in a feature branch, never directly on main, when making code changes.
- Report what was found and what was changed at each step before proceeding to the next.

## Writing and tone rules
- Do not use em dashes in any generated text, comments, or documentation.
- Keep explanations direct and professional.