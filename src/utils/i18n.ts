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
  'designServices',
  'jobs',
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
      loadPath: '/app/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  })

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('i18nextLng', lng)
    document.documentElement.lang = lng
  } catch { /* storage may be unavailable */ }
})

export default i18n
