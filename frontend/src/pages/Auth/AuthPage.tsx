import React, {useState, useEffect} from 'react';
import type {ChangeEvent, FormEvent} from 'react';
import axios from 'axios';
import {api} from '../../api.ts';
import {TopBar} from "../../components/Topbar/TopBar.tsx";
import {LeftPanel} from "../../components/LeftBar/LeftPanel.tsx";
import "./AuthPage.css";

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  username?: string;
}

const AuthPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth > 768);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        setIsLoading(true);
        try {
          await api.get('/users/me');
          window.location.href = '/profile';
        } catch (err) {
          console.error("Auto-auth failed error", err);
          localStorage.clear();
        } finally {
          setIsLoading(false);
        }
      }
    };
    checkAuth();
  }, []);

  const toggleSidebar = (): void => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const {name, value} = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    if (error) setError('');
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match!");
      }

      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await api.post(endpoint, {
        email: formData.email,
        password: formData.password,
        ...(isLogin ? {} : {username: formData.username})
      });

      const {accessToken, refreshToken} = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      window.location.href = '/profile';
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data?.message;
        setError(Array.isArray(serverMessage) ? serverMessage[0] : serverMessage || 'Connection error');
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <TopBar onToggleMenu={toggleSidebar} onSearchChange={() => {}}/>
      <div className="content">
        <LeftPanel
          isOpen={isSidebarOpen}
          onSelectMenuItem={() => {
            if (window.innerWidth <= 768 && isSidebarOpen) setIsSidebarOpen(false);
          }}
        />

        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="auth-grid">
            <div className="card-box note-variant" style={{maxWidth: '400px', height: 'fit-content', width: '90%'}}>
              <h2 className="card-title" style={{marginBottom: '25px'}}>
                {isLogin ? 'Sign In' : 'Sign Up'}
              </h2>

              <form onSubmit={handleSubmit}
                    style={{display: 'flex', flexDirection: 'column', gap: '15px', width: '100%'}}>
                {!isLogin && (
                  <input
                    className="auth-input"
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                )}

                <input
                  className="auth-input"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                  <input
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{width: '100%', paddingRight: '45px'}}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: 'white',
                      opacity: 0.6
                    }}
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>

                {!isLogin && (
                  <input
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                )}

                {error && (
                  <span style={{color: '#ff4d4d', fontSize: '13px'}}>{error}</span>
                )}

                <button
                  type="submit"
                  className="auth-btn"
                  disabled={isLoading}
                  style={{opacity: isLoading ? 0.7 : 1}}
                >
                  {isLoading ? '...' : (isLogin ? 'Login' : 'Join')}
                </button>
              </form>

              <p
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setShowPassword(false);
                }}
                style={{marginTop: '20px', fontSize: '14px', cursor: 'pointer', textAlign: 'center'}}
              >
                {isLogin ? "New here? Register" : "Have an account? Login"}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AuthPage;