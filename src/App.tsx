import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { PointMapPage } from './pages/PointMapPage';
import { LineMapPage } from './pages/LineMapPage';
import { GraphPage } from './pages/GraphPage';
import { ArchivePage } from './pages/ArchivePage';
import { ErrorAnalysisPage } from './pages/ErrorAnalysisPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { useI18n } from './i18n';

const Router = import.meta.env.VITE_ROUTER_MODE === 'hash' ? HashRouter : BrowserRouter;

export default function App() {
  const { t } = useI18n();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/points" element={<PointMapPage />} />
          <Route path="/lines" element={<LineMapPage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/errors" element={<ErrorAnalysisPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <h2 className="text-2xl font-bold text-gray-700 mb-2">{t('app.notFound.title')}</h2>
                <p className="text-gray-500 mb-4">{t('app.notFound.description')}</p>
                <Link to="/" className="btn-primary">{t('app.notFound.backHome')}</Link>
              </div>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
