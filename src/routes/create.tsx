import { createFileRoute } from '@tanstack/react-router'
import CreatorSetup from '../pages/CreatorSetup'

export const Route = createFileRoute('/create')({
  component: CreatorSetup,
})
