import '@bosch/frontend.kit-npm/styles/frontend-kit.complete.css';
import './styles/frok-overrides.css';
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';
import { Button } from '@bosch/react-frok';
import { AuthProvider, ThemeProvider, useAuth } from './context';
import { MainLayout } from './components/layout';
import { DashboardPage, ProjectsPage, ProjectBlueprintsPage, ProjectDetailPage, SettingsPage, PipelinePlaygroundPage, AdminPage } from './pages';
import { WidgetApp } from './widget';

const SUPPORT_WIDGET_URL = 'https://ragaasa.wonderfulgrass-8f1852aa.eastasia.azurecontainerapps.io/widget.html?projectId=98216fc0-28f6-4ee1-848a-da0079830c4b&tenant=TQU3HC&title=Application+Support+Chatbot+Agent&primaryColor=%2318837e&welcomeMessage=%F0%9F%91%8B+Hello%21+How+can+I+help+you+today%3F&showTeamTag=true';

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

const EmbeddedSupportWidget: React.FC = () => {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ragaas-widget:close') {
        setOpen(false);
        setExpanded(false);
      }
      if (event.data?.type === 'ragaas-widget:resize') {
        setExpanded(Boolean(event.data.expanded));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (location.pathname.startsWith('/widget/')) {
    return null;
  }

  if (!open) {
    return (
      <Button
        mode="primary"
        icon="chat"
        onClick={() => setOpen(true)}
        aria-label="Open Application Support Chatbot Agent"
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          width: 44,
          height: 44,
          minWidth: 44,
          zIndex: 9999,
          borderRadius: 999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
          background: '#18837e',
        } as React.CSSProperties}
      />
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        width: expanded ? 'min(900px, calc(100vw - 32px))' : 'min(400px, calc(100vw - 32px))',
        height: expanded ? 'min(760px, calc(100vh - 32px))' : 'min(600px, calc(100vh - 32px))',
        zIndex: 9999,
        transition: 'width 180ms ease, height 180ms ease',
      }}
    >
      <iframe
        src={SUPPORT_WIDGET_URL}
        title="Application Support Chatbot Agent"
        allow="clipboard-write"
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          background: 'transparent',
        }}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <EmbeddedSupportWidget />
          <Routes>
            {/* Embeddable widget preview — no MainLayout chrome */}
            <Route path="/widget/:projectId" element={<WidgetPreviewRoute />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/blueprints" element={<ProjectBlueprintsPage />} />
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
