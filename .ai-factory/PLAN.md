# План (fast): кнопка «Перейти в канал» на экране «Фабрики»

**Branch:** main (без ветки, деплой напрямую на Beget)
**Создан:** 2026-06-20
**Тип:** feature (мелкая)
**Версия после:** 0.6.4

## Settings
- **Testing:** no
- **Logging:** minimal
- **Docs:** warn-only

## Задача
На экране `FactoriesMain` (список стран Китай/Узбекистан/Россия/Киргизия) добавить кнопку **«Перейти в канал»**, открывающую Telegram-канал `https://t.me/+VbqQ8PJl6glkNzEy` через `Telegram.WebApp.openTelegramLink` (как существующая кнопка чатов). Ссылка — хардкодом (бэк её пока не отдаёт).

## Разведка (факты)
- `src/features/factories/FactoriesMain.tsx` уже содержит паттерн открытия TG-ссылки: `handleChatTap` → `tg.openTelegramLink(url)` с фолбэком `window.open`. Кнопка чатов (`__chat-btn`) рендерится только если у какой-то фабрики есть `chat_url` — сейчас его нет, поэтому на скрине кнопки нет.
- Стиль кнопки — `.factories-main__chat-btn` в `src/features/factories/FactoriesPage.scss`.
- Локали фабрик: `public/locales/{ru,uz}/factories.json` (есть ключ `chats_button`).

## Tasks
1. **Кнопка + обработчик** — `FactoriesMain.tsx`:
   - Добавить константу `CHANNEL_URL = 'https://t.me/+VbqQ8PJl6glkNzEy'`.
   - Вынести открытие TG-ссылки в локальный хелпер `openTelegram(url)` (тот же код, что в `handleChatTap`: `openTelegramLink` → фолбэк `window.open`), переиспользовать в `handleChatTap` и новом `handleChannelTap`.
   - Отрендерить кнопку «Перейти в канал» **всегда** (ссылка захардкожена), внутри `<>` под `__grid` (рядом с `__chat-btn`, если тот есть). `onClick={handleChannelTap}`, `triggerHaptic('tap')`, текст `t('factories:channel_button')`.
2. **Локаль** — добавить `channel_button` в `ru/factories.json` («Перейти в канал») и `uz/factories.json` («Kanalga o'tish»).
3. **SCSS** — `FactoriesPage.scss`: добавить `.factories-main__channel-btn` по образцу `__chat-btn` (фирменный акцент). Проверить отступы под сеткой.
4. **Сборка + деплой** — `npx tsc -b`; `npm run build`; bump `package.json` → 0.6.4; rsync на Beget + md5-сверка.

(Меньше 5 задач — отдельный commit-plan не нужен; коммит только по явной просьбе, деплой напрямую с main.)
