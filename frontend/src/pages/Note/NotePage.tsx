import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { api } from '../../api';
import { TopBar } from "../../components/Topbar/TopBar.tsx";
import { LeftPanel } from "../../components/LeftBar/LeftPanel.tsx";
import { RightPanel } from "../../components/RightPanel/RightPanel.tsx";
import "./NotePage.css";

interface NoteData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  noteDate: string;
  updatedAt: string;
}

const NotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [noteData, setNoteData] = useState<NoteData | null>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing...', emptyEditorClass: 'is-editor-empty' }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      handleAutoSave(editor.getHTML());
    },
  });

  const handleAutoSave = useCallback(
    (content: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
        if (id) {
          try {
            await api.patch(`/notes/${id}`, { content });
          } catch (err) {
            console.error("Save error:", err);
          }
        }
      }, 700);
    },
    [id]
  );

  const fetchNote = useCallback(async (noteId: string) => {
    try {
      const res = await api.get<NoteData>(`/notes/${noteId}`);
      setNoteData(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, []);

  useEffect(() => {
    if (editor && noteData && !editor.isDestroyed) {
      const currentContent = editor.getHTML();
      if (currentContent === '<p></p>' || currentContent === '') {
        editor.commands.setContent(noteData.content || '<p></p>');
      }
    }
  }, [editor, noteData]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) fetchNote(id);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [id, fetchNote]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handleTitleBlur = async () => {
    if (!id || !noteData) return;
    try {
      await api.patch(`/notes/${id}`, { title: noteData.title });
    } catch (err) {
      console.error("Title save error:", err);
    }
  };

  return (
    <div className="page-wrapper">
      <TopBar onToggleMenu={toggleSidebar} onSearchChange={() => {}}  />

      <div className="content">
        <LeftPanel
          isOpen={isSidebarOpen}
          onSelectMenuItem={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
        />

        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="note-layout-container">
            <div className="file-editor">
              <div className="note-content-scrollable">

                <div className="note-header">
                  <textarea
                    className="note-title-input"
                    placeholder="Untitled"
                    rows={1}
                    value={noteData?.title ?? ""}
                    onChange={e => {
                      setNoteData(prev => prev ? { ...prev, title: e.target.value } : prev);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                  />

                  <div className="note-info">
                    <span>
                      Date: {noteData?.noteDate
                        ? new Date(noteData.noteDate).toLocaleDateString('uk-UA')
                        : (noteData ? new Date(noteData.createdAt).toLocaleDateString('uk-UA') : '...')}
                    </span>
                    <span>
                      Updated: {noteData ? new Date(noteData.updatedAt).toLocaleDateString('uk-UA') : '...'}
                    </span>
                  </div>
                </div>

                <EditorContent editor={editor} className="tiptap-renderer" />
              </div>
            </div>
              <button
                className="right-panel-toggle"
                onClick={() => setIsRightPanelOpen(prev => !prev)}
              >
                f
              </button>
            <RightPanel editor={editor} isOpen={isRightPanelOpen}/>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotePage;