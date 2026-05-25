import { Routes, Route } from 'react-router-dom'
import { LessonDetailPage } from './LessonDetailPage'
import { MarketplaceCoursesPage } from './MarketplaceCoursesPage'
import { ModuleLessonsPage } from './ModuleLessonsPage'
import { CoursesChatsPage } from './CoursesChatsPage'
import { CoursesCatalog } from './CoursesCatalog'

// Routing reflects the May 2026 backend hierarchy Course → Module → Lesson:
//   /courses                              → catalog (course tiles)
//   /courses/:marketplace                 → modules of that course
//   /courses/:marketplace/:moduleId       → lessons of that module
//   /courses/:marketplace/:moduleId/:id   → lesson detail
export function CoursesPage() {
  return (
    <Routes>
      <Route index element={<CoursesCatalog />} />
      <Route path="chats" element={<CoursesChatsPage />} />
      <Route path=":marketplace" element={<MarketplaceCoursesPage />} />
      <Route path=":marketplace/:moduleId" element={<ModuleLessonsPage />} />
      <Route path=":marketplace/:moduleId/:id" element={<LessonDetailPage />} />
    </Routes>
  )
}
