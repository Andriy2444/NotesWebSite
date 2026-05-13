import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { Monitor, Trash2, ShieldCheck, Palette, Moon, Sun } from 'lucide-react';
import { TopBar } from "../../components/Topbar/TopBar.tsx";
import { LeftPanel } from "../../components/LeftBar/LeftPanel.tsx";
import './SettingsPage.css';

interface Session {
  id: string;
  device: string;
  ipAddress: string;
  createdAt: string;
}

interface UserSettings {
  theme: string;
}

const SettingsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sessionsRes, settingsRes] = await Promise.all([
        api.get<Session[]>('/auth/sessions'),
        api.get<UserSettings>('/settings')
      ]);
      setSessions(sessionsRes.data);
      setSettings(settingsRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (settings?.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
  }, [settings]);

  const terminateSession = async (id: string) => {
    try {
      await api.delete(`/auth/sessions/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Could not terminate session");
    }
  };

  const updateTheme = async (theme: string) => {
    try {
      const res = await api.patch<UserSettings>('/settings', { theme });
      setSettings(res.data);
      document.documentElement  .setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    } catch (err) {
      console.error("Theme update error:", err);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  if (loading) return <div className="auth-wrapper">Loading...</div>;

  return (
    <div className="page-wrapper">
      <TopBar onToggleMenu={toggleSidebar} onSearchChange={() => {}} />
      <div className="content">
        <LeftPanel
          isOpen={isSidebarOpen}
          onSelectMenuItem={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
        />

        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="settings-layout">
            <div className="auth-card settings-card">

              <section className="settings-section">
                <h2 className="settings-h2"><Palette size={20} /> Appearance</h2>
                <div className="theme-grid">
                  {[
                    { id: 'dark', icon: <Moon size={18} />, label: 'Dark' },
                    { id: 'light', icon: <Sun size={18} />, label: 'Light' },
                  ].map(t => (
                    <button
                      key={t.id}
                      className={`theme-option ${settings?.theme === t.id ? 'active' : ''}`}
                      onClick={() => updateTheme(t.id)}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="auth-divider" />

              <section className="settings-section">
                <h2 className="settings-h2"><ShieldCheck size={20} /> Active Sessions</h2>
                <div className="sessions-container">
                  {sessions.map(session => (
                    <div key={session.id} className="session-row">
                      <div className="session-icon">
                        <Monitor size={22} />
                      </div>
                      <div className="session-details">
                        <p className="session-device">{session.device || 'Unknown Browser'}</p>
                        <p className="session-meta">{session.ipAddress} • {new Date(session.createdAt).toLocaleDateString('uk-UA')}</p>
                      </div>
                      <button
                        className="session-delete-btn"
                        onClick={() => terminateSession(session.id)}
                        title="Terminate session"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;