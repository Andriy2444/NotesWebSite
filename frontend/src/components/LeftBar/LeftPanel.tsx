import React from 'react';
import { PlusCircle, FileText, Folder, Bookmark, Archive, Calendar, LayoutGrid } from 'lucide-react';
import './LeftPanel.css';
import { useNavigate, useLocation } from "react-router-dom";

interface LeftPanelProps {
  isOpen: boolean;
  onSelectMenuItem?: () => void;
  onAddNew?: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ isOpen, onSelectMenuItem, onAddNew }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'all-items', label: 'All items', icon: LayoutGrid, href: '/' },
    { id: 'notes', label: 'Notes', icon: FileText, href: '/notes' },
    { id: 'folders', label: 'Folders', icon: Folder, href: '/folders' },
    { id: 'favorites', label: 'Favorites', icon: Bookmark, href: '/favorites' },
    { id: 'archive', label: 'Archive', icon: Archive, href: '/archive' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
  ];

  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/') return 'all-items';
    const item = menuItems.find(m => m.href !== '/' && path.startsWith(m.href));
    return item ? item.id : 'all-items';
  };

  const activeItem = getActiveItem();

  return (
    <aside className={`left-panel ${isOpen ? 'open' : 'closed'}`}>
      <button className="add-file-section" onClick={onAddNew}>
        <div className="plus-group">
          <PlusCircle className="plus-icon" size={75} strokeWidth={1.5} />
        </div>
        <span className="label-text">Add new file</span>
      </button>

      <nav className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                onSelectMenuItem?.();
                navigate(item.href);
              }}
            >
              <div className="nav-content">
                <Icon className="nav-icon" size={32} />
                <span className="label-text">{item.label}</span>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};