import React, { useState } from 'react';
import { PlusCircle, FileText, Folder, Bookmark, Archive, Calendar } from 'lucide-react';
import './LeftPanel.css';

interface LeftPanelProps {
  isOpen: boolean;
  onSelectMenuItem?: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ isOpen, onSelectMenuItem }) => {
  const [activeItem, setActiveItem] = useState('all-notes');

  const menuItems = [
    { id: 'all-notes', label: 'All notes', icon: FileText },
    { id: 'folder', label: 'Folder', icon: Folder },
    { id: 'favorites', label: 'Favorites', icon: Bookmark },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <aside className={`left-panel ${isOpen ? 'open' : 'closed'}`}>
      <button className="add-file-section">
        <div className="plus-group">
          <PlusCircle className="plus-icon" size={75} strokeWidth={1.5} />
        </div>
        <span className="label-text">Add new file</span>
      </button>

      <nav className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveItem(item.id);
                onSelectMenuItem?.();
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