# План: раскрывающийся хедер на главной — призы за месяцы подписки

**Branch:** main (по выбору пользователя — без feature-ветки, деплой напрямую)
**Создан:** 2026-06-01
**Тип:** feature

## Settings
- **Testing:** no — проверка tsc + Playwright вручную (выбор пользователя)
- **Logging:** minimal — UI-фича; один `console.warn` на отсутствие `consecutive_months` в ответе
- **Docs:** no — warn-only
- **Roadmap:** none (артефакта нет)

## Контекст

Хедер на главной (`home-page__header`: аватар, имя, PREMIUM-бейдж, «до даты», шеврон)
должен по тапу разворачиваться в glass-панель с прогрессом конкурса «подарки за
продление подписки». Прогресс считается от нового поля backend
`subscription.consecutive_months` (GET /api/user) — сколько месяцев подряд
пользователь с подпиской.

### Дизайн (Figma l1EkS5BshNwcL2Zjqku2Av, узлы 1378:12441 / 1378:12552)
Скриншот-референс: `.ai-factory/design-refs/expanded-header.png`.
Развёрнутый хедер — glass-карточка `rgba(23,23,23,0.8)`, border `rgba(255,255,255,0.6)`,
radius 20, backdrop-blur ~29, высота ~383px (анимируется от свёрнутых ~75px):

1. **Верхняя строка** — текущий хедер 1:1 (аватар 55px, имя Gilroy Bold 19, PREMIUM-пилл
   #968ad7 со звездой, «до 16.04.2026» Gilroy 10.5), шеврон поворачивается (вниз/вверх).
2. **Строка прогресса:** слева «Поэтапное открытие» (Gilroy 12, op .5),
   справа «N/12» (Gilroy Bold 12, #968ad7).
3. **Прогресс-бар:** трек #353538, h 13, radius 6.5, на всю ширину; заполнение #968ad7
   = consecutiveMonths/12.
4. **Заголовок:** «Подарки за продление подписки» (Bebas Neue Bold 24, по-uz
   «Obunani uzaytirish uchun sovg'alar»).
5. **Подзаголовок:** «Каждый месяц подписки открывает новые подарки» (Gilroy 14, op .8).
6. **Сетка призов — 5 колонок** (месяцы 1–5), в каждой:
   - лейбл «N-й мес» / «N-Oy» (Bebas Neue Bold ~23)
   - PREMIUM-пилл (#968ad7, мелкий)
   - текст приза (Gilroy ~5.7–7px по дизайну → в коде читаемые ~8-9px, центр, op .8)
   - картинка приза (есть для 1,2,3,5; приз 4 — текст «1 МИЛЛИОН РУБЛЕЙ» Bebas)
   - бейдж статуса: «ЗАКРЫТО»/«YOPIQ» (белый пилл, тёмный текст) если
     consecutiveMonths < N; открыт — пилл скрыт/заменён
7. **Низ:** горизонтальная линия + 5 check-иконок (по одной под колонкой; заполнены
   для достигнутых месяцев).

### Призы (статика — решение пользователя; API призов нет)
| Мес | Приз (ru) | Картинка |
|----|----|----|
| 1 | Скидка 15% в магазине 7Saber | `contest/prize-1-7saber.png` |
| 2 | TOP-100 товаров для продажи на маркетплейсах | `contest/prize-2-top100.png` |
| 3 | Шанс выиграть поездку в Китай с Мамаевым | `contest/prize-3-china.png` |
| 4 | Инвестиции для бизнеса — 1 МИЛЛИОН РУБЛЕЙ | текст (Bebas) |
| 5 | СКОРО / TEZ KUNDA | `contest/prize-5-soon.png` |

Ассеты УЖЕ скачаны и пережаты (≤300px): `public/images/home/contest/` (+ `check.svg`).

### Принятые решения
- **Тап по хедеру = toggle разворота** (раньше вёл в /profile; профиль доступен
  через таб-бар). Шеврон поворачивается вниз/вверх.
- Анимация — framer-motion `animate={{ height }}`/AnimatePresence; импорт в home-фиче
  допустим (vendor-motion отдельный chunk, не в app shell).
- `consecutive_months` отсутствует/0 → прогресс 0/12, все призы ЗАКРЫТО.
- Приз N открыт когда `consecutiveMonths >= N`. Прогресс «N/12» = min(consecutiveMonths,12).
- Новый компонент `src/features/home/components/HomeHeader/` — выносим весь хедер
  из HomePage (tsx+scss+index), HomePage рендерит `<HomeHeader/>`.

## Tasks

### Фаза 1 — данные
- [x] 1. **API-маппинг `consecutive_months`** — `src/api/types.ts` (Subscription:
  `consecutiveMonths?: number | null`), `src/app/AuthProvider.tsx` (тип ответа + маппинг,
  по образцу unlocked_module_level), `src/api/endpoints.ts` fetchMeAsUserProfile,
  `src/stores/authStore.ts` (поле + setAuth + partialize persist).
  Лог: `console.warn('[header] consecutive_months missing')` если поля нет при is_actual.

### Фаза 2 — компонент
- [x] 2. **HomeHeader: вынос + toggle** — создать `src/features/home/components/HomeHeader/`
  (HomeHeader.tsx, HomeHeader.scss, index.ts; экспорт в components/index.ts фичи).
  Перенести текущий JSX хедера из HomePage 1:1 (аватар/скелетоны/имя/PREMIUM/дата),
  заменить навигацию на `useState(expanded)` toggle + haptic, шеврон с поворотом
  (CSS transform). framer-motion для высоты панели.
- [x] 3. **Развёрнутая панель: прогресс** — строка «Поэтапное открытие»+«N/12»,
  прогресс-бар (#353538 трек / #968ad7 fill, ширина = consecutiveMonths/12),
  заголовок Bebas + подзаголовок — точно по дизайну.
- [x] 4. **Сетка призов** — массив-конфиг 5 призов (ключи локалей + картинки),
  колонка: месяц-лейбл, PREMIUM-пилл, текст, картинка/Bebas-текст, бейдж
  ЗАКРЫТО/открыт по consecutiveMonths; линия + 5 check.svg (achieved-состояние).
- [x] 5. **Локали ru/uz** — `public/locales/{ru,uz}/home.json`: contest.{stepwise,
  progress_of_12, title, subtitle, month_label, locked, soon, prize_1..prize_5}.
  uz-тексты из дизайна, ru — переводы из таблицы выше.

### Фаза 3 — проверка и выкладка
- [x] 6. **Проверка** — `npx tsc -b`; dev + Playwright: мок consecutiveMonths
  (через VITE_MOCK_TG ветку AuthProvider) на 0 / 2 / 12 — свёрнут/развёрнут,
  прогресс-бар, открытые/закрытые призы, анимация без дёрганий, ничего не
  ломается на /preview маршрутах.
- [x] 7. **Bump + build + deploy** — package.json → 0.4.0, `npm run build`,
  rsync на Beget, md5-проверка.

## Commit Plan
- Чекпоинт A (после задачи 1): `feat(api): map subscription.consecutive_months`
- Чекпоинт B (после задач 2–5): `feat(home): expandable header with subscription rewards`
- Чекпоинт C (после задач 6–7): деплой
(В этой сессии коммитим только по явной просьбе — деплой идёт напрямую с main.)
