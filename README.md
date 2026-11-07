# pack-list ♡✧

Спільний чек-лист для переїзду на двох: «мій список ♡» і «його список ✧», realtime-синхронізація через Firestore, працює офлайн.

## Дизайни
Три дизайни з перемикачем у шапці (вибір зберігається в localStorage):
- **ретро** (за замовчуванням) — [design/new design.html](design/new%20design.html), код у [src/designs/retro/](src/designs/retro/);
- **класика** — [design/checklist-design.html](design/checklist-design.html), код у [src/designs/classic/](src/designs/classic/);
- **матриця** — [design/matrix design.html](design/matrix%20design.html) (друга сторінка дошки), код у [src/designs/matrix/](src/designs/matrix/).

Класика й матриця вантажаться ліниво. Дані, режими й логіка спільні: [src/hooks/useLists.ts](src/hooks/useLists.ts), [src/data/](src/data/). Теми кожного дизайну — CSS-змінні, обмежені класом `.retro` / `.classic` / `.matrix`.

## Стек
Vite + React + TypeScript, CSS modules з CSS-змінними для тем, Firebase Cloud Firestore (модульний SDK, `persistentLocalCache`).

## Локально
```sh
cp .env.example .env   # заповнити конфігом веб-застосунку Firebase
npm install
npm run dev            # http://localhost:5173/pack-list/
npm run build
```

## Дані
`households/main/lists/{her|his}`: `{ name, theme, sections: [{ id, sym, short, title, note, items: [{ id, text, sub, done }] }], updatedAt }`.
Якщо документів немає, застосунок засіває їх початковими даними (в транзакції). Розділам без `short` (засіяним першою версією) мітка додається автоматично.

## Правила Firestore
Застосунок без входу: правила ([firestore.rules](firestore.rules)) відкривають читання й запис лише двох документів списків, решту бази заборонено.

```sh
npx firebase-tools login
npm run deploy:rules
```

## Деплой
Пуш у `main` → GitHub Actions ([deploy.yml](.github/workflows/deploy.yml)) збирає сайт із secrets `VITE_FIREBASE_*` і публікує на GitHub Pages.
