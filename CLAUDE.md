# shannonhecker-portfolio

Project-scoped instructions for Claude Code working in this portfolio repo.

## Clarify-first

Global rule applies: ask one clarifying question per turn, every request (including in auto mode), until nothing is left to ask. Escape phrases: `"just do it"` / `"go"` / `"ship it"`. Full checklist in `~/.claude/skills/clarify-first/SKILL.md`.

Walk the 8-category checklist on every request:

1. Which project / where
2. Scope — in/out
3. Stakeholders / audience
4. References / examples
5. Design / visual decisions
6. Technical approach
7. Constraints / risks _(weighted heavier)_
8. Success criteria

**Portfolio-specific things to always clarify before building:**

- **Which case study / project page?** `project-*.html` files are case studies; each has its own layout and tone. Ask which one and whether the change should apply to one or ripple across the set.
- **Homepage vs. case study vs. shared shell?** `index.html`, `about.html`, and case study pages share CSS (`assets/*.css`) but have distinct purposes. Clarify scope before editing shared assets.
- **Public-facing, so:** every change is shipped work. Ask about tone, voice, and whether draft copy needs review before going live on the `CNAME`-mapped domain.
- **Design-system consistency:** tokens and components live in the sibling `sh-tokens/` repo (`~/Documents/Cursor/sh-tokens/`). If a change belongs at the token level, raise it there rather than in page-local CSS.
- **Links/case-study recruiter experience:** many pages target hiring managers. Ask about audience framing (design-lead? engineering-lead? founder?) before committing to voice/depth.
