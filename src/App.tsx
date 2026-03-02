import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { PointMapPage } from './pages/PointMapPage';
import { LineMapPage } from './pages/LineMapPage';
import { GraphPage } from './pages/GraphPage';
import { ArchivePage } from './pages/ArchivePage';
import { ErrorAnalysisPage } from './pages/ErrorAnalysisPage';
import { EvaluationPage } from './pages/EvaluationPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/points" element={<PointMapPage />} />
          <Route path="/lines" element={<LineMapPage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/errors" element={<ErrorAnalysisPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h2 className="text-2xl font-bold text-gray-700 mb-2">404 — 页面未找到</h2>
              <p className="text-gray-500 mb-4">您访问的页面不存在或已被移除。</p>
              <Link to="/" className="btn-primary">返回首页</Link>
            </div>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
