import { Routes, Route } from 'react-router-dom'
import { ProfileMain } from './ProfileMain'
import { ProfileEditPage } from './ProfileEditPage'
import { ProfileLanguagePage } from './ProfileLanguagePage'
import { ProfilePaymentPage } from './ProfilePaymentPage'
import { ProfileReportPage } from './ProfileReportPage'
import { ProfileTermsPage } from './ProfileTermsPage'
import { ProfileRulesPage } from './ProfileRulesPage'
import { ProfileFaqPage } from './ProfileFaqPage'

export function ProfilePage() {
  return (
    <Routes>
      <Route index element={<ProfileMain />} />
      <Route path="edit" element={<ProfileEditPage />} />
      <Route path="language" element={<ProfileLanguagePage />} />
      <Route path="payment" element={<ProfilePaymentPage />} />
      <Route path="report" element={<ProfileReportPage />} />
      <Route path="terms" element={<ProfileTermsPage />} />
      <Route path="rules" element={<ProfileRulesPage />} />
      <Route path="faq" element={<ProfileFaqPage />} />
    </Routes>
  )
}
