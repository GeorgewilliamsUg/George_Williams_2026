---
applyTo: "**"
---

# Security, Safety & Code Quality Instructions for GitHub Copilot

These instructions apply to all files in this workspace. When suggesting or generating code, always follow the guidelines below.

---

## 1. Security — Vulnerability Prevention (OWASP Top 10)

- **Injection (SQL, HTML, JS, Command)**: Never concatenate user input directly into queries, commands, or markup. Always sanitize, escape, or use parameterized inputs.
- **XSS (Cross-Site Scripting)**: Escape all dynamic content before inserting it into the DOM. Never use `innerHTML` with untrusted data; prefer `textContent` or a safe rendering function.
- **Broken Access Control**: Do not expose sensitive resources or operations without authorization checks. Never trust client-side values for access decisions.
- **Sensitive Data Exposure**: Do not hardcode credentials, API keys, tokens, or secrets. Do not log or expose personal or sensitive data in output, comments, or URLs.
- **Security Misconfiguration**: Do not leave debug flags, verbose error messages, or permissive CORS/CSP policies in production code.
- **Insecure Deserialization**: Never deserialize untrusted data without validation. Avoid `eval()`, `Function()`, and dynamic code execution from user input.
- **Using Components with Known Vulnerabilities**: Flag any dependency that appears outdated or known to have CVEs.
- **Insufficient Logging & Monitoring**: Avoid silently swallowing errors. Surface failures in a controlled, non-leaking way.

---

## 2. Input Validation & Output Encoding

- Validate all input at system boundaries — forms, URL params, API responses, file reads.
- Enforce expected types, lengths, formats, and ranges.
- Always encode output appropriate to context: HTML entities for HTML, JSON encoding for JSON responses, URL encoding for URLs.
- Never trust data from the DOM, URL parameters, `localStorage`, or external APIs without validation.

---

## 3. Safe JavaScript / HTML Practices

- Avoid `eval()`, `with()`, `document.write()`, and `innerHTML` with dynamic data.
- Use `strict mode` (`"use strict"`) in all JS files.
- Prefer `const` over `let`, and avoid `var`.
- Use `===` instead of `==` for all comparisons.
- Keep functions small and single-purpose.
- Use event delegation and remove listeners when no longer needed to avoid memory leaks.
- Avoid storing sensitive data in `localStorage` or `sessionStorage`.

---

## 4. Clean Code Principles

- **Naming**: Use clear, descriptive names for variables, functions, and files. Avoid abbreviations and single-letter names except in tight loops.
- **Functions**: Each function should do one thing only. If a function is doing more than one thing, split it.
- **No magic numbers**: Replace literal values with named constants.
- **DRY (Don't Repeat Yourself)**: Extract duplicated logic into reusable functions or modules.
- **Dead code**: Remove unused variables, functions, imports, and commented-out blocks.
- **Short functions**: Aim for functions under 20–30 lines. Long functions should be refactored.
- **Single Responsibility**: Each file or module should have one clear purpose.

---

## 5. Code Structure & Architecture

- Separate concerns: keep HTML for structure, CSS for presentation, and JS for behavior.
- Group related code together; avoid mixing unrelated logic in the same function or file.
- Use consistent file and folder naming conventions (kebab-case for HTML/CSS files, camelCase for JS).
- Avoid deep nesting; prefer early returns and guard clauses.
- Modularize code — if a JS file grows beyond ~150 lines, consider splitting it.
- Keep configuration values (URLs, thresholds, labels) at the top of a file or in a dedicated config section.

---

## 6. Error Handling

- Always handle errors explicitly; never silently ignore `catch` blocks.
- Show user-facing errors in a friendly, non-technical way. Never expose stack traces or internal details to the UI.
- Use `try/catch` around all async operations and external resource fetches.
- Log errors to the console only in development; suppress or send to a logging service in production.

---

## 7. Performance & Resource Safety

- Avoid blocking the main thread with heavy synchronous operations.
- Use `async/await` or Promises for all I/O-bound operations.
- Clean up timers (`clearTimeout`, `clearInterval`) and event listeners when components are destroyed.
- Avoid repeated DOM queries — cache references to DOM elements.
- Do not load unused assets or libraries.

---

## 8. Dependency & Third-Party Code Safety

- Do not blindly copy code from external sources without reviewing it for security issues.
- Avoid loading scripts from untrusted CDNs without Subresource Integrity (SRI) hashes.
- Minimize third-party dependencies; prefer native browser APIs when capable.
- Flag any `npm` or external package that is unfamiliar, overly broad in scope, or hasn't been updated recently.

---

## 9. Accessibility & Standards Compliance

- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`).
- All images must have meaningful `alt` attributes.
- Ensure sufficient color contrast for text.
- Forms and interactive elements must be keyboard-navigable and labeled.
- Follow the HTML5 standard; avoid deprecated tags and attributes.

---

## 10. Code Review Checklist (apply when reviewing or suggesting changes)

Before finalizing any code suggestion, verify:

- [ ] No hardcoded secrets, tokens, or credentials
- [ ] No use of `eval()` or `innerHTML` with dynamic data
- [ ] All user inputs are validated and sanitized
- [ ] All errors are handled — no empty `catch` blocks
- [ ] No unused variables, imports, or dead code
- [ ] Functions are small, named clearly, and single-purpose
- [ ] No magic numbers or unexplained literals
- [ ] Output is encoded for its context (HTML, URL, JSON)
- [ ] No sensitive data logged or exposed in the UI
- [ ] Code is readable without needing comments to explain it
