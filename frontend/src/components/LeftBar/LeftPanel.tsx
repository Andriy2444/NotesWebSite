import React, { useState } from 'react';
import { PlusCircle, FileText, Folder, Bookmark, Archive, Calendar, LayoutGrid } from 'lucide-react';
import './LeftPanel.css';
import {useNavigate} from "react-router-dom";

interface LeftPanelProps {
  isOpen: boolean;
  onSelectMenuItem?: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ isOpen, onSelectMenuItem }) => {
  const [activeItem, setActiveItem] = useState('all-items');
  const navigate = useNavigate();

  const menuItems = [
    { id: 'all-items', label: 'All items', icon: LayoutGrid, href: '/#all-items' },
    { id: 'notes', label: 'Notes', icon: FileText, href: '/#notes' },
    { id: 'folder', label: 'Folder', icon: Folder, href: '/#folders' },
    { id: 'favorites', label: 'Favorites', icon: Bookmark, href: '/#favorites' },
    { id: 'archive', label: 'Archive', icon: Archive, href: '/#archive' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/#calendar' },
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