import { createFileRoute } from '@tanstack/react-router';
import { Coffee } from '../pages/Coffee';

export const Route = createFileRoute('/coffee')({
  component: Coffee,
});