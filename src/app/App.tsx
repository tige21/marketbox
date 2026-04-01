import { BrowserRouter } from 'react-router-dom'
import { Providers } from './providers'
import { AuthProvider } from './AuthProvider'
import { AppRouter } from './router'

export function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </Providers>
    </BrowserRouter>
  )
}
