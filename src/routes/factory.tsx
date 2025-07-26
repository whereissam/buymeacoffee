import { createFileRoute } from '@tanstack/react-router';
import { WidgetFactory } from '../pages/WidgetFactory';

export const Route = createFileRoute('/factory')({
  component: WidgetFactory,
});