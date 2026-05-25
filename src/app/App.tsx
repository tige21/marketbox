import { BrowserRouter } from 'react-router-dom'
import { Providers } from './providers'
import { AuthProvider } from './AuthProvider'
import { AppRouter } from './router'

// BASE_URL matches vite.config.ts `base` (`/app/` in prod, `/` in dev).
// Strip the trailing slash for react-router's basename.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export function App() {
  return (
    <BrowserRouter basename={basename}>
      <Providers>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </Providers>
    </BrowserRouter>
  )
}
