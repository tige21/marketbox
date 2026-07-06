# План: глобальный pull-to-refresh + живее кэш

**Branch:** main (по выбору — без feature-ветки, деплой напрямую)
**Создан:** 2026-06-09
**Тип:** feature / enhancement

## Settings
- **Testing:** no — проверка tsc + Playwright (playwright-core) вручную
- **Logging:** standard — `console.warn` при ошибке refetch в onRefresh
- **Docs:** no — warn-only
- **Roadmap:** none (артефакта нет)

## Roadmap Linkage
Milestone: "none" — Rationale: артефакта ROADMAP нет.

## Проблема
Каталожные разделы (курсы, фабрики, карго, гид по Китаю, новости, документы,
работа, дизайн, оптовики, мероприятия) кэшируются агрессивно: `staleTime 24ч`
по каталожным префиксам (`providers.tsx` → `STATIC_QUERY_PREFIXES`) + персист
React Query в localStorage (7 дней). Новый контент из админки не появляется,
пока кэш не протух. Кэш оставляем (скорость/оффлайн) — делаем данные «живее».

## Решения (подтверждены пользователем)
1. **Pull-to-refresh — глобальный, на уровне AppLayout.** Все роуты скроллят один
   контейнер `.app-layout__main` → один хук покрывает все разделы; не правим 10+ страниц.
   `onRefresh` = `queryClient.invalidateQueries({ refetchType: 'active' })` + await
   (инвалидирует весь кэш, рефетчит активные queries текущего раздела, спиннер
   крутится до завершения). Это намеренное действие юзера — инвалидация всего ок.
2. **staleTime каталожных префиксов 24ч → 5 мин** (`providers.tsx`). Персист и
   `refetchOnReconnect` оставляем. Новый контент подтянется фоном в течение ~5 мин
   при переходе/рефокусе, без действий пользователя.
3. main, без тестов, docs warn-only.

## Нюансы реализации
- `usePullToRefresh` уже есть (`src/hooks/usePullToRefresh.ts`): двигает индикатор/
  контент через refs+transform, в стейте только `isRefreshing`; возвращает
  `{indicatorRef, contentRef, spinnerRef, isRefreshing}`. Образец разметки/scss —
  `FavoritesPage` (`__pull-indicator`/`__pull-spinner`/`__inner`).
- `AppLayout` сейчас: `<main key={pathname} ref={mainRef}>`. Ключ ремаунтит main на
  каждый роут → глобальный хук терял бы биндинг. **Перенести `key={pathname}` на
  внутреннюю обёртку Outlet**, чтобы `<main>` (скроллер + индикатор) был стабилен.
  Сброс скролла уже делает отдельный `useLayoutEffect(mainRef.scrollTo(0,0))` —
  не сломается.
- `FavoritesPage` сейчас держит СВОЙ `usePullToRefresh` на том же `.app-layout__main`.
  После глобального — убрать локальный (иначе два хука на одном скроллере конфликтуют),
  оставив рендер контента.

## Tasks

### Фаза 1 — кэш живее
1. **staleTime 24ч → 5 мин** — `src/app/providers.tsx`: в цикле по
   `STATIC_QUERY_PREFIXES` заменить `staleTime: ONE_DAY` на `5 * 60 * 1000`.
   `exchange` (30мин) и дефолт (1ч) не трогать. Персист/buster не трогать.

### Фаза 2 — глобальный pull-to-refresh
2. **AppLayout: стабилизировать main** — `src/app/AppLayout.tsx`: убрать
   `key={pathname}` с `<main>`, обернуть `<Outlet/>` в `<div key={pathname}>`.
   Проверить, что scroll-to-top (`mainRef.scrollTo`) по-прежнему срабатывает на
   смену `pathname`.
3. **Подключить глобальный pull-to-refresh** — `AppLayout.tsx`: `usePullToRefresh({
   onRefresh })`, `onRefresh = async () => { try { await queryClient.invalidateQueries(
   { refetchType: 'active' }) } catch(e){ console.warn('[refresh] failed', e) } }`
   (queryClient из `useQueryClient`). Привязать `indicatorRef`/`contentRef`/`spinnerRef`
   к индикатору и обёртке main-контента. Индикатор + спиннер вынести как разметку в
   AppLayout (стиль — перенести из Favorites в `AppLayout.scss`, блок `app-layout__pull-*`).
   `enabled` — всегда (или только authState==='ok').
4. **Убрать локальный pull из Favorites** — `src/features/favorites/FavoritesPage.tsx`:
   удалить `usePullToRefresh` + `PullSpinner` + `__pull-*`-разметку (глобальный покрывает).
   Оставить список/рендер. `FavoritesPage.scss` — почистить неиспользуемые `__pull-*`.

### Фаза 3 — проверка и выкладка
5. **tsc + Playwright** — `npx tsc -b`; dev + playwright-core: эмулировать pull-жест
   (touch drag вниз на `.app-layout__main` при scrollTop=0) на 2-3 разделах,
   проверить: индикатор появляется, `invalidateQueries` дёргает рефетч (перехват
   сетевого запроса к `/api/...`), спиннер уходит, контент не дёргается, навигация ок.
   Проверить, что Favorites больше не имеет двойного хука.
6. **Bump + deploy** — package.json 0.5.0 (новая фича), build, rsync Beget, md5.

## Commit Plan
- Чекпоинт A (1): `perf(cache): catalog staleTime 24h → 5m`
- Чекпоинт B (2–4): `feat(app): global pull-to-refresh across all sections`
- Чекпоинт C (5–6): деплой
(Коммитим только по явной просьбе — деплой напрямую с main.)
