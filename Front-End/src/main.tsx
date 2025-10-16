import { StrictMode, type ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import Dashboard from './pages/Dashboard.tsx'
import Calendar from './components/calendar/ExpenseCalendar.tsx'
import Analise from './pages/Analysis.tsx';
import Metas from './pages/Metas.tsx';
import InsightsPage from './pages/Insights.tsx';
import LoginPage from './pages/Login.tsx';
import { ProtectedRoute } from "./hooks/useAuth";


const Protected = (element: ReactElement) => (
  <ProtectedRoute>{element}</ProtectedRoute>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={Protected(<Dashboard />)} />
        <Route path="/calendar" element={Protected(<Calendar />)} />
        <Route path="/analysis" element={Protected(<Analise />)} />
        <Route path="/metas" element={Protected(<Metas />)} />
        <Route path="/insights" element={Protected(<InsightsPage />)} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
