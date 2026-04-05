import React, {useState, useEffect, type FormEvent} from 'react';
import {api} from '../../api';
import {User, Mail, CalendarDays, LogOut, Edit2, Check, X, Loader2} from 'lucide-react';
import {TopBar} from "../../components/Topbar/TopBar.tsx";
import {LeftPanel} from "../../components/LeftBar/LeftPanel.tsx";
import "./ProfilePage.css";

interface UserData {
  email: string;
  username: string;
  createdAt: string;
  _count: {
    folders: number;
    notes: number;
  };
}

const ProfilePage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('refreshToken')) {
      window.location.href = '/auth';
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
      setNewUsername(res.data.username);
    } catch (err) {
      console.error("Profile loading failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUsername = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/users/me', {username: newUsername});
      if (user) setUser({...user, username: newUsername});
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth';
  };

  if (isLoading) return <div className="loading-container"><Loader2 className="spinner"/></div>;

  return (
    <div>
      <TopBar onToggleMenu={() => setIsSidebarOpen(!isSidebarOpen)}/>
      <div className="content">
        <LeftPanel isOpen={isSidebarOpen}
                   onSelectMenuItem={() => {
                     if (window.innerWidth <= 768 && isSidebarOpen) setIsSidebarOpen(false);
                   }}/>
        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="profile-container">
            <div className="card-box profile-main-card">
              <div className="profile-header">
                <div className="profile-avatar-large">
                  <User size={60} color="var(--color-purple)"/>
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateUsername} className="edit-username-form">
                    <input
                      className="auth-input profile-edit-input"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button type="submit" className="icon-btn success"><Check size={20}/></button>
                      <button type="button" className="icon-btn cancel" onClick={() => setIsEditing(false)}><X
                        size={20}/></button>
                    </div>
                  </form>
                ) : (
                  <div className="username-display">
                    <h1 className="profile-username">{user?.username || 'Loading...'}</h1>
                    <Edit2
                      size={18}
                      className="edit-icon"
                      onClick={() => setIsEditing(true)}
                    />
                  </div>
                )}
                <span className="profile-status-badge">System Architect</span>
              </div>

              <div className="profile-info-grid">
                <div className="info-item">
                  <Mail className="info-icon" size={20}/>
                  <div className="info-text">
                    <label>Email Address</label>
                    <p>{user?.email}</p>
                  </div>
                </div>
                <div className="info-item">
                  <CalendarDays className="info-icon" size={20}/>
                  <div className="info-text">
                    <label>Member Since</label>
                    <p>{user ? new Date(user.createdAt).toLocaleDateString() : ''}</p>
                  </div>
                </div>
              </div>

              <button className="profile-btn logout-btn" onClick={handleLogout}>
                <LogOut size={18}/> Log Out
              </button>
            </div>

            <div className="card-box profile-stats-card">
              <h2 className="card-subtitle" style={{marginBottom: '20px'}}>Your Activity</h2>
              <div className="stats-grid">
                <div className="stat-box">
                  <p className="stat-value">{user?._count?.folders || 0}</p>
                  <p className="stat-label">Folders</p>
                </div>
                <div className="stat-box">
                  <p className="stat-value">{user?._count?.notes || 0}</p>
                  <p className="stat-label">Notes</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;