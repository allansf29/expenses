import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import Home from './pages/Home.tsx'
import Navbar from './components/ui/Navbar.tsx'
import CategotyAnalysis from '../src/pages/CategoryAnalysis.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Calendar from './components/Calendar.tsx'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/home" element={<Home />} />
        <Route path="/category-analysis" element={<CategotyAnalysis />} />
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
