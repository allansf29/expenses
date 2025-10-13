import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import Dashboard from './pages/Dashboard.tsx'
import Calendar from './components/calendar/ExpenseCalendar.tsx'
import Analise from './pages/Analysis.tsx';
import Metas from './pages/Metas.tsx';
import InsightsPage from './pages/Insights.tsx';




createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/analysis" element={<Analise />} />
        <Route path="/metas" element={<Metas />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
