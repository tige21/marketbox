import { Routes, Route } from 'react-router-dom'
import { CargoMain } from './CargoMain'
import { CargoListPage } from './CargoListPage'
import { CargoWhitePage } from './CargoWhitePage'
import { CargoDetailPage } from './CargoDetailPage'

export function CargoPage() {
  return (
    <Routes>
      <Route index element={<CargoMain />} />
      <Route path="logistics" element={<CargoListPage type="logistics" />} />
      <Route path="fulfillment" element={<CargoListPage type="fulfillment" />} />
      <Route path="white" element={<CargoWhitePage />} />
      <Route path=":id" element={<CargoDetailPage />} />
    </Routes>
  )
}
