import { createFileRoute } from '@tanstack/react-router'
import { ContractPreview } from '../pages/ContractPreview'

export const Route = createFileRoute('/contract-preview')({
  component: ContractPreview,
})