# План: anti-cache для GET /api/* (данные из БД всегда свежие)

**Branch:** main (по конвенции проекта — без feature-ветки, деплой напрямую)
**Создан:** 2026-07-24
**Тип:** fix / enhancement

## Settings
- **Testing:** no — проверка `tsc -b` + build + ручной DevTools Network
- **Logging:** standard — без шумных логов; опционально `console.debug('[api] no-cache GET', url)`
- **Docs:** no — warn-only
- **Roadmap:** none (артефакта нет)

## Roadmap Linkage
Milestone: "none" — Rationale: артефакта ROADMAP нет.

## Проблема
Пользователи добавляют данные в БД, но в приложении они не появляются. Кодграф-проход
по всем слоям кэша показал, что **клиентский кэш данных уже отключён**:
- **React Query** — `DISABLE_CACHE = true` (`src/app/providers.tsx`): `staleTime 0`,
  `refetchOnMount 'always'`, без localStorage-персистенции.
- **Service Worker** (`src/sw.ts`) — `/api/*` полностью в обход (`if (pathname.startsWith('/api/')) return`).
- **Axios** (`src/api/client.ts`) — своего кэша нет.

Единственный неперекрытый слой — **HTTP-кэш браузера/прокси на GET `/api/*`**. Axios в
браузере ходит через XHR, который уважает заголовки ответа. Если nginx на Beget или
Laravel отдаёт `/api/*` с `Cache-Control: max-age` / `ETag`, браузер (или промежуточный
прокси/CDN) отдаёт старый ответ из HTTP-кэша — в обход и SW, и React Query (рефетч
уходит, но упирается в кэш браузера).

## Решение
Пробить HTTP-кэш со стороны фронта — устойчивый вариант «пояс + подтяжки» в
request-интерцепторе axios, **только для GET** (мутации не трогаем):
1. **Cache-buster** — добавлять `_: Date.now()` в `config.params`. Меняет URL каждого
   запроса → бьёт даже жёсткие прокси/CDN, игнорящие заголовки запроса.
2. **Заголовки** — `Cache-Control: no-cache` + `Pragma: no-cache` на GET-запрос.

Это перекрывает последний слой независимо от того, что настроено на бэке/nginx. Бэкенд
можно чинить параллельно (убрать `Cache-Control: max-age` на `/api/*`), но фронт
перестанет зависеть от этого.

## Нюансы реализации
- **Порядок в интерцепторе:** buster добавлять ПОСЛЕ существующего `delete p['lang']`
  и установки `lang`/`Accept-Language` заголовков (иначе можно случайно удалить `_`).
- **Только GET:** гардить по `config.method?.toLowerCase() === 'get'`. POST/PUT/DELETE
  (`withdrawals.create` и т.п.) не трогаем.
- **Пагинация:** response-интерцептор подгружает страницы 2..N через
  `apiClient.request({ ...cfg, __noPaginate, params: { ...cfg.params, page } })`. Эти
  под-запросы повторно входят в request-интерцептор → получат свежий `_` сами.
  Дублировать логику не нужно; проверить, что `_` из родительского cfg не ломает `page`.
- **React Query:** queryKey задаётся вручную в хуках (`['courses','list',lang]` и т.п.)
  и НЕ зависит от axios `params` → cache-buster не плодит новые RQ-кэши. Верифицировать.
- **Версия:** bump `package.json` заодно инвалидирует SW-кэш статики (APP_VERSION).

## Tasks

### Фаза 1 — код
- [x] 1. **Anti-cache в request-интерцепторе** — `src/api/client.ts`: в существующем
   `apiClient.interceptors.request.use` после блока lang добавить для GET cache-buster
   `config.params._ = Date.now()` + заголовки `Cache-Control: no-cache`, `Pragma: no-cache`.
- [x] 2. **Верификация конфликтов** (чтением, без правок) — убедиться, что buster не ломает
   lang-стриппинг и авто-пагинацию, и что RQ queryKey не зависит от axios params.

### Фаза 2 — проверка
- [x] 3. **Build + DevTools Network** (build ✓ tsc+vite; runtime header-check — после деплоя в TG/Beget) — `npx tsc -b` + `npm run build`; в dev/preview проверить
   GET `/api/...`: `?_=<ts>` в URL, `Cache-Control: no-cache` в request headers, Size ≠
   `(disk/memory cache)`, ответ 200 с сервера. Повторный заход → новый timestamp.

### Фаза 3 — выкладка
4. **Bump + deploy** — bump `package.json` (patch), `npm run build`, rsync `dist` на
   Beget `/app/`, пересчитать md5. Коммит/деплой — только по явной команде.

## Commit Plan
- Чекпоинт A (1–2): `fix(no-ref): anti-cache GET /api requests to bypass browser HTTP cache`
- Чекпоинт B (3–4): build + deploy (bump версии)
(Коммитим и деплоим только по явной просьбе — деплой напрямую с main.)
