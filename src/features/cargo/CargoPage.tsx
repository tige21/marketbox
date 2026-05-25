import { Routes, Route } from 'react-router-dom'
import { CargoMain } from './CargoMain'
import { CargoDetailPage } from './CargoDetailPage'
import { CargoLogisticDetailPage } from './CargoLogisticDetailPage'
import { CoursesChatsPage } from '@/features/courses'

export function CargoPage() {
  return (
    <Routes>
      <Route index element={<CargoMain />} />
      <Route path="chats" element={<CoursesChatsPage />} />
      <Route path="items/:itemId" element={<CargoLogisticDetailPage />} />
      <Route path=":id" element={<CargoDetailPage />} />
    </Routes>
  )
}
