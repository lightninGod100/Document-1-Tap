# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Document 1 Tap** (`com.document1tap.app`) — an offline, biometric/PIN-locked vault for personal documents (IDs, cards, PDFs). Expo SDK 54 + React Native 0.81 + expo-router + react-native-paper (MD3). There is **no backend**: all data lives in AsyncStorage, SecureStore, and the app's private file directory.

## Commands

```bash
npm start            # expo start (dev server)
npm run android      # expo start --android
npm run lint         # expo lint (eslint-config-expo flat config)
npx tsc --noEmit     # typecheck (strict mode is on)
```

No test framework is configured — there are no tests to run.

`npm run reset-project` is a leftover from the Expo template; `scripts/reset-project.js` does not exist. Don't run it.

**Expo Go will not work.** The app depends on native modules (`expo-share-intent`, `expo-local-authentication`, `expo-secure-store`, `expo-intent-launcher`), so a development build is required:

```bash
npx expo run:android          # local prebuild + install (native dirs are gitignored)
eas build --profile development --platform android
```

`eas.json` defines `development` (dev client, internal), `preview` (internal), and `production` (autoIncrement) profiles. `/android` and `/ios` are gitignored — native config changes belong in `app.json`, never in generated native folders.

## Architecture

### Provider stack (`app/_layout.tsx`)

Order matters and is load-bearing:

```
ShareIntentProvider → GestureHandlerRootView → SafeAreaProvider →
ThemeProvider (wraps PaperProvider) → AuthProvider → CategoryProvider →
DocumentProvider → AuthGate → <Slot />
```

`AuthGate` gates the *entire* router: while `isFirstLaunch` it renders `app/auth/pin-setup`, while `!isAuthenticated` it renders `app/auth/lock-screen`, and only then does `<Slot />` mount. Any screen added under `app/` is therefore behind auth by construction.

### Data layer — contexts are the source of truth

Three context files in `src/contexts/` own all persistence. Screens never touch AsyncStorage directly; they call context methods and read from the in-memory arrays (e.g. `documents.find(d => d.id === id)`).

| Store | Key / location |
| --- | --- |
| Documents metadata | AsyncStorage `@document1tap_documents` |
| Categories | AsyncStorage `@document1tap_categories` (seeded from `DEFAULT_CATEGORIES` on first launch) |
| Theme preference | AsyncStorage `@document_1_tap_theme` |
| PIN lockout / failed attempts | AsyncStorage `@doc1tap_lockout_until`, `@doc1tap_failed_attempts` |
| PIN | SecureStore `doc1tap_user_pin` |
| Document files | `Paths.document/documents/doc_<timestamp>.{jpg,pdf}` |

Every mutation is read-modify-write of the whole array followed by a single `AsyncStorage.setItem`. When adding a storage key, also update `src/utils/clearData.ts` — clear-all deliberately removes *specific* keys (never `AsyncStorage.clear()`) so PIN, theme, and lockout state survive.

**File system API:** use the SDK 54 synchronous `File` / `Directory` / `Paths` classes from `expo-file-system`. The legacy async API is imported in exactly one place (`src/utils/openPdfViewer.ts`, for `getContentUriAsync`) and should stay that way. `addDocument`/`updateDocument` copy the picked file into the app directory before saving; `updateDocument` deletes the replaced file, `deleteDocument` deletes the file then the record.

### Auth model (`src/contexts/AuthContext.tsx`, `src/utils/auth.ts`)

Tiered re-auth driven by `AppState` transitions:

- background < 30 s → stays unlocked
- 30–120 s → biometric only (`requiresPinEntry = false`)
- \> 120 s or cold start → biometric **and** PIN

`completeBiometricAuth(needsPin)` and `unlock()` are the two ways to reach the authenticated state. PIN entry is rate-limited: 5 failed attempts → 30 s lockout.

`authenticateForShare()` is a *separate* gate for sensitive actions and is required before sharing a document (`app/document/[id].tsx`) and before clearing all data (`app/(tabs)/settings.tsx`). Add it to any new action that exposes document contents.

### Screens and list plumbing

`app/(tabs)/` holds Categories (`index`), All Docs, Starred, Settings, with a global FAB in `(tabs)/_layout.tsx` routing to `/add-document`. Detail screens (`category-detail`, `document/[id]`, `add-document`, `add-category`) live at the root of `app/`.

All four document lists (All Docs, Starred, category detail) render through `src/components/DocumentListScreen.tsx`, which composes search → `useSortFilter` (filters first, then multi-criterion sort) → `DocumentList`. Two details to preserve when touching it:

- Search/sort/filter state is cached in a **module-level `Map` keyed by `stateKey`**, not in context. `useFocusEffect` wipes the entry on blur *unless* `preserveFiltersOnBlur` was set by tapping into a document — that is what makes filters survive back-navigation but reset on tab switch. Each caller must pass a unique `stateKey`.
- `app/document/[id].tsx` takes a `source` param (`'all-docs'` / `'starred'`) and overrides the Android hardware back button to `router.navigate` back to the right tab instead of `router.back()`.

`app/add-document.tsx` serves three roles: create, edit (param `id`, prefills from `documents`), and share target (params `sharedUri` / `sharedMimeType` / `sharedName`).

### Share intent

Configured in `app.json` for Android only (`disableIOS: true`), accepting `image/*` and `application/pdf`. `ShareIntentHandler` in `app/_layout.tsx` picks the first matching file and pushes `/add-document` with the shared params, then calls `resetShareIntent()`.

### Theming

`src/theme/theme.ts` extends `MD3LightTheme`/`MD3DarkTheme` with the brand palette (primary `#EC5265`). `ThemeContext` resolves `system | light | dark`, mounts `PaperProvider`, and syncs the Android navigation bar. **Always take colors from Paper's `useTheme()`** rather than hardcoding — a few older screens hardcode hex values and those are the exception, not the pattern. Category colors are the deliberate exception (stored per-category on the `Category` record).

Icons are MaterialCommunityIcons name strings (`category.icon as any`); the pickable set is `CATEGORY_ICONS` in `src/utils/constants.ts`.

## Known gaps to be aware of

- `Category.documentCount` is stored but never recomputed — `updateCategoryDocCount` exists in `CategoryContext` and is called by nothing, so the counts on `CategoryCard` are stale (always the seeded 0). Any work on category counts starts here.
- `deleteCategory` does not reassign documents to `cat_uncategorized` (TODO in `src/contexts/CategoryContext.tsx`), even though the confirmation dialog in `app/(tabs)/index.tsx` promises it. Deleting a custom category currently orphans its documents' `categoryId`.
- The PIN is stored in SecureStore as plaintext (no hashing).
- `SHARE_APP_URL` in `app/(tabs)/settings.tsx` points at a placeholder package name and must be fixed before release.
- `tsconfig.json` declares an `@/*` path alias that nothing uses; imports are all relative (`../src/...`).
