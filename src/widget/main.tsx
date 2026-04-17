import '@bosch/frontend.kit-npm/styles/frontend-kit.complete.css';
import '../styles/frok-overrides.css';
import './widget.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WidgetApp } from './WidgetApp';

const container = document.getElementById('widget-root');
if (!container) {
  throw new Error('RAGaaS widget: missing #widget-root element');
}

createRoot(container).render(
  <StrictMode>
    <WidgetApp />
  </StrictMode>,
);
