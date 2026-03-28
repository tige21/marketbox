# MarketBox — Telegram Mini App Architecture Design

## Overview

MarketBox (BORIGA BARAKA) — Telegram Mini App для бизнес-платформы, связывающей предпринимателей с поставщиками, фабриками, карго-сервисами и образовательными материалами для торговли на маркетплейсах (OZON, Wildberries, Uzum Market) и с Китаем.

**Ключевые характеристики:**
- Работает исключительно как TG Mini App (не standalone)
- Автоматическая авторизация через Telegram initData
- Glass-дизайн в стиле iOS 26 (liquid glass, backdrop-blur, dark theme)
- Подписка PREMIUM (оплата через отдельного TG-бота, фронт отображает статус)
- Готовый REST API бекенд со Swagger-документацией
- Админка существует отдельно

---

## Tech Stack

| Технология | Назначение | Размер (gzip) |
|------------|-----------|---------------|
| React 18 + ReactDOM | UI фреймворк | ~45kb |
| Vite | Сборка, dev-сервер, HMR | dev only |
| TypeScript | Типизация | dev only |
| react-router-dom | Роутинг с lazy loading | ~15kb |
| @tanstack/react-query | Data fetching + кэширование | ~12kb |
| zustand | Глобальный стейт (auth, ui) | ~1kb |
| framer-motion | Анимации glass UI, переходы | ~18kb (tree-shaked) |
| @telegram-apps/sdk-react | TG WebApp SDK, авторизация | ~8kb |
| i18next + react-i18next | Локализация ru/uz | ~10kb |
| i18next-http-backend | Ленивая загрузка переводов | ~2kb |
| axios | HTTP клиент | ~5kb |
| sass | SCSS компиляция | dev only |
| clsx | BEM class helper | ~0.5kb |

**Стилизация:** SCSS + BEM методология с древовидными селекторами. НЕ Tailwind.

**Итого shell + главная при старте: ~50-60kb gzip.**

---

## Project Structure

```
marketbox/
├── public/
│   └── locales/
│       ├── ru/
│       │   ├── common.json
│       │   ├── home.json
│       │   ├── courses.json
│       │   └── ...
│       └── uz/
│           ├── common.json
│           └── ...
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── index.ts
│   │
│   ├── api/
│   │   ├── client.ts             # Axios + TG auth header
│   │   ├── endpoints.ts          # Typed endpoints
│   │   ├── types.ts              # API response types
│   │   └── index.ts
│   │
│   ├── components/               # Shared UI
│   │   ├── GlassCard/
│   │   │   ├── GlassCard.tsx
│   │   │   ├── GlassCard.scss
│   │   │   └── index.ts
│   │   ├── GlassTabBar/
│   │   │   ├── GlassTabBar.tsx
│   │   │   ├── GlassTabBar.scss
│   │   │   └── index.ts
│   │   ├── GlassButton/
│   │   │   └── index.ts
│   │   ├── GlassHeader/
│   │   │   └── index.ts
│   │   ├── CategoryCard/
│   │   │   └── index.ts
│   │   ├── OptimizedImage/
│   │   │   └── index.ts
│   │   ├── Skeleton/
│   │   │   └── index.ts
│   │   ├── ErrorBoundary/
│   │   │   └── index.ts
│   │   └── index.ts              # Barrel: re-export all shared
│   │
│   ├── features/                 # Business modules
│   │   ├── home/
│   │   │   ├── components/
│   │   │   │   ├── QuickActions/
│   │   │   │   │   └── index.ts
│   │   │   │   ├── CategoryList/
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useCategories.ts
│   │   │   │   └── index.ts
│   │   │   ├── HomePage.tsx
│   │   │   ├── HomePage.scss
│   │   │   └── index.ts         # Public API: exports only HomePage
│   │   ├── courses/
│   │   │   └── index.ts
│   │   ├── cargo/
│   │   │   └── index.ts
│   │   ├── factories/
│   │   │   └── index.ts
│   │   ├── wholesale/
│   │   │   └── index.ts
│   │   ├── china-guide/
│   │   │   └── index.ts
│   │   ├── jobs/
│   │   │   └── index.ts
│   │   ├── design-services/
│   │   │   └── index.ts
│   │   ├── documents/
│   │   │   └── index.ts
│   │   ├── exchange/
│   │   │   └── index.ts
│   │   ├── events/
│   │   │   └── index.ts
│   │   ├── news/
│   │   │   └── index.ts
│   │   ├── profile/
│   │   │   └── index.ts
│   │   ├── favorites/
│   │   │   └── index.ts
│   │   └── money/
│   │       └── index.ts
│   │
│   ├── hooks/                    # Global hooks
│   │   ├── useTelegramUser.ts
│   │   ├── useHaptic.ts
│   │   ├── useThemeParams.ts
│   │   ├── useOnlineStatus.ts
│   │   ├── usePullToRefresh.ts
│   │   └── index.ts
│   │
│   ├── stores/                   # Zustand
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── index.ts
│   │
│   ├── styles/
│   │   ├── _variables.scss       # Design tokens
│   │   ├── _mixins.scss          # Glass effects, typography
│   │   ├── _fonts.scss           # @font-face declarations
│   │   ├── _reset.scss
│   │   └── global.scss
│   │
│   ├── utils/
│   │   ├── cn.ts                 # BEM class helper
│   │   ├── i18n.ts               # i18next config
│   │   ├── telegram.ts           # TG WebApp utilities
│   │   └── index.ts
│   │
│   └── main.tsx
│
├── .env
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Public API Pattern

Every module exposes its public API through `index.ts` barrel files. Internal components are not exported.

```ts
// src/components/index.ts
export { GlassCard } from './GlassCard'
export { GlassTabBar } from './GlassTabBar'
export { GlassButton } from './GlassButton'
export { CategoryCard } from './CategoryCard'
export type { GlassCardProps } from './GlassCard'

// src/features/home/index.ts
export { HomePage } from './HomePage'
// Internal components (QuickActions, CategoryList) are NOT exported

// Consumer usage:
import { GlassCard, GlassButton } from '@/components'
import { HomePage } from '@/features/home'
import { useTelegramUser } from '@/hooks'
```

**Rule:** Never import from deep paths like `@/features/home/components/QuickActions`. Always go through the module's `index.ts`.

---

## Design System

### Design Tokens (SCSS Variables)

```scss
// Colors
$color-bg-primary: #121212;
$color-bg-glass: rgba(23, 23, 23, 0.5);
$color-bg-glass-tab: rgba(101, 101, 101, 0.6);
$color-bg-glass-tab-active: rgba(101, 101, 101, 0.4);
$color-bg-glass-card: rgba(0, 0, 0, 0.8);
$color-bg-glass-card-burn: #ccc;
$color-accent: #ac9dff;
$color-premium: #968ad7;
$color-white: #fafafa;
$color-border-glass: rgba(255, 255, 255, 0.6);
$color-border-glass-subtle: rgba(255, 255, 255, 0.1);

// Blur
$blur-glass: 40px;
$blur-glass-sm: 20px;

// Radii
$radius-card: 20px;
$radius-tab: 34px;

// Fonts
$font-gilroy: 'Gilroy', sans-serif;
$font-inter: 'Inter', sans-serif;
$font-bebas: 'Bebas Neue', sans-serif;

// Z-index
$z-tabbar: 100;
$z-header: 50;
```

### SCSS Mixins

```scss
@mixin glass-surface($bg, $blur) — glass background with blur
@mixin glass-card-overlay — card bottom overlay with color-burn
@mixin glass-tab-bar — tabbar glass style
@mixin text-title — Gilroy Bold white
@mixin text-body — Gilroy Medium white/80
@mixin gpu-accelerated — will-change + translateZ
@mixin tap-feedback — active:scale(0.97)
@mixin image-cover — absolute inset-0 object-fit cover
```

### BEM Convention

```scss
.block {
  // Block styles

  &__element {
    // Element styles

    &--modifier {
      // Modifier styles
    }
  }
}
```

### Fonts

- **Gilroy Bold/Medium** — content headings and body (preloaded)
- **Inter Medium** — navigation labels
- **Bebas Neue Bold** — quick action cards
- All fonts use `font-display: swap`

---

## Screens & Navigation

### Tab Bar (4 tabs)
1. **Главная** `/` — main dashboard
2. **Избранный** `/favorites` — saved items
3. **Профиль** `/profile` — user settings
4. **Мои деньги** `/money` — finances

### Feature Routes (from main page categories)
- `/courses/*` — Курсы (OZON, WB, Uzum)
- `/factories/*` — Фабрики
- `/cargo/*` — Карго (По белому, По чёрному, Фулфилмент)
- `/wholesale/*` — Оптовые продавцы
- `/china-guide/*` — Гид по Китаю (Рынки, Рестораны, Отели)
- `/jobs/*` — Работа
- `/design-services/*` — Услуги дизайна (Инфограф, Фотограф)
- `/documents/*` — Документация (Декларация, Честный знак, Бухгалтерия, Счёт, Юрист)
- `/exchange` — Обмен валют
- `/events/*` — Выставки и мероприятия
- `/news/*` — Новости

### Profile Sub-screens
- `/profile/name` — Имя и фамилия
- `/profile/language` — Язык
- `/profile/payment` — Платежная информация
- `/profile/report` — Сообщить о нарушении
- `/profile/terms` — Оферта и политики
- `/profile/rules` — Правила сообщества

All feature routes use `React.lazy()` for code splitting.

---

## Data Flow

### Authentication

```
TG WebApp opens → telegram.initData available automatically
  → axios interceptor: Authorization: tma ${initDataRaw}
  → backend validates initData → returns user data + subscription status
  → no login forms needed
```

### State Management

- **TanStack Query** — all server state (categories, courses, user data, etc.)
- **Zustand** — client-only state:
  - `authStore`: token, user info, premium status
  - `uiStore`: active locale, active tab

### Caching Strategy

| Data | staleTime | gcTime |
|------|-----------|--------|
| Categories list | 5 min | 30 min |
| Category detail | 1 min | 10 min |
| User profile | 10 min | 30 min |
| News feed | 2 min | 15 min |
| Exchange rates | 30 sec | 5 min |

- `refetchOnWindowFocus: false` (not needed in TG WebApp)
- `refetchOnReconnect: true`
- Prefetching on touch start for category details

---

## Performance

### Code Splitting

```
Initial load (~50-60kb gzip):
  vendor-react.js   ~45kb  (cached indefinitely)
  vendor-router.js  ~15kb  (cached indefinitely)
  app-shell.js      ~5kb   (layout + tabbar)
  home-page.js      ~10kb  (main page only)

On navigation (~5-15kb per chunk):
  courses.js, cargo.js, profile.js, etc.
```

Manual chunks in Vite config: react, router, query, motion, i18n.

### Images
- `loading="lazy"` + `decoding="async"` on all images
- Backend serves WebP + multiple sizes
- GPU-accelerated animations with `will-change`

### Fonts
- Gilroy Bold + Medium preloaded in `<head>`
- `font-display: swap` for instant text rendering

### Animations
- Framer Motion `layoutId` for tab bar transitions
- `whileTap={{ scale: 0.97 }}` for card interactions
- Spring physics: `stiffness: 400, damping: 30`

---

## Localization (i18n)

- **Languages:** Russian (ru), Uzbek (uz)
- **Strategy:** lazy loading per namespace via `i18next-http-backend`
- **Namespaces:** `common` (loaded at start), feature-specific (loaded on navigation)
- **Storage:** `localStorage` for language preference
- **Adding new language:** create `public/locales/{lang}/` folder, copy JSON structure, translate. No code changes.

---

## UX Patterns

- **Error Boundary** — glass-styled fallback with retry button
- **Skeleton loading** — shimmer animation matching glass aesthetic
- **Haptic feedback** — TG SDK haptics on tap/success/error
- **Pull-to-refresh** — invalidates TanStack Query cache
- **Offline indicator** — `useSyncExternalStore` with online/offline events
- **Prefetching** — data loads on touch start before navigation

---

## Subscription Model

- Payment handled by a separate Telegram bot
- Frontend fetches subscription status from backend API
- Displays PREMIUM badge + expiration date in header
- Content access controlled by backend (API returns 403 for locked content)
- Frontend shows appropriate upgrade prompts for non-premium users

---

## Future Considerations

- **Chat module** — architecture supports adding a chat feature when design is ready
- **Additional languages** — i18n system designed for easy expansion
- **Admin panel** — exists separately, not part of this codebase
