import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ThemeProvider } from './context';
import { MainLayout } from './components/layout';
import { DashboardPage, ProjectsPage, ProjectDetailPage, SettingsPage } from './pages';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
