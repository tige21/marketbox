# План (fast): заблокировать карточку «Ai ассистент» на главной («Скоро откроется»)

**Branch:** main (без ветки, деплой напрямую на Beget)
**Создан:** 2026-07-07
**Тип:** enhancement (мелкая)
**Версия после:** 0.7.6

## Settings
- **Testing:** no
- **Logging:** minimal
- **Docs:** warn-only

## Задача
На главной раздел «Ai ассистент для селлеров» **заблокировать замком** и показать надпись **«Скоро откроется»**. Тап по карточке **не должен переходить** никуда (раздел не готов).

## Разведка (codegraph + live API)
- Карточки главной рендерит `CategoryList` (`src/features/home/components/CategoryList/CategoryList.tsx`) → `CategoryCard` (`src/components/CategoryCard/CategoryCard.tsx`). Данные из `useCategories` → `/api/menu` → `adapt()`.
- `CategoryCard` сейчас **всегда** навигирует по `route` (`onClick`/`onKeyDown`); есть только модификатор `--premium`, состояния «locked» нет.
- Карточка ассистента = пункт меню **id 12, type `exchange`**, title «Ai ассистент для селлеров» (бэк переиспользовал тип; route маппится на `/exchange`). Надёжнее опознавать по **названию** (regex `/assist|ассист/i` по `title`/`titleUz`), а не по id/type.

## Tasks
1. **CategoryCard: состояние `locked`** — `CategoryCard.tsx`:
   - Добавить проп `locked?: boolean` в `CategoryCardProps`.
   - Когда `locked`: `onClick`/`onKeyDown` **не навигируют** (ранний `return`, без `navigate`); `aria-disabled={true}`; модификатор `--locked`.
   - В разметку добавить оверлей: иконка-замок + текст `t('home:categories.coming_soon', { defaultValue: 'Скоро откроется' })`. Замок можно инлайн-SVG (как `LockGlyph`/`module-lock` в проекте) или существующий ассет.
2. **CategoryList: пометить ассистента** — `CategoryList.tsx`: при рендере вычислить `const locked = /assist|ассист/i.test(cat.title) || /assist|ассист/i.test(cat.titleUz)` и передать `locked={locked}` в `CategoryCard`.
3. **SCSS** — `CategoryCard.scss`: `&--locked` — затемнить арт (`filter`/`opacity`), скрыть шеврон, показать оверлей `__lock` (центр, замок) + `__coming-soon` (плашка с текстом). Курсор `default`.
4. **Локаль** — `home.json` ru/uz: `categories.coming_soon` = «Скоро откроется» / «Tez orada ochiladi» (defaultValue-страховка в коде уже есть на случай стейл-локали).
5. **Сборка + деплой** — `npx tsc -b`; `npm run build`; bump `package.json` → 0.7.6; rsync Beget + md5. Затем коммит `feat(no-ref): lock AI-assistant home card (coming soon)` + push (по правилу проекта).

(Меньше 5 задач по сути — отдельный commit-plan не нужен.)

## Риски
- Опознание по названию сломается, если админ переименует карточку. Приемлемо (переименование = вероятно, раздел готов). Альтернатива — фикс по type `exchange`/id 12, но это хрупче семантически.
- `/exchange` сейчас достижим только через эту карточку — после блокировки экран обмена валют с главной будет недоступен. Если обмен нужен отдельно — вынести отдельной карточкой/тайлом (отдельная задача, если попросят).
