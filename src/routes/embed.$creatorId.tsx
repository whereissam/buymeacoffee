import { createFileRoute } from '@tanstack/react-router'
import EmbedPage from '../pages/EmbedPage'

export const Route = createFileRoute('/embed/$creatorId')({
  component: EmbedPage,
})
