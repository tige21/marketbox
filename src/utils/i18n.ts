import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'

const ALL_NAMESPACES = [
  'common',
  'home',
  'courses',
  'cargo',
  'factories',
  'wholesale',
  'chinaGuide',
  'documents',
  'exchange',
  'events',
  'news',
  'profile',
  'favorites',
  'money',
]

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem('i18nextLng') ?? 'ru',
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'uz'],
    defaultNS: 'common',
    ns: ALL_NAMESPACES,
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  })

export default i18n
