import React from 'react';
import {Bookmark, Archive, Calendar, LayoutGrid, Trash2} from 'lucide-react';
import './LeftPanel.css';
import { useNavigate, useLocation } from "react-router-dom";

interface LeftPanelProps {
  isOpen: boolean;
  onSelectMenuItem?: () => void;
  onAddNew?: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ isOpen, onSelectMenuItem }) => {
  const navigate = useNavigate();
  const location = useLocation();

const menuItems = [
  { id: 'all-items', label: 'All items', icon: LayoutGrid, href: '/?view=all' },
  { id: 'favorites', label: 'Favorites', icon: Bookmark, href: '/?view=favorites' },
  { id: 'archive', label: 'Archive', icon: Archive, href: '/?view=archive' },
  { id: 'trash', label: 'Trash', icon: Trash2, href: '/?view=trash' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
];

  const getActiveItem = () => {
    const path = location.pathname;
    const view = new URLSearchParams(location.search).get('view') || 'all';

    if (path.startsWith('/calendar')) return 'calendar';
    if (path.startsWith('/folders')) return 'all-items';

    switch (view) {
      case 'favorites': return 'favorites';
      case 'archive':   return 'archive';
      case 'trash':     return 'trash';
      default:          return 'all-items';
    }
  };

  const activeItem = getActiveItem();

  return (
    <aside className={`left-panel ${isOpen ? 'open' : 'closed'}`}>
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