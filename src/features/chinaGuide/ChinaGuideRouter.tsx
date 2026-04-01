import { Routes, Route, useParams } from 'react-router-dom'
import { ChinaGuidePage } from './ChinaGuidePage'
import { ChinaGuideListPage } from './ChinaGuideListPage'
import { ChinaGuideDetailPage } from './ChinaGuideDetailPage'
import type { ChinaGuideType } from '@/api/types'

const VALID_TYPES: ChinaGuideType[] = ['markets', 'restaurants', 'hotels', 'tours', 'translators']

function isValidType(t: string): t is ChinaGuideType {
  return VALID_TYPES.includes(t as ChinaGuideType)
}

export function ChinaGuideRouter() {
  return (
    <Routes>
      <Route index element={<ChinaGuidePage />} />
      <Route path=":type" element={<TypedListWrapper />} />
      <Route path=":type/:id" element={<TypedDetailWrapper />} />
    </Routes>
  )
}

function TypedListWrapper() {
  const { type = '' } = useParams()
  if (!isValidType(type)) return null
  return <ChinaGuideListPage type={type} />
}

function TypedDetailWrapper() {
  const { type = '' } = useParams()
  if (!isValidType(type)) return null
  return <ChinaGuideDetailPage />
}
