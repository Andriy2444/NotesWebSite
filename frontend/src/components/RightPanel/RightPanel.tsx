import React, {useEffect, useRef, useState} from 'react';
import { Editor } from '@tiptap/react';
import type {Level} from '@tiptap/extension-heading';
import {
  Bold, Italic, Strikethrough, Code, Edit2,
  AlignCenter, AlignLeft, AlignRight, AlignJustify,
  List, Table, Link as LinkIcon, ChevronDown
} from 'lucide-react';
import './RightPanel.css';
import '@tiptap/extension-text-align';
import '@tiptap/extension-color';
import '@tiptap/extension-text-style';

interface RightPanelProps {
  editor: Editor | null;
  isOpen: boolean;
}



export const RightPanel: React.FC<RightPanelProps> = ({ editor, isOpen  }) => {
  const [activeMenu, setActiveMenu] = useState<'headings' | 'align' | 'colors' | 'table' | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const update = () => setTick(s => s + 1);

    editor.on('selectionUpdate', update);
    editor.on('transaction', update);

    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
    };
  }, [editor]);

  if (!editor) return null;

  const presetColors = [
    '#A855F7',
    '#EC4899',
    '#3B82F6',
    '#22C55E',
    '#F59E0B',
    '#FFFFFF',
  ];

  const toggleMenu = (menu: 'headings' | 'align' | 'colors' | 'table') => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'H1';
    if (editor.isActive('heading', { level: 2 })) return 'H2';
    if (editor.isActive('heading', { level: 3 })) return 'H3';
    if (editor.isActive('heading', { level: 4 })) return 'H4';
    return 'P';
  };

  const handleColorChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newColor = e.currentTarget.value;
    editor.chain().focus().setColor(newColor).run();
    setActiveMenu(null);
  };

  const headingLevels: Level[] = [1, 2, 3, 4];

  return (
    <aside className={`right-panel ${isOpen ? 'open' : ''}`}>
      <div className="panel-container">

        <div className="menu-wrapper">
          <button
            className={`panel-btn ${activeMenu === 'headings' ? 'active' : ''}`}
            onClick={() => toggleMenu('headings')}
          >
            <span className="btn-text">{getCurrentHeading()}</span>
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

        <div className="menu-wrapper">
          <button
            className={`panel-btn ${activeMenu === 'colors' ? 'active' : ''}`}
            onClick={() => toggleMenu('colors')}
            style={{ color: editor.getAttributes('textStyle').color || 'var(--color-purple)' }}
          >
            <Edit2 size={18} />
            <ChevronDown className="chevron-icon" size={10} strokeWidth={3} />
          </button>

          {activeMenu === 'colors' && (
            <div className="sub-menu color-menu">
              {presetColors.map((color) => (
                <button
                  key={color}
                  className="color-circle-btn"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setActiveMenu(null);
                  }}
                />
              ))}

              <button
                className="sub-btn custom-color-btn"
                onClick={() => colorInputRef.current?.click()}
              >
                <span style={{ fontSize: '12px' }}>+</span>
              </button>
            </div>
          )}

          <input
            type="color"
            ref={colorInputRef}
            onInput={handleColorChange}
            value={editor.getAttributes('textStyle').color || '#A855F7FF'}
            style={{ display: 'none' }}
          />
        </div>

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
              <button className="sub-btn" onClick={() => { editor.chain().focus().setTextAlign('left').run(); setActiveMenu(null); }}><AlignLeft size={18} /></button>
              <button className="sub-btn" onClick={() => { editor.chain().focus().setTextAlign('center').run(); setActiveMenu(null); }}><AlignCenter size={18} /></button>
              <button className="sub-btn" onClick={() => { editor.chain().focus().setTextAlign('right').run(); setActiveMenu(null); }}><AlignRight size={18} /></button>
              <button className="sub-btn" onClick={() => { editor.chain().focus().setTextAlign('justify').run(); setActiveMenu(null); }}><AlignJustify size={18} /></button>
            </div>
          )}
        </div>

        <button
          className={`panel-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={20} />
        </button>

        <div className="menu-wrapper">
          <button
            className={`panel-btn ${editor.isActive('table') ? 'active' : ''}`}
            onClick={() => {
              const isInTable = editor.can().deleteTable();

              if (!isInTable) {
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
              } else {
                toggleMenu('table');
              }
            }}
          >
            <Table size={20} />
            {editor.can().deleteTable() && <ChevronDown className="chevron-icon" size={10} strokeWidth={3} />}
          </button>

          {activeMenu === 'table' && editor.can().deleteTable() && (
            <div className="sub-menu table-menu">
              <button className="sub-btn" onClick={() => { editor.chain().focus().addRowAfter().run(); setActiveMenu(null); }}>
                + Row
              </button>
              <button className="sub-btn" onClick={() => { editor.chain().focus().addColumnAfter().run(); setActiveMenu(null); }}>
                + Col
              </button>
              <button className="sub-btn" onClick={() => { editor.chain().focus().deleteRow().run(); setActiveMenu(null); }}>
                - Row
              </button>
              <button className="sub-btn" onClick={() => { editor.chain().focus().deleteColumn().run(); setActiveMenu(null); }}>
                - Col
              </button>
              <button
                className="sub-btn delete-btn"
                style={{ color: '#ef4444', fontWeight: 'bold', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)' }}
                onClick={() => { editor.chain().focus().deleteTable().run(); setActiveMenu(null); }}
              >
                Del Table
              </button>
            </div>
          )}
        </div>

        <button
          className={`panel-btn last ${editor.isActive('link') ? 'active' : ''}`}
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href;
            const url = window.prompt('URL:', previousUrl);

            if (url === null) return;

            if (url === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              return;
            }

            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }}
        >
          <LinkIcon size={18} />
        </button>
      </div>
    </aside>
  );
};