# Fix Plan: Rebrand Cashew (Кешью) support → MarketBox assistant + prize-card wrapping

**Created:** 2026-07-09
**Type:** fix (customer-reported)
**Mode:** fast (no branch, stay on `main`, no tests)

## Settings
- Testing: no (project has no test suite)
- Logging: minimal (link/text/style changes — no runtime logic)
- Docs: warn-only

## Analysis

All "Служба заботы / поддержка / жалоба" flows still point at the **Cashew** bots
(`@cashyou_help`, `Cashyou_help_bot`). Target = the MarketBox assistant bot
`https://t.me/marketbox_asistant_bot` / `@marketbox_asistant_bot` (already used by
the home "МОЙ АССИСТЕНТ" quick action in `QuickActions.tsx`).

Found via codegraph/grep:

**Code deep-links (3):**
- `src/features/profile/ProfileMain.tsx:322` — «Служба заботы» row → `t.me/cashyou_help` (bug 1)
- `src/features/profile/ProfileFaqPage.tsx:11` — `SUPPORT_URL = t.me/cashyou_help`, used by «Написать в поддержку» button (bug 4)
- `src/features/profile/ProfileReportPage.tsx:14` — «Подать жалобу» → `t.me/Cashyou_help_bot` (bug 5)

**FAQ / rules locale text (ru + uz):**
- `public/locales/ru/profile.json:76` — FAQ «Как связаться со Службой заботы?» → `@cashyou_help` (bug 2)
- `public/locales/ru/profile.json:96` — FAQ «Я не нахожу ответ…» → `@cashyou_help` (bug 3)
- `public/locales/ru/profile.json:100` — `rules_text` «По всем вопросам: t.me/cashyou_help» (extra, same rebrand)
- `public/locales/uz/profile.json:77, 97, 101` — uz mirrors of the above

**Prize-card wrapping (bug 6):**
- `src/features/home/components/HomeHeader/HomeHeader.scss` `&__prize-text`
  (5-col grid, 8px font, `-webkit-line-clamp: 4`, `height: 40px`). Long words
  (e.g. «Наставничество», «Аббосом») overflow the ~62px column and get clipped
  mid-word because there is no `overflow-wrap`/`hyphens`. Fix: break long words +
  give one more line of room.

## Fix Steps
1. [ ] Replace the 3 code deep-links → `https://t.me/marketbox_asistant_bot`
2. [ ] Replace `@cashyou_help` → `@marketbox_asistant_bot` in ru FAQ (2) + rules_text URL
3. [ ] Same replacements in uz `profile.json` (2 + rules_text URL)
4. [ ] `HomeHeader.scss` `&__prize-text`: add `overflow-wrap/word-break: break-word; hyphens: auto;`, `-webkit-line-clamp: 4 → 5`, `height: 40px → 50px`
5. [ ] `npx tsc -b` + `npm run build`; bump version → 0.7.9
6. [ ] Deploy to Beget, verify md5, commit `fix(no-ref): …`, push

## Files to Modify
- `src/features/profile/ProfileMain.tsx`
- `src/features/profile/ProfileFaqPage.tsx`
- `src/features/profile/ProfileReportPage.tsx`
- `public/locales/ru/profile.json`
- `public/locales/uz/profile.json`
- `src/features/home/components/HomeHeader/HomeHeader.scss`

## Risks
- Assistant handle spelling `marketbox_asistant_bot` (single "s") — matches existing QuickActions link.
- Prize-text height bump is uniform across all 5 columns → image/status-badge alignment preserved.
