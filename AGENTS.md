# AGENTS.md

Rules for anyone changing this repository, people and AI agents alike.

## Language

- README, docs and every code comment are in **English**.
- The UI speaks the 26 languages in `lib/languages` (left-to-right only). Every visible string goes through `useI18n().t('group.key')`; add new keys to `lib/i18n/locales/en.ts` under the screen's group (`common` for words several screens share) and to every other locale, which the types enforce. Dates, sizes and language names use `Intl` with the current `lang`.

## Comments

- A comment is at most **one line**. JSDoc type annotations in `service/` are types, not comments (the service is checked with `// @ts-check`).
- Write a comment only where it is **critically important**: non-obvious webOS behavior, a performance trap, or a coupling between files. Never restate what the code already says.

## Performance (the TV GPU is weak)

- Animate only `opacity` and `transform` (`visibility` for show/hide). No `filter`, `backdrop-filter`, masks, `clip-path` or blend modes; no transitions on `box-shadow`, colors or layout. Stylelint enforces this (`stylelint.config.mjs`).
- Measure on the TV (frame times via DevTools) before and after visual changes.

## Structure

- Every component, hook and lib module lives in its own folder named after it: `components/Tile/Tile.tsx`, `hooks/useApps/useApps.ts`, `lib/files/files.ts`.
- `primitives/` holds components that know nothing about apps, files or settings (`Switch`, `ContextMenu`, `ConfirmDialog`, `Enter`, `List`, `Row`, `ListScreen`, `Panel`, `Pill`, `Screen`); `components/` holds the launcher's own screens and widgets. `primitives` never imports from `components`.
- A hook used by only one component lives inside it: `components/Player/hooks/useAutoHide/useAutoHide.ts`, re-exported from `components/Player/hooks/index.ts` and imported as `./hooks`. Only hooks shared by several components live in `src/hooks`.
- **Types** (including `Props`) go into `types.ts` next to the file; **constants** go into `constants.ts` next to the file. Values computed from other values and mutable module state stay in the file.
- Exception: icons live flat in `app/src/icons`, one hand-written JSX file per icon (`Gear.tsx`) sharing `types.ts`. Take the SVG from Phosphor and keep a single `<path fill="currentColor" d="…" />` in a 256×256 viewBox.

## Code

- Preact + TypeScript in `app/src`. Each component's styles sit beside it: `Tile.module.css`.
- CSS Modules with camelCase class and keyframes names (`styles.tileArt`), hashed at build; Stylelint enforces camelCase. Only tokens (`styles/variables.css`) and the reset (`styles/global.css`) are global.
- The screen is a fixed 1920×1080; sizes are in px. Font sizes, spacing, radii, layers and flat colors come from the tokens in `styles/variables.css` (Stylelint enforces this); a width, height or shadow used once stays in its component. Derive a value with `calc()` rather than writing down the result.
- A component never styles another one: pass state as props (`dimmed`, `hidden`) instead of parent selectors. Components only toggle classes and pass data through CSS variables: `style` takes nothing but `--*` properties, and code never touches `element.style` (oxlint enforces this, `scripts/lint`). A value known at build time is not data: it goes into CSS.
- Types are imported only with `import type` (`verbatimModuleSyntax` in `tsconfig.json` makes anything else a type error).
- No manual `memo`/`useMemo`/`useCallback` for render performance: the React Compiler memoizes components at build time.
- The compiler silently skips a component or hook it can't prove safe; `npm run compiler` (part of `check`) fails instead. Name refs `somethingRef` (it recognizes refs by name) and never write a ref during render: update a latest-callback ref in `useLayoutEffect`.
- Remote key handlers read focus from `useStateRef` refs, never the rendered value.
- webOS wipes every app's localStorage when any app is uninstalled, so it is only a cache for the first frame. The real copies: settings and app order in `/var/lib/sei/state.json` (`lib/state`, service `getState`/`setState`), playback history in `.sei/history.json` on each drive (`lib/resume`, service `readHistory`/`writeHistory`). localStorage itself is touched only through `lib/storage`; persistence logic lives in `lib`, hooks only hold state.
- Lists are controlled: screens get `focus`/`onFocus` from `useNavStack`, which keeps each screen's focus for the way back.
- Tests sit beside the module they cover (`lib/resume/resume.test.ts`) and run with Vitest; pure logic in `lib` gets tests.
- The service's responses use the web app's types (JSDoc `import('../app/src/lib/...')`), so both sides check against one contract.
- Run `npm run check` (tsc for app and service, React Compiler, Vitest, oxlint, stylelint, oxfmt) before committing.
