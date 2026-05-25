import { Routes, Route } from 'react-router-dom'
import { FactoriesMain } from './FactoriesMain'
import { FactoryCountryPage } from './FactoryCountryPage'
import { FactorySectionPage } from './FactorySectionPage'
import { FactoryCompanyDetailPage } from './FactoryCompanyDetailPage'

export function FactoriesPage() {
  return (
    <Routes>
      <Route index element={<FactoriesMain />} />
      <Route path=":countryCode" element={<FactoryCountryPage />} />
      <Route path=":countryCode/:sectionId" element={<FactorySectionPage />} />
      <Route
        path=":countryCode/:sectionId/:companyId"
        element={<FactoryCompanyDetailPage />}
      />
    </Routes>
  )
}
