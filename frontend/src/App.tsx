import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/Home/HomePage"
import AuthPage from "./pages/Auth/AuthPage"
import ProfilePage from "./pages/Profile/ProfilePage.tsx";
import NotePage from "./pages/Note/NotePage.tsx";
import SettingsPage from "./pages/Settings/SettingsPage.tsx";
import CalendarPage from "./pages/Calendar/CalendarPage.tsx";
import {useEffect} from "react";
import {api} from "./api.ts";

function App() {
  useEffect(() => {
    const initTheme = async () => {
      try {
        const res = await api.get('/settings');
        const theme = res.data.theme || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      } catch (err) {
        console.error("Failed to fetch theme", err);
      }
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    initTheme();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<HomePage />}></Route>
        <Route path="/auth" element={<AuthPage />}></Route>
        <Route path="/profile" element={<ProfilePage />}></Route>
        <Route path="/folders/:folderId" element={<HomePage />}></Route>
        <Route path="/notes/:id" element={<NotePage />}></Route>
        <Route path="/settings" element={<SettingsPage />}></Route>
        <Route path="/calendar" element={<CalendarPage />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App