# MarketBox — Telegram Mini App Architecture Design

## Overview

MarketBox (BORIGA BARAKA) — Telegram Mini App для бизнес-платформы, связывающей предпринимателей с поставщиками, фабриками, карго-сервисами и образовательными материалами для торговли на маркетплейсах (OZON, Wildberries, Uzum Market) и с Китаем.

**Ключевые характеристики:**
- Работает исключительно как TG Mini App (не standalone, прямой доступ по URL вне TG — показывает gate-screen)
- Автоматическая авторизация через Telegram initData (one-time handshake)
- Glass-дизайн в стиле iOS 26 (liquid glass, backdrop-blur, dark theme)
- Подписка PREMIUM (оплата через отдельного TG-бота, фронт отображает статус)
- Готовый REST API бекенд со Swagger-документацией
- Админка существует отдельно
- 15 feature-модулей

---

## Tech Stack

| Технология | Назначение | Размер (gzip) |
|------------|-----------|---------------|
| React 18 + ReactDOM | UI фреймворк | ~45kb |
| Vite 5 + `@vitejs/plugin-react` | Сборка, JSX transform, HMR | dev only |
| TypeScript 5 | Типизация (strict mode) | dev only |
| react-router-dom v6 | Роутинг с lazy loading | ~15kb |
| @tanstack/react-query v5 | Data fetching + кэширование | ~12kb |
| zustand v4 | Глобальный стейт (auth, ui) | ~1kb |
| framer-motion v11 | Анимации glass UI (`motion` minimal import) | ~20kb |
| @telegram-apps/sdk-react | TG WebApp SDK, авторизация | ~8kb |
| i18next + react-i18next | Локализация ru/uz | ~10kb |
| i18next-http-backend | Ленивая загрузка переводов | ~2kb |
| axios | HTTP клиент | ~5kb |
| sass (Dart Sass) | SCSS компиляция | dev only |
| clsx | Утилита для условных классов | ~0.5kb |
| msw | Мокирование API в тестах | dev only |
| vitest | Unit/component тесты | dev only |
| @testing-library/react | Тестирование компонентов | dev only |
| playwright | E2E тесты | dev only |
| vite-plugin-svgr | SVG как React компоненты | dev only |

**Стилизация:** SCSS + BEM методология с древовидными селекторами. НЕ Tailwind.

### Bundle Split Strategy

```
Initial load (загружается при первом открытии):
  vendor-react.js    ~45kb  — React + ReactDOM (кэш навсегда)
  vendor-router.js   ~15kb  — react-router-dom (кэш навсегда)
  vendor-query.js    ~12kb  — TanStack Query (кэш навсегда, нужен в providers)
  vendor-i18n.js     ~12kb  — i18next + react-i18next (нужен в providers)
  app-shell.js       ~8kb   — providers, router config, tabbar, auth
  home-page.js       ~10kb  — home feature chunk
  common.json        ~2kb   — i18n common namespace
  ─────────────────────────
  Итого initial:    ~104kb gzip

Deferred (загружается при навигации, НЕ при старте):
  vendor-motion.js   ~20kb  — framer-motion v11 (грузится при первой анимации)
  courses.js         ~8-15kb — по требованию
  cargo.js, profile.js, etc.
```

> **Примечание:** vendor-query и vendor-i18n загружаются при старте, так как `providers.tsx` использует `QueryClientProvider` и `I18nextProvider`. Это архитектурно верно — 104kb gzip при первом старте, затем кэшируется навсегда.

---

## Project Structure

```
marketbox/
├── public/
│   └── locales/
│       ├── ru/
│       │   ├── common.json
│       │   ├── home.json
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
│   │   ├── client.ts             # Axios instance — JWT Bearer auth + interceptors
│   │   ├── endpoints.ts          # Typed endpoints
│   │   ├── types.ts              # API response/request types
│   │   └── index.ts
│   │
│   ├── components/               # Shared UI
│   │   ├── GlassCard/
│   │   │   ├── GlassCard.tsx
│   │   │   ├── GlassCard.scss
│   │   │   └── index.ts
│   │   ├── GlassTabBar/
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
│   │   ├── PremiumGate/
│   │   │   └── index.ts
│   │   ├── OfflineBanner/
│   │   │   └── index.ts
│   │   ├── Toast/
│   │   │   └── index.ts
│   │   ├── BottomSheet/
│   │   │   └── index.ts
│   │   ├── Badge/
│   │   │   └── index.ts
│   │   ├── Avatar/
│   │   │   └── index.ts
│   │   ├── EmptyState/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── features/                 # 15 business modules
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
│   │   │   └── index.ts
│   │   ├── courses/
│   │   │   └── index.ts
│   │   ├── cargo/
│   │   │   └── index.ts
│   │   ├── factories/
│   │   │   └── index.ts
│   │   ├── wholesale/
│   │   │   └── index.ts
│   │   ├── chinaGuide/           # camelCase — избегаем проблем с hyphenated paths
│   │   │   └── index.ts
│   │   ├── jobs/
│   │   │   └── index.ts
│   │   ├── designServices/       # camelCase
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
│   ├── hooks/
│   │   ├── useTelegramUser.ts    # custom wrapper over useLaunchParams()
│   │   ├── useHaptic.ts
│   │   ├── useThemeParams.ts
│   │   ├── useOnlineStatus.ts
│   │   ├── usePullToRefresh.ts
│   │   ├── useFocusTrap.ts       # для PremiumGate и модалей
│   │   └── index.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts          # token, user, isPremium, authState: 'loading'|'ok'|'error'|'non-tg'
│   │   ├── uiStore.ts            # activeTab (locale управляется i18next, не дублируется)
│   │   └── index.ts
│   │
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── _fonts.scss
│   │   ├── _reset.scss
│   │   ├── _accessibility.scss
│   │   └── global.scss
│   │
│   ├── utils/
│   │   ├── cn.ts                 # BEM class helper
│   │   ├── motion.ts             # shared Framer Motion constants
│   │   ├── i18n.ts
│   │   ├── telegram.ts
│   │   └── index.ts
│   │
│   └── main.tsx
│
├── .env.example
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Public API Pattern

```ts
// src/components/index.ts
export { GlassCard } from './GlassCard'
export { GlassTabBar } from './GlassTabBar'
export { GlassButton } from './GlassButton'
export { CategoryCard } from './CategoryCard'
export { Toast } from './Toast'
export { BottomSheet } from './BottomSheet'
export type { GlassCardProps } from './GlassCard'

// src/features/home/index.ts — только публичный API
export { HomePage } from './HomePage'
// Внутренние компоненты (QuickActions, CategoryList) НЕ экспортируются

// Использование:
import { GlassCard, GlassButton } from '@/components'
import { HomePage } from '@/features/home'
import { useTelegramUser } from '@/hooks'
```

**Правило:** никогда не импортировать через глубокие пути. Только через `index.ts`.

**Правило:** все type-only реэкспорты — только через `export type`, не `export`:
```ts
export type { GlassCardProps } from './GlassCard'  // ✓
export { GlassCardProps } from './GlassCard'        // ✗ — ломает isolatedModules
```

### BEM Class Helper

```ts
// src/utils/cn.ts
import clsx, { type ClassValue } from 'clsx'

// Генерация BEM-класса с модификаторами
export function bem(
  block: string,
  element?: string,
  modifiers?: Record<string, boolean>
): string {
  const base = element ? `${block}__${element}` : block
  if (!modifiers) return base
  const mods = Object.entries(modifiers)
    .filter(([, v]) => v)
    .map(([k]) => `${base}--${k}`)
  return [base, ...mods].join(' ')
}

// Произвольные условные классы (для смешивания BEM с дополнительными)
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

// Использование:
bem('tab-bar', 'icon', { active: true })
// → 'tab-bar__icon tab-bar__icon--active'

cn(bem('card', undefined, { premium: true }), isLoading && 'skeleton')
// → 'card card--premium skeleton'
```

### Shared Motion Constants

```ts
// src/utils/motion.ts
export const SPRING_SNAPPY = { type: 'spring', stiffness: 400, damping: 30 }
export const SPRING_GENTLE = { type: 'spring', stiffness: 200, damping: 25 }
export const DURATION_FAST = 0.15
export const DURATION_NORMAL = 0.25

export const TAP_SCALE = { whileTap: { scale: 0.97 } }
```

---

## Design System

### Design Tokens (SCSS Variables)

```scss
// === COLORS ===
$color-bg-primary: #121212;
$color-bg-glass: rgba(23, 23, 23, 0.5);
$color-bg-glass-tab: rgba(101, 101, 101, 0.6);
$color-bg-glass-tab-active: rgba(101, 101, 101, 0.4);
$color-bg-glass-card: rgba(0, 0, 0, 0.8);
$color-bg-glass-card-burn: #ccc;
$color-accent: #ac9dff;
$color-accent-hover: #c4b8ff;
$color-accent-active: #9585e8;
$color-premium: #968ad7;
$color-white: #fafafa;
$color-white-80: rgba(250, 250, 250, 0.8);
$color-white-60: rgba(250, 250, 250, 0.6);   // inactive nav labels — ~5.0:1 contrast
$color-white-40: rgba(250, 250, 250, 0.4);   // disabled state
$color-border-glass: rgba(255, 255, 255, 0.6);
$color-border-glass-subtle: rgba(255, 255, 255, 0.1);
$color-focus-ring: #ac9dff;                  // same as accent for consistency
$color-error: #ff6b6b;
$color-success: #6bffb8;
$color-warning: #ffd66b;

// === BLUR ===
$blur-glass: 20px;         // cards — снижен с 40px для производительности на Android
$blur-glass-lg: 40px;      // только tab bar и header (максимум 2 элемента одновременно)

// === SPACING (base-8 scale) ===
$space-1: 4px;
$space-2: 8px;
$space-3: 12px;
$space-4: 16px;
$space-5: 20px;
$space-6: 24px;
$space-8: 32px;
$space-10: 40px;
$space-12: 48px;
$space-16: 64px;

// === TYPOGRAPHY ===
$text-xs:   10px;   // nav labels
$text-sm:   12px;   // captions, badges
$text-base: 14px;   // body text
$text-md:   16px;   // card titles
$text-lg:   18px;   // section headings
$text-xl:   22px;   // page headings (Gilroy Bold)
$text-2xl:  28px;   // hero text
$text-3xl:  38px;   // emoji / large display

$lh-tight:  1.2;    // single-line headings only
$lh-normal: 1.5;    // body text (WCAG 1.4.12 minimum)
$lh-loose:  1.8;    // small text in dense layouts

$fw-regular: 400;
$fw-medium:  500;
$fw-bold:    700;

// === FONTS ===
$font-gilroy: 'Gilroy', 'Roboto', 'Noto Sans', system-ui, sans-serif;
$font-inter: 'Inter', 'Roboto', system-ui, sans-serif;
$font-bebas: 'Bebas Neue', 'Arial Narrow', sans-serif;

// === RADII ===
$radius-sm: 8px;      // badges, chips
$radius-md: 12px;     // buttons, inputs
$radius-card: 20px;   // category cards, modals
$radius-lg: 28px;     // bottom sheets
$radius-tab: 34px;    // tab bar
$radius-full: 9999px; // pill/avatar

// === SHADOWS ===
$shadow-glass: 0 4px 24px rgba(0, 0, 0, 0.3);
$shadow-glass-elevated: 0 8px 40px rgba(0, 0, 0, 0.5);
$shadow-glass-inner: inset 0 1px 0 rgba(255, 255, 255, 0.15);  // top-edge light refraction
$shadow-glow-accent: 0 0 20px rgba(172, 157, 255, 0.3);
$shadow-glow-premium: 0 0 24px rgba(150, 138, 215, 0.4);

// === Z-INDEX ===
$z-content: 0;
$z-sticky: 10;
$z-header: 50;
$z-tabbar: 100;
$z-overlay: 200;
$z-modal: 300;
$z-toast: 400;
$z-critical: 500;

// === ANIMATION ===
$duration-fast:   150ms;
$duration-normal: 250ms;
$duration-slow:   400ms;
$easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
$easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
$easing-accelerate: cubic-bezier(0.4, 0, 1, 1);
```

### SCSS Mixins (полные реализации)

```scss
@use 'variables' as *;  // через loadPaths — без @/ алиаса

@mixin glass-surface($bg: $color-bg-glass, $blur: $blur-glass) {
  background: $bg;
  backdrop-filter: blur($blur);
  -webkit-backdrop-filter: blur($blur);
  border: 1px solid $color-border-glass;
  border-radius: $radius-card;
  box-shadow: $shadow-glass, $shadow-glass-inner;
}

@mixin glass-card-overlay {
  position: absolute;
  bottom: $space-2;
  left: $space-2;
  right: $space-2;
  height: 45px;
  border-radius: $radius-card;
  display: flex;
  align-items: center;
  padding: 0 $space-4;
  gap: $space-3;

  &::before, &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: $radius-card;
    pointer-events: none;
  }
  &::before { background: $color-bg-glass-card; opacity: 0.67; }
  &::after  { background: $color-bg-glass-card-burn; mix-blend-mode: color-burn; opacity: 0.67; }
}

@mixin glass-tab-bar {
  background: $color-bg-glass-tab;
  backdrop-filter: blur($blur-glass-lg);  // только здесь используем 40px
  -webkit-backdrop-filter: blur($blur-glass-lg);
  border: 1px solid $color-border-glass-subtle;
  border-radius: $radius-tab;
  box-shadow: $shadow-glass-inner;
}

@mixin glass-hover {
  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.05);
    transition: background-color $duration-fast $easing-standard;
  }
}

@mixin glass-disabled {
  &:disabled {
    opacity: 0.4;
    pointer-events: none;
    filter: grayscale(30%);
  }
}

@mixin focus-ring {
  &:focus-visible {
    outline: 2px solid $color-focus-ring;
    outline-offset: 2px;
    border-radius: inherit;
  }
}

@mixin text-title {
  font-family: $font-gilroy;
  font-weight: $fw-bold;
  color: $color-white;
  line-height: $lh-tight;
}

@mixin text-body {
  font-family: $font-gilroy;
  font-weight: $fw-medium;
  color: $color-white-80;
  line-height: $lh-normal;   // 1.5 — WCAG 1.4.12
}

@mixin gpu-accelerated {
  // Применяется ТОЛЬКО на время анимации, не постоянно
  will-change: transform, opacity;
  transform: translateZ(0);
}

@mixin tap-feedback {
  -webkit-tap-highlight-color: transparent;
  transition: transform $duration-fast $easing-standard;
  @include focus-ring;
  &:active { transform: scale(0.97); }
}

@mixin image-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### BEM Convention

```scss
.block {
  &__element {
    &--modifier { }
    &--active { }
    &--disabled { }
  }
}
```

### Fonts

```scss
// _fonts.scss
@font-face {
  font-family: 'Gilroy';
  src: url('/fonts/Gilroy-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Gilroy';
  src: url('/fonts/Gilroy-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

// Bebas Neue — можно через Google Fonts (бесплатный)
// Inter — через Google Fonts или системный
```

> **Важно:** Gilroy — коммерческий шрифт. Необходимо приобрести лицензию перед продакшн-деплоем. Fallback: `'Roboto', 'Noto Sans', system-ui, sans-serif`.

### Contrast Ratios (verified)

| Текст | Фон | Контраст | Статус |
|-------|-----|----------|--------|
| `#fafafa` | `#121212` | 18.1:1 | ✅ AAA |
| `rgba(250,250,250,0.8)` over glass | ~`#1e1e1e` | 9.5:1 | ✅ AA |
| `#ac9dff` (accent) | `#121212` | 8.5:1 | ✅ AA |
| `rgba(250,250,250,0.6)` (inactive nav) | `#121212` | 5.0:1 | ✅ AA |
| `#968ad7` (premium) | `#121212` | 6.2:1 | ✅ AA |

### Accessibility

```scss
// _accessibility.scss
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;   // предотвращает infinite flash
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

@media (prefers-contrast: more) {
  .glass-surface, [class*="glass"] {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: rgba(0, 0, 0, 0.92);
    border: 2px solid rgba(255, 255, 255, 0.8);
    color: #fafafa;   // явно задаём цвет текста
  }
}

// prefers-reduced-transparency (будущий стандарт)
@media (prefers-reduced-transparency: reduce) {
  [class*="glass"] {
    backdrop-filter: none;
    background: rgba(20, 20, 20, 0.95);
  }
}
```

- Text over glass: WCAG AA минимум (4.5:1 body, 3:1 large text) — see table above
- Framer Motion: `useReducedMotion()` хук — отключает spring-анимации
- Все интерактивные элементы: `focus-visible` ring через `@mixin focus-ring`
- Минимальный touch target: 44×44px (WCAG 2.5.5)
- `backdrop-filter: blur()` применяется максимум на 2-3 элемента одновременно (производительность)

### ARIA Patterns

```tsx
// GlassTabBar — семантическая разметка
<nav role="navigation" aria-label={t('common:tabs.nav_label')}>
  <ul className="tab-bar">
    {tabs.map(tab => (
      <li key={tab.id} className="tab-bar__item">
        <button aria-current={isActive ? 'page' : undefined}>
          <tab.icon aria-hidden="true" />
          <span className="tab-bar__label">{tab.label}</span>
        </button>
      </li>
    ))}
  </ul>
</nav>

// CategoryCard — интерактивная карточка
<article className="category-card">
  <a href={href} className="category-card__link">
    <img alt={title} loading="lazy" decoding="async" />
    <div className="category-card__overlay" aria-hidden="true" />
    <h3 className="category-card__title">{title}</h3>
  </a>
</article>

// Skeleton — состояние загрузки
<section aria-live="polite" aria-busy={isLoading} aria-label={t('common:loading')}>
  {isLoading ? <SkeletonCard /> : <Content />}
</section>

// PremiumGate — фокус-ловушка
// Использует useFocusTrap() hook:
// onMount: фокус на первую кнопку
// Tab/Shift+Tab: цикл внутри overlay
// onUnmount: возврат фокуса на triggering element
```

---

## Screens & Navigation

### Tab Bar (4 tabs)
1. **Главная** `/` — main dashboard
2. **Избранный** `/favorites` — saved items
3. **Профиль** `/profile` — user settings
4. **Мои деньги** `/money` — finances

### Feature Routes
- `/courses/*` — Курсы (OZON, WB, Uzum)
- `/factories/*` — Фабрики
- `/cargo/*` — Карго (По белому, По чёрному, Фулфилмент)
- `/wholesale/*` — Оптовые продавцы
- `/china-guide/*` — Гид по Китаю (Рынки, Рестораны, Отели)
- `/jobs/*` — Работа
- `/design-services/*` — Услуги дизайна (Инфограф, Фотограф)
- `/documents/*` — Документация
- `/exchange` — Обмен валют
- `/events/*` — Выставки и мероприятия
- `/news/*` — Новости

### Profile Sub-screens
- `/profile/name`, `/profile/language`, `/profile/payment`
- `/profile/report`, `/profile/terms`, `/profile/rules`

### Routing с Suspense

```tsx
// Каждый lazy-маршрут — своя Suspense boundary с layout-matching skeleton
const CoursesPage = lazy(() => import('@/features/courses'))

<Route path="/courses/*" element={
  <ErrorBoundary>
    <Suspense fallback={<CoursesPageSkeleton />}>  {/* skeleton совпадает с layout */}
      <CoursesPage />
    </Suspense>
  </ErrorBoundary>
} />
```

---

## Configuration Files

### vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    svgr({ svgrOptions: { exportType: 'named' } }),
  ],

  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },

  css: {
    preprocessorOptions: {
      scss: {
        // loadPaths решает проблему @use с алиасами — без @/ в SCSS
        loadPaths: [resolve(__dirname, 'src/styles')],
        additionalData: `@use "variables" as *;\n@use "mixins" as *;\n`,
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':  ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-query':  ['@tanstack/react-query'],
          'vendor-motion': ['framer-motion'],
          'vendor-i18n':   ['i18next', 'react-i18next', 'i18next-http-backend'],
        },
      },
    },
  },
})
```

> **Важно:** `@use` в `additionalData` работает через `loadPaths` — Sass резолвит `"variables"` относительно `src/styles/`, не через Vite alias. Не использовать `@/` внутри SCSS `@use`.

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

> **Важно:** `moduleResolution: "Bundler"` — обязательно для Vite 4+. `"Node"` не резолвит `exports` в package.json корректно. Все type-only re-exports: `export type`.

### .env.example

```bash
VITE_API_URL=http://localhost:3000          # Backend API base URL
VITE_TG_BOT_USERNAME=marketbox_bot          # Основной бот (для deep links)
VITE_TG_BOT_PAYMENT_USERNAME=marketbox_pay_bot  # Бот оплаты (для PremiumGate)
VITE_APP_ENV=development                    # development | staging | production
VITE_SENTRY_DSN=                           # Error tracking DSN (опционально)
VITE_SENTRY_ENV=development                # Sentry environment tag
```

---

## API Contract

### Base Configuration

Backend API URL конфигурируется через `VITE_API_URL`.

### Standard Response Envelope

```ts
interface ApiResponse<T> {
  data: T
  meta?: { page: number; perPage: number; total: number; totalPages: number }
}

interface ApiError {
  error: { code: string; message: string }
}
```

### Pagination

Offset-based: `GET /api/courses?page=1&perPage=20`

### Error Codes

| Status | Code | Handling |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | показать inline ошибку |
| 401 | `UNAUTHORIZED` | очистить authStore, показать reopen prompt |
| 403 | `SUBSCRIPTION_REQUIRED` | показать PremiumGate |
| 404 | `NOT_FOUND` | показать EmptyState |
| 429 | `RATE_LIMITED` | retry после `Retry-After` хедера |
| 500 | `INTERNAL_ERROR` | Toast с generic сообщением |

### Key Endpoints

```
Auth:     POST /api/auth/telegram      — валидация initData, возврат JWT + user
User:     GET/PUT /api/user/me
Categories: GET /api/categories
Courses:  GET /api/courses, GET /api/courses/:id
Cargo:    GET /api/cargo?type=white|black|fulfillment, GET /api/cargo/:id
Factories: GET /api/factories, GET /api/factories/:id
Wholesale: GET /api/wholesale, GET /api/wholesale/:id
China Guide: GET /api/china-guide/:type (markets|restaurants|hotels), /:type/:id
Jobs:     GET /api/jobs, GET /api/jobs/:id
Design Services: GET /api/design-services?type=infograph|photographer
Documents: GET /api/documents, GET /api/documents/:id
Exchange: GET /api/exchange/rates
Events:   GET /api/events, GET /api/events/:id
News:     GET /api/news, GET /api/news/:id
Favorites: GET /api/favorites, POST /api/favorites, DELETE /api/favorites/:id
Money:    GET /api/money/balance, GET /api/money/transactions, POST /api/money/withdraw
Subscription: GET /api/subscription
```

---

## Data Flow

### Authentication (детальный flow)

```
1. TG WebApp открывается
   → @telegram-apps/sdk-react предоставляет initDataRaw автоматически

2. AuthProvider (до рендера роутов):
   try {
     const { initDataRaw } = retrieveLaunchParams()
     const { data } = await axios.post('/api/auth/telegram', { initData: initDataRaw })
     // initDataRaw отправляется ТОЛЬКО в теле этого единственного запроса
     authStore.setAuth(data.token, data.user, data.subscription)
     axios.defaults.headers.Authorization = `Bearer ${data.token}`
   } catch (e) {
     if (isTelegramEnvironment()) authStore.setError()  // initData невалидный
     else authStore.setNonTelegram()  // открыт вне TG
   }

3. На успех: рендер приложения с Bearer JWT на всех последующих запросах
   ⚠️ initDataRaw НЕ используется как повторяющийся заголовок

4. На 401 в любом последующем запросе (JWT истёк):
   → очистить authStore
   → показать "Перезапустить приложение" (Mini App нужно переоткрыть)

5. Race condition: AuthProvider показывает <Skeleton /> пока authState === 'loading'
   → никакие роуты не рендерятся до authState === 'ok' | 'non-telegram' | 'error'
```

### Zustand Stores

```ts
// authStore.ts
type AuthState = 'loading' | 'ok' | 'error' | 'non-telegram'

interface AuthStore {
  authState: AuthState    // три состояния (не boolean — избегаем flicker)
  token: string | null    // хранится в памяти (НЕ localStorage) — защита от XSS
  user: TgUser | null
  isPremium: boolean
  subscriptionExpiry: string | null
  setAuth(token, user, subscription): void
  setError(): void
  setNonTelegram(): void
  clear(): void
}
// Обоснование памяти vs localStorage:
// Память = нет XSS-кражи токена + нет необходимости в expiry management
// (каждое открытие Mini App = новый initData = новый JWT)

// uiStore.ts
interface UiStore {
  activeTab: string       // locale управляется i18next, НЕ дублируется в Zustand
  setActiveTab(tab): void
}
```

### TG SDK Usage

```ts
// src/utils/telegram.ts — wrapper над @telegram-apps/sdk-react
import { retrieveLaunchParams, hapticFeedback, backButton, init } from '@telegram-apps/sdk-react'

export function initTelegramSDK() { init() }

export function isTelegramEnvironment(): boolean {
  try { retrieveLaunchParams(); return true }
  catch { return false }
}

// src/hooks/useTelegramUser.ts — custom hook
import { useLaunchParams } from '@telegram-apps/sdk-react'

export function useTelegramUser() {
  const launchParams = useLaunchParams()
  return launchParams.tgWebAppData?.user ?? null
}

// src/hooks/useHaptic.ts
import { hapticFeedback } from '@telegram-apps/sdk-react'

export function useHaptic() {
  return {
    tap: () => hapticFeedback.isSupported() && hapticFeedback.impactOccurred('light'),
    success: () => hapticFeedback.isSupported() && hapticFeedback.notificationOccurred('success'),
    error: () => hapticFeedback.isSupported() && hapticFeedback.notificationOccurred('error'),
    select: () => hapticFeedback.isSupported() && hapticFeedback.selectionChanged(),
  }
}
```

### Caching Strategy

| Data | staleTime | gcTime | Обоснование |
|------|-----------|--------|-------------|
| Categories list | 30 min | 60 min | Статичные данные, меняются только через админку |
| Category detail | 5 min | 15 min | Редко меняются |
| User profile | 30 sec | 5 min | Содержит subscription status — критично для UX |
| News feed | 2 min | 10 min | Умеренная волатильность |
| Exchange rates | 30 sec | 2 min | Финансовые данные — gcTime близок к staleTime |
| Favorites | 1 min | 10 min | Пользовательские данные |

```ts
// providers.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error?.status === 401 || error?.status === 403) return false  // не ретраить auth ошибки
        return failureCount < 2
      },
      throwOnError: true,   // propagate ошибки к ErrorBoundary
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
})
```

### Prefetching Strategy

```tsx
// Используем onPointerEnter с debounce — не onTouchStart (вызывает ложные срабатывания при скролле)
import { useRef } from 'react'

function CategoryCard({ id, onClick }) {
  const prefetchTimer = useRef<ReturnType<typeof setTimeout>>()

  const handlePointerEnter = () => {
    prefetchTimer.current = setTimeout(() => {
      queryClient.prefetchQuery({ queryKey: ['category', id], queryFn: () => api.getCategory(id) })
    }, 150)  // debounce 150ms — игнорирует быстрые касания при скролле
  }

  const handlePointerLeave = () => clearTimeout(prefetchTimer.current)

  return (
    <article onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave}>
      ...
    </article>
  )
}
```

---

## Error Handling Strategy

### Layers

1. **Axios interceptor** — глобальный:
   - 401 → `authStore.clear()` + показать reopen prompt
   - 429 → retry после `Retry-After` хедера
   - 500 → Toast с generic сообщением
2. **TanStack Query `throwOnError: true`** — ошибки всплывают к ErrorBoundary
3. **ErrorBoundary** — per-route (изолирует падение фичи) + global (катастрофический fallback)
4. **403 `SUBSCRIPTION_REQUIRED`** → PremiumGate component (не ErrorBoundary)

### PremiumGate

```tsx
// Использует фокус-ловушку и deep link к payment боту
const paymentBotUrl = `https://t.me/${import.meta.env.VITE_TG_BOT_PAYMENT_USERNAME}`

// На mount: фокус на кнопку "Upgrade"
// Tab: цикл внутри overlay
// На close: фокус возвращается к triggering element
```

---

## Security

### Auth Header — явные правила

- `initDataRaw` отправляется **ТОЛЬКО ОДИН РАЗ** в body `POST /api/auth/telegram`
- Все последующие запросы используют `Authorization: Bearer <JWT>` (не initData)
- JWT хранится **только в Zustand (память)** — защита от XSS. НЕ в localStorage/sessionStorage
- Никогда не добавлять `persist` middleware к `authStore`

### CSRF

Приложение не использует session cookies — все мутирующие запросы защищены JWT Bearer в заголовке, который браузер не может отправить cross-origin без CORS. Бекенд НИКОГДА не должен принимать cookie-based auth в качестве fallback.

### i18n XSS Prevention

- Никогда не использовать `dangerouslySetInnerHTML` внутри `<Trans>`
- Никогда не устанавливать `interpolation: { escaping: false }` в `i18n.ts`
- Все interpolated значения — только plain strings (имена, числа, даты)
- Для rich text — `<Trans>` с named React element slots, не HTML строки

### Non-TG Access

```tsx
// AuthProvider mount — синхронная проверка до рендера роутов
if (!isTelegramEnvironment()) {
  authStore.setNonTelegram()
}

// Root layout — gate ПЕРЕД любыми feature routes
if (authStore.authState === 'non-telegram') {
  return <NonTelegramGate botUrl={`https://t.me/${import.meta.env.VITE_TG_BOT_USERNAME}`} />
}
```

---

## Performance

### backdrop-filter Strategy (для CIS Android рынка)

На бюджетных устройствах (Samsung Galaxy A, Xiaomi Redmi) одновременно более 2-3 `backdrop-filter` элементов вызывают заметные падения FPS. Стратегия:

- `$blur-glass-lg: 40px` — **только** tab bar и header (максимум 2 одновременно)
- `$blur-glass: 20px` — карточки (сниженный blur для производительности)
- Внутри scroll containers — backdrop-filter **отключён**, заменяется solid background
- JavaScript device-tier check: при 3+ одновременных blur элементах → fallback class

```scss
// Fallback для слабых устройств (класс проставляется JS при старте)
.low-performance-mode [class*="glass"] {
  backdrop-filter: none;
  background: rgba(20, 20, 20, 0.93);
}
```

### Images

- `loading="lazy"` + `decoding="async"` на всех изображениях
- Backend отдаёт WebP + размеры
- `OptimizedImage` компонент: lazy, error fallback (placeholder), `srcSet` если backend предоставляет
- `will-change` применяется **только во время анимации** через JS, не через CSS mixin постоянно

### HTTP Cache Headers

Статические chunks (content-hash filenames от Vite):
```
Cache-Control: public, max-age=31536000, immutable
```
Nginx/Vercel/Cloudflare — настраивается на уровне хостинга.

### Fonts

- Gilroy Bold + Medium: `<link rel="preload">` в `index.html`
- `font-display: swap`

### Animations

- Framer Motion v11 — `import { motion } from 'framer-motion'` (v11 оптимизирован для tree-shaking)
- `layoutId` только для tab bar indicator (1 элемент)
- `whileTap` → заменён на CSS `@mixin tap-feedback` где Framer не нужен
- Shared constants в `src/utils/motion.ts`

---

## Localization (i18n)

- **Languages:** Russian (ru), Uzbek (uz)
- **Strategy:** lazy loading via `i18next-http-backend`
- **Namespaces:** `common` (при старте), feature-specific (при навигации)
- **Storage:** `localStorage` для языковых предпочтений
- **Locale не дублируется в Zustand** — i18next является single source of truth
- **Добавление языка:** создать `public/locales/{lang}/`, перевести JSON. Изменений кода нет.

---

## Testing Strategy

### Unit Tests (Vitest)
- Utils (`cn`, `bem`, motion constants), hooks, store logic
- API client interceptors, auth flow
- Покрытие: >90%

### Component Tests (Vitest + RTL + MSW)
- Shared components: GlassCard, GlassButton, GlassTabBar, CategoryCard, PremiumGate
- Feature pages с мокированным API через MSW
- `aria-current`, focus management, keyboard navigation
- Покрытие shared components: >80%

### E2E Tests (Playwright)
- Критические flows: открытие → главная → категория → деталь
- Tab navigation, language switching, premium gate
- Offline mode (service worker / network throttling)

### TG-specific Testing
- Мокировать `@telegram-apps/sdk-react` через `vi.mock()` в unit тестах
- Staging TG bot (BotFather test environment) для E2E

---

## Environment & Deployment

### Environments

| Env | API | Bot | Hosting |
|-----|-----|-----|---------|
| Development | localhost:3000 | test bot | vite dev server |
| Staging | api-staging.marketbox.uz | staging bot | Vercel preview |
| Production | api.marketbox.uz | prod bot | Vercel / Nginx |

### Deployment Steps

1. `vite build` → static files в `dist/`
2. Deploy на Vercel / Cloudflare Pages / Nginx
3. Зарегистрировать URL в BotFather (`/setmenubutton` или `web_app`)
4. CI/CD: GitHub Actions → build → preview deploy → prod deploy

---

## Subscription Model

- Payment через отдельный TG-бот (`VITE_TG_BOT_PAYMENT_USERNAME`)
- Frontend: `GET /api/subscription` → отображает статус + срок в header
- `PremiumGate` показывает upgrade prompt с deep link: `https://t.me/${paymentBot}`
- 403 от API → PremiumGate, frontend не управляет правами доступа
- Frontend никогда не обрабатывает платёжную логику

---

## Future Considerations

- **Chat module** — WebSocket (websocket-engineer subagent) когда появится дизайн
- **Дополнительные языки** — i18n готов, только JSON файлы
- **Push notifications** — TG Bot API поддерживает уведомления пользователям
- **Admin panel** — отдельный репозиторий, не входит в этот проект
