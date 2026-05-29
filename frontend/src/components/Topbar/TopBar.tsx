import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Settings, User, X, ChevronLeft } from 'lucide-react';
import './TopBar.css';

interface TopBarProps {
  onToggleMenu: () => void;
  onSearchChange: (value: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMenu, onSearchChange  }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleUserClick = () => {
		const token = localStorage.getItem('accessToken');
		if (!token) {
			navigate('/auth');
		} else {
			navigate('/profile');
		}
	};

  const handleSettingsClick = () => {
		const token = localStorage.getItem('accessToken');
		if (!token) {
			navigate('/auth');
		} else {
			navigate('/settings');
		}
	};

  return (
    <header className="topbar">
      <div className={`topbar-left ${isSearchOpen ? 'hide-on-mobile' : ''}`}>
        <button className="icon-container" title="Menu" onClick={onToggleMenu}>
          <Menu size={30} />
        </button>
        <div className={`search-bar ${isSearchOpen ? 'expanded' : ''}`}>
          {isSearchOpen && (
            <button className="mobile-back-btn" onClick={() => setIsSearchOpen(false)}>
              <ChevronLeft size={24} color={"var(--color-purple)"} />
            </button>
          )}

          <input
            type="text"
            className="search-input"
            placeholder="Hinted search text"
            value={searchValue}
            onChange={(e) => {setSearchValue(e.target.value); onSearchChange(e.target.value);}}
          />

          <div className="search-icons">
            {searchValue && (
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => {setSearchValue(''); onSearchChange('');}}
                color={"var(--color-purple)"}
              />
            )}
            <button
              className="search-trigger-btn"
              onClick={() => window.innerWidth <= 768 && setIsSearchOpen(true)}
            >
              <Search size={20} color={"var(--color-purple)"} />
            </button>
          </div>
        </div>
      </div>

      <div className={`topbar-right ${isSearchOpen ? 'hide-on-mobile' : ''}`}>
        <button className="icon-container" title="Settings" onClick={handleSettingsClick}>
          <Settings size={30} />
        </button>
        <div className="icon-container user-avatar" onClick={handleUserClick}>
          <User size={20} />
        </div>
      </div>
    </header>
  );
};