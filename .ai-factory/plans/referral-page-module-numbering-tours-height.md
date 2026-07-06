# План: реферальная страница + нумерация модулей + адаптивная высота туров

**Branch:** main (без feature-ветки, деплой напрямую на Beget)
**Создан:** 2026-06-18
**Тип:** feature + 2 enhancement
**Версия после:** 0.6.0 (новая фича — интеграция /referral/page)

## Settings
- **Testing:** no — проверка `tsc -b` + `vite build` + точечный Playwright
- **Logging:** minimal — только WARN/ERROR
- **Docs:** no (warn-only)
- **Roadmap:** none

## Roadmap Linkage
Milestone: "none" — Rationale: артефакта ROADMAP нет.

## Решения (подтверждено)
- `/referral/page` подключаем **в hero-карточку на `/money`** (туда ведёт тайл «ПРИГЛАСИ ДРУГА»). Сейчас hero фейково берётся из первого урока-модуля (`moneyLessons[0]`) — меняем источник на реальный `/referral/page`. Тайл остаётся на `/money`, новый роут не создаём.

## Разведка (факты)
- **Эндпоинт:** `GET /api/referral/page` (Swagger tag «Контент»), ответ — **голый объект** (НЕ обёрнут в `{data}`):
  `{ id:int, title, preview_text, description, video_url, video_preview }` (поля — строки; бэк, вероятно, уже локализует по заголовку `lang`). Интерцептор такой объект не трогает (нормализация только при `meta.current_page`/массиве).
- **Видео-паттерн** уже есть: Kinescope/YouTube `<iframe src={video_url}>` + постер `video_preview`; см. `LessonCard.tsx` (постер→iframe по тапу), `LessonDetailPage.tsx`, `LessonPreviewPage.tsx`. Переиспользуем.
- **MoneyPage hero:** `src/features/money/MoneyPage.tsx` — `moneyLessons[0]` → `heroTitle/heroThumb`, тап ведёт на `/lessons/:id`, есть кнопки «избранное» и «материалы» (это фичи урока, у реф-страницы их нет).
- **Модули:** `MarketplaceCoursesPage.tsx` — плитка `__module-tile` (height 150px) это просто `BackendImage` (текст вшит в картинку) + замок. Номера нет → нужен **оверлей-бейдж** по индексу `modules.map((mod, i) => …)`.
- **Туры:** `ChinaGuideListPage.tsx` `TourCard` (блок `cg-tours`), футер `&__glass-bar { min-height: 108px }` в `ChinaGuideToursPage.scss` — это и есть «большая пустая область»; текста на 1 строку.
- В dev API мокается MSW (`src/mocks/handlers.ts` + `stubs.ts` + `fixtures.ts`) — для нового эндпоинта нужен мок.

## Tasks

### Фаза 0 — Баг: индикаторы прогресса в хедере подарков
0. **Замочки/плитки открываются по прогрессу** — `src/features/home/components/HomeHeader/HomeHeader.tsx`.
   - **Корень бага:** счётчик «N/M» и полоса берутся из `passed_count` (`passedCount`), а нижние замочки (`__check--done`) и статусы плиток (`__prize-status--unlocked`, «ОТКРЫТО/ЗАКРЫТО») — из per-item `gift.is_passed`. На бэке они рассинхронизированы: `passed_count = 1`, но у всех `is_passed = false` → «1/5» показывает прогресс, но ни первый замок, ни первая плитка не открываются.
   - **Фикс:** ввести `const unlocked = gift.is_passed || i < passedCount` (gifts уже отсортированы по `order`, `passedCount` = число пройденных). Использовать `unlocked` вместо `gift.is_passed` в обоих местах:
     - нижний ряд (`__check` / `__check--done`) — первые `passedCount` замочков активны (`opacity: 1`);
     - плитки (`__prize-status` / `--unlocked` + текст `contest.unlocked/locked`).
   - Так первый индикатор открыт при 1/5 и открываются дальше по мере продления. Визуал «открыто» = существующий `--done` (opacity 1); отдельный глиф открытого замка не добавляем (есть только `check.svg`) — при желании заказчика это отдельная задача на ассет.

### Фаза 1 — Реферальная страница (видео)
1. **API-слой `/referral/page`** —
   - `src/api/types.ts`: добавить `interface ReferralPage { id: number; title: string; preview_text: string; description: string; video_url: string; video_preview: string }`.
   - `src/api/endpoints.ts`: в `referralApi` добавить `getPage: () => apiClient.get<ReferralPage>('/api/referral/page')` (ответ — голый объект; читать `r.data`). lang уходит хедером через интерцептор.
   - **Мок:** `src/mocks/fixtures.ts` — `mockReferralPage: ReferralPage` (с рабочим kinescope `video_url` + `video_preview`); `src/mocks/handlers.ts` (+`stubs.ts` при необходимости) — `GET /api/referral/page` → объект.
2. **Хук + hero на /money** —
   - Хук `useReferralPage()` (рядом с money или в `src/features/money/hooks`): `useQuery({ queryKey:['referral','page',lang], queryFn: referralApi.getPage().then(r=>r.data), staleTime: 5*60_000, throwOnError:false, retry:1 })`. `throwOnError:false` — `/money` не должен падать, если эндпоинт лёг.
   - `MoneyPage.tsx`: hero-карточку наполнять из `referralPage` (title, preview_text/description, постер `video_preview`, видео `video_url`). Видео играть **инлайн** по тапу (постер→iframe, паттерн `LessonCard`). Лесон-специфичные элементы (избранное/материалы/переход на `/lessons/:id`) скрывать, когда hero питается реф-страницей. **Фолбэк без регрессии:** если `referralPage` пуст/ошибка — оставить текущий `moneyLessons[0]`-hero.

### Фаза 2 — Нумерация модулей
3. **Бейдж-номер на плитке модуля** —
   - `MarketplaceCoursesPage.tsx`: `modules.map((mod, i) => …)` → внутри `__module-tile` добавить `<span className={bem(b,'module-number')} aria-hidden>{i + 1}</span>`.
   - `MarketplaceCoursesPage.scss`: `&__module-number` — позиционированный бейдж (напр. top-left), тёмная/glass подложка, белый `$font-gilroy` 800, читаемый поверх картинки. Не перекрывать замок (`__module-lock`, он top-right — разнести по углам).

### Фаза 3 — Высота карточки тура
4. **Адаптивная высота `cg-tours__glass-bar`** —
   - `ChinaGuideToursPage.scss`: заменить `min-height: 108px` на сайз-по-контенту (убрать min-height либо малое значение + вертикальный `padding`), чтобы футер обнимал текст. Проверить, что `&__date-badge`/`&__glass-text` не ломаются и кнопка «Подробнее» примыкает корректно.

### Фаза 4 — Проверка и деплой
5. **tsc + build + deploy** — `npx tsc -b`; `npm run build`; точечный Playwright там, где достижимо (dev + MSW: хедер подарков — первый замок/плитка открыты при passed_count≥1; /money hero c видео; список модулей с номерами; карточка тура). Bump `package.json` → **0.6.0**, rebuild, rsync на Beget, md5-сверка.

## Commit Plan
- Чекпоинт A (0): `fix(home): contest header unlocks by progress (passed_count)`
- Чекпоинт B (1–2): `feat(money): drive referral hero from /api/referral/page`
- Чекпоинт C (3): `feat(courses): number module tiles`
- Чекпоинт D (4): `fix(tours): card footer height adapts to text`
- Чекпоинт E (5): bump 0.6.0 + deploy
(Коммитим только по явной просьбе; деплой напрямую с main.)

## Риски / на что смотреть
- Форма ответа `/referral/page`: Swagger обещает голый объект со строками. Если реальный бэк вернёт `{data:…}` или локализованные `{ru,uz}` — поправить чтение в хуке (проверить на живом API при impl, либо через токен).
- Безопасность `/money`: `throwOnError:false` + фолбэк обязателен, чтобы новый эндпоинт не уронил денежный экран.
- Бейдж модуля не должен налезать на замок премиум-модулей.
