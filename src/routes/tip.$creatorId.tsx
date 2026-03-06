import { createFileRoute } from '@tanstack/react-router'
import TipPage from '../pages/TipPage'

export const Route = createFileRoute('/tip/$creatorId')({
  component: TipPage,
})
