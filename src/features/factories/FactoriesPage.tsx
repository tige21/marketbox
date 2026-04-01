import { Routes, Route } from 'react-router-dom'
import { FactoriesMain } from './FactoriesMain'
import { FactoryCountryPage } from './FactoryCountryPage'

export function FactoriesPage() {
  return (
    <Routes>
      <Route index element={<FactoriesMain />} />
      <Route path=":countryCode" element={<FactoryCountryPage />} />
    </Routes>
  )
}
