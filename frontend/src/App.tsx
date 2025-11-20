import React, { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const DataExtraction = lazy(() => import('./pages/DataExtraction'));
const DataVisualization = lazy(() => import('./pages/DataVisualization'));
const DataAnalysis = lazy(() => import('./pages/DataAnalysis'));

const App: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
          <Spin size="large" tip="Loading..." />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home onNavigate={(key) => navigate(key === 'home' ? '/' : `/${key}`)} />} />
          <Route path="/extraction" element={<DataExtraction />} />
          <Route path="/visualization" element={<DataVisualization />} />
          <Route path="/analysis" element={<DataAnalysis />} />
          <Route path="*" element={<Home onNavigate={(key) => navigate(key === 'home' ? '/' : `/${key}`)} />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
};

export default App;
