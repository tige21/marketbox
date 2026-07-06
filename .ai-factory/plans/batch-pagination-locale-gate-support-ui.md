# План: батч — пагинация, локали/SW, платёжный гейт, поддержка, UI

**Branch:** main (без ветки, деплой напрямую на Beget)
**Создан:** 2026-06-21
**Тип:** fix-батч (7 проблем)
**Версия после:** 0.7.0

## Settings
- **Testing:** no
- **Logging:** minimal (WARN/ERROR)
- **Docs:** warn-only

## Roadmap Linkage
Milestone: "none" — артефакта ROADMAP нет.

## Разведка (подтверждено живым API с токеном)
- **Пагинация — настоящая причина «добавленные фабрики не отображаются»:** `/api/fabrics/12/sections/6/companies` → `meta.total = 38`, `last_page = 3`, `per_page = 15`. Сейчас грузится только страница 1 → **23 компании теряются**. Это НЕ кэш (RQ-кэш уже выключен). Бэк **игнорирует** `?per_page=100`/`?limit=100` (остаётся 15), но **чтит** `?page=N`. `/api/fabrics` сам — 4 страны, 1 страница (не проблема).
- **Локали/SW — причина сырого ключа «CHANNEL_BUTTON»:** `src/sw.ts` отдаёт `/locales/*.json` через **`staleWhileRevalidate`** (строка ~107) → после деплоя рисует СТАРЫЙ `factories.json` без ключа `channel_button` → `t()` возвращает ключ. Свежий тянется только в фоне, к следующему разу.
- **Курсы валют:** `externalExchange` → `baseCurrency: 'UZS'`, rates = **сум за 1 единицу** (1 USD ≈ 12195 сум). На экране базовая валюта не подписана.
- **Платёжный гейт:** `AppLayout` `gateOpen = authState==='ok' && !isPremium`; `isPremium` из `/api/user` `subscription.is_actual` (AuthProvider). После оплаты `is_actual` обновляется на бэке, но локально `isPremium` стаёт `true` только после `retryAuth` (есть на `visibilitychange`) → гейт мелькает, пока идёт перезапрос.
- **Обложки:** `LessonCard.scss __thumb-wrap { aspect-ratio:16/9 }`, `__thumb { object-fit:cover; object-position:center }` — не-16:9 обложки кропаются (текст срезается).
- **Подарки:** `HomeHeader.scss __prizes { grid 5 col }`, `__prize` (flex-колонка) — текст призов разной длины → картинки/бейджи на разной высоте.
- **Поддержка:** `ProfileMain` support-row ведёт на `marketbox_asistant_bot`; `ProfileFaqPage` упоминает `@cashyou_help` текстом. Нужен редирект-кнопка на `https://t.me/cashyou_help`.

## Tasks

### Фаза 1 — Данные (критично)
1. **Догрузка всех страниц пагинации** — `src/api/endpoints.ts` (или `src/api/*`):
   - Добавить хелпер `fetchAllPages<T>(fetchPage: (page:number)=>Promise<{data:T[]; meta?:{totalPages?:number}}>)`: тянет стр.1, читает `meta.totalPages`, параллельно догружает 2..N (`Promise.all`), склеивает `data`. (Бэк чтит `?page=N`, игнорит `per_page`.)
   - Применить к list-хукам, бьющим в Laravel-пагинированные эндпоинты: **companies** (`useFabricSectionCompanies` — подтверждено), а также `courses`/`modules`/`fabric sections`/`articles`(news)/`cargo`/`china-guide`/`design-services`/`wholesale` list — везде, где может быть >15. Каждый queryFn: `fetchAllPages(page => api.getX({...,page}).then(r=>r.data))`, `select: r=>r.data`. Проверить, что соответствующие endpoint-функции принимают `page` (PaginationParams).

### Фаза 2 — Локали / Service Worker
2. **SW: локали — networkFirst** — `src/sw.ts`: для `/locales/*.json` заменить `staleWhileRevalidate` на `networkFirst` (попытка сети → свежий JSON со всеми ключами; кэш только офлайн-фолбэк). Добавить `networkFirst(request, cacheName)` если его нет. Это устраняет класс багов «новый ключ не появился после деплоя».
3. **Кнопка канала: страховка от сырого ключа + название** — `FactoriesMain.tsx`: `t('factories:channel_button', { defaultValue: 'Перейти в канал' })`. Ключи ru/uz уже есть; defaultValue гарантирует, что даже при стейл-локали не покажется «CHANNEL_BUTTON». (Опц.: добавить `defaultValue` и другим недавно добавленным ключам — `profile:rows.subscription_inactive`.)

### Фаза 3 — Платёжный гейт
4. **Не показывать гейт оплатившим** — `authStore` + `AuthProvider` + `AppLayout`:
   - Добавить в authStore флаг `revalidating` (+экшены start/stop). `retryAuth`/`handleRetry` ставит `true` на старте перезапроса и `false` в конце.
   - В `AppLayout`: запускать `retryAuth()` на mount и на `visibilitychange` (последнее уже есть); `gateOpen = authState==='ok' && !isPremium && !revalidating`.
   - Итог: оплативший при возврате в приложение не видит мелькания модалки — гейт не открывается, пока идёт перепроверка; после неё `isPremium=true` → не откроется вовсе. Реально не-premium увидит гейт чуть позже (после перепроверки).

### Фаза 4 — UI
5. **Обложки уроков не режутся** — `src/components/LessonCard/LessonCard.scss` `__thumb`: убрать кроп — `object-fit: contain` + нейтральный фон (напр. `#0f0f0f`), чтобы обложка целиком влезала без среза текста. Если появятся поля (letterbox) — альтернативно подогнать `aspect-ratio` под реальный размер обложек. **Проверить на скрине заказчика** перед деплоем.
6. **Выравнивание подарков** — `HomeHeader.scss`: задать `__prize-text` (и при необходимости `__prize-media`) фиксированную `min-height` под 2–3 строки, чтобы картинки и бейджи ОТКРЫТО/ЗАКРЫТО стояли на одной линии во всех 5 колонках. Проверить и ru, и uz (длина текста разная).
7. **База курса валют** — `ExchangePage.tsx` + локаль `exchange`: добавить подпись, что курс = **сум за 1 единицу** (`baseCurrency: UZS`). Локализованный сабтайтл под заголовком «Курсы валют» (ru «Сум за 1 единицу валюты» / uz) и/или суффикс «сум» к значению строки.

### Фаза 5 — Поддержка
8. **Поддержка → https://t.me/cashyou_help (кнопка-редирект)**:
   - `ProfileMain.tsx`: support-row — заменить `https://t.me/marketbox_asistant_bot` на `https://t.me/cashyou_help`.
   - `ProfileFaqPage.tsx`: где упоминается `@cashyou_help`, добавить кнопку «Написать в поддержку» → `openTelegram('https://t.me/cashyou_help')`.
   - Вынести `openTelegram(url)` в общий util (`src/utils/telegram.ts` уже есть — проверить/добавить), переиспользовать в FactoriesMain/Cargo/Profile вместо дублей.

### Фаза 6 — Сборка и деплой
9. **tsc + build + deploy** — `npx tsc -b`; `npm run build`; bump `package.json` → **0.7.0**; rsync Beget + md5-сверка. После деплоя — диагностический `curl` companies (с токеном): прийти должны все 38.

## Commit Plan
- Чекпоинт A (1): `fix(api): fetch all paginated pages (companies & catalog lists)`
- Чекпоинт B (2–3): `fix(i18n): network-first locales + channel button fallback`
- Чекпоинт C (4): `fix(auth): suppress premium gate while revalidating after payment`
- Чекпоинт D (5–7): `fix(ui): lesson cover fit, prize grid align, fx base label`
- Чекпоинт E (8): `feat(support): redirect to cashyou_help support`
- Чекпоинт F (9): bump 0.7.0 + deploy
(Коммитим только по явной просьбе; деплой напрямую с main.)

## Риски / на что смотреть
- **fetchAllPages**: при выключенном RQ-кэше каждый заход тянет ВСЕ страницы (N запросов) — для секций с сотнями компаний возможна задержка. Приемлемо (кэш вернём позже); при желании ограничить разумным `maxPages`.
- **Обложки**: `contain` может дать поля, если соотношение сторон обложек не 16:9 — нужен реальный размер от заказчика; иначе подгон aspect-ratio.
- **Гейт**: `revalidating` не должен «залипнуть» в true при ошибке retryAuth — обязательно сбрасывать в finally.
