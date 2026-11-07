# pack-list ♡✧

Спільний чек-лист для переїзду на двох: «мій список ♡» і «його список ✧», realtime-синхронізація через Firestore, працює офлайн.

Дизайн-референс: [design/checklist-design.html](design/checklist-design.html).

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
`households/main/lists/{her|his}`: `{ name, theme, sections: [{ id, sym, title, note, items: [{ id, text, sub, done }] }], updatedAt }`.
Якщо документів немає, застосунок засіває їх початковими даними (в транзакції).

## Правила Firestore
Застосунок без входу: правила ([firestore.rules](firestore.rules)) відкривають читання й запис лише двох документів списків, решту бази заборонено.

```sh
npx firebase-tools login
npm run deploy:rules
```

## Деплой
Пуш у `main` → GitHub Actions ([deploy.yml](.github/workflows/deploy.yml)) збирає сайт із secrets `VITE_FIREBASE_*` і публікує на GitHub Pages.
