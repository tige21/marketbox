import { Routes, Route } from 'react-router-dom'
import { CourseDetailPage } from './CourseDetailPage'
import { MarketplaceCoursesPage } from './MarketplaceCoursesPage'
import { CoursesChatsPage } from './CoursesChatsPage'
import { CoursesCatalog } from './CoursesCatalog'

export function CoursesPage() {
  return (
    <Routes>
      <Route index element={<CoursesCatalog />} />
      <Route path="chats" element={<CoursesChatsPage />} />
      <Route path=":marketplace" element={<MarketplaceCoursesPage />} />
      <Route path=":marketplace/:id" element={<CourseDetailPage />} />
    </Routes>
  )
}
