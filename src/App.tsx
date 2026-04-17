import '@bosch/frontend.kit-npm/styles/frontend-kit.complete.css';
import './styles/frok-overrides.css';
import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { AuthProvider, ThemeProvider, useAuth } from './context';
import { MainLayout } from './components/layout';
import { DashboardPage, ProjectsPage, ProjectDetailPage, SettingsPage, PipelinePlaygroundPage, AdminPage } from './pages';
import { WidgetApp } from './widget';

/**
 * Thin route wrapper: pulls the `projectId` from the URL and the current
 * tenantId from `useAuth()` so the in-app preview of the widget reuses
 * the signed-in tenant without needing a URL query param.
 */
const WidgetPreviewRoute: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { tenantId } = useAuth();
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <WidgetApp projectId={projectId} tenantId={tenantId} />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Embeddable widget preview — no MainLayout chrome */}
            <Route path="/widget/:projectId" element={<WidgetPreviewRoute />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="pipeline-playground" element={<PipelinePlaygroundPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
