import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import type {Level} from '@tiptap/extension-heading';
import {
  Bold, Italic, Strikethrough, Code, Edit2,
  AlignCenter, AlignLeft, AlignRight, AlignJustify,
  List, Table, Link as LinkIcon, ChevronDown
} from 'lucide-react';
import './RightPanel.css';

interface RightPanelProps {
  editor: Editor | null;
  isOpen: boolean;
}

export const RightPanel: React.FC<RightPanelProps> = ({ editor, isOpen  }) => {
  const [activeMenu, setActiveMenu] = useState<'headings' | 'align' | null>(null);

  if (!editor) return null;

  const toggleMenu = (menu: 'headings' | 'align') => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const headingLevels: Level[] = [1, 2, 3, 4];

  return (
    <aside className={`right-panel ${isOpen ? 'open' : ''}`}>
      <div className="panel-container">

        {/* Paragraph Menu (H1-H4) */}
        <div className="menu-wrapper">
          <button
            className={`panel-btn ${activeMenu === 'headings' ? 'active' : ''}`}
            onClick={() => toggleMenu('headings')}
          >
            <span className="btn-text">H1</span>
            <ChevronDown className="chevron-icon" size={10} strokeWidth={3} />
          </button>

          {activeMenu === 'headings' && (
            <div className="sub-menu paragraph-menu">
              {headingLevels.map((level) => (
                <button
                  key={level}
                  className="sub-btn"
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level }).run();
                    setActiveMenu(null);
                  }}
                >
                  H{level}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Basic Formatting */}
        <button
          className={`panel-btn ${editor.isActive('bold') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={20} />
        </button>

        <button
          className={`panel-btn ${editor.isActive('italic') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={20} />
        </button>

        <button
          className={`panel-btn ${editor.isActive('strike') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={20} />
        </button>

        <button
          className={`panel-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code size={20} />
        </button>

        <button className="panel-btn"><Edit2 size={18} /></button>

        <div className="menu-wrapper">
          <button
            className={`panel-btn ${activeMenu === 'align' ? 'active' : ''}`}
            onClick={() => toggleMenu('align')}
          >
            <AlignCenter size={20} />
            <ChevronDown className="chevron-icon" size={10} strokeWidth={3} />
          </button>

          {activeMenu === 'align' && (
            <div className="sub-menu align-menu">
              <button className="sub-btn" onClick={() => { (editor.chain().focus() as any).setTextAlign('left').run(); setActiveMenu(null); }}><AlignLeft size={18} /></button>
              <button className="sub-btn" onClick={() => { (editor.chain().focus() as any).setTextAlign('center').run(); setActiveMenu(null); }}><AlignCenter size={18} /></button>
              <button className="sub-btn" onClick={() => { (editor.chain().focus() as any).setTextAlign('right').run(); setActiveMenu(null); }}><AlignRight size={18} /></button>
              <button className="sub-btn" onClick={() => { (editor.chain().focus() as any).setTextAlign('justify').run(); setActiveMenu(null); }}><AlignJustify size={18} /></button>
            </div>
          )}
        </div>

        <button className="panel-btn"><List size={20} /></button>
        <button className="panel-btn"><Table size={20} /></button>
        <button className="panel-btn last"><LinkIcon size={18} /></button>
      </div>
    </aside>
  );
};