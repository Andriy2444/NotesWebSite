import { useState } from 'react';
import { Menu, Search, Settings, User, X, ChevronLeft } from 'lucide-react';
import './TopBar.css';

export const TopBar = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Стан для мобільного пошуку

  const toggleTheme = () => {
    setIsDark(prev => !prev);
    document.body.classList.toggle('light-theme');
  };

  return (
    <header className="topbar">
      <div className={`topbar-left ${isSearchOpen ? 'hide-on-mobile' : ''}`}>
        <button className="icon-container" title="Menu">
          <Menu size={30} />
        </button>
        <div className={`search-bar ${isSearchOpen ? 'expanded' : ''}`}>
          {isSearchOpen && (
            <button className="mobile-back-btn" onClick={() => setIsSearchOpen(false)}>
              <ChevronLeft size={24} color="#A855F7" />
            </button>
          )}

          <input
            type="text"
            className="search-input"
            placeholder="Hinted search text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          <div className="search-icons">
            {searchValue && (
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => setSearchValue('')}
                color="#A855F7"
              />
            )}
            <button
              className="search-trigger-btn"
              onClick={() => window.innerWidth <= 768 && setIsSearchOpen(true)}
            >
              <Search size={20} color="#A855F7" />
            </button>
          </div>
        </div>
      </div>

      <div className={`topbar-right ${isSearchOpen ? 'hide-on-mobile' : ''}`}>
        <div
          className={`switch-toggle ${!isDark ? 'active' : ''}`}
          onClick={toggleTheme}
        >
          <div className="switch-handle"></div>
        </div>

        <button className="icon-container" title="Settings">
          <Settings size={30} />
        </button>

        <div className="icon-container user-avatar" onClick={() => alert('Profile')}>
          <User size={20} />
        </div>
      </div>
    </header>
  );
};