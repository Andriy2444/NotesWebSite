import React, {useState, useEffect, useCallback, useRef} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useEditor, EditorContent} from '@tiptap/react';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import ResizeImage from 'tiptap-extension-resize-image'
import {Color} from "@tiptap/extension-text-style";
import {TextStyle} from '@tiptap/extension-text-style'
import {api} from '../../api';
import {TopBar} from "../../components/Topbar/TopBar.tsx";
import {LeftPanel} from "../../components/LeftBar/LeftPanel.tsx";
import {RightPanel} from "../../components/RightPanel/RightPanel.tsx";
import "./NotePage.css";
import {Table, TableCell, TableHeader, TableRow} from "@tiptap/extension-table";
import {ArrowLeft, History, Palette} from "lucide-react";
import { VersionsPanel } from '../../components/VersionsPanel/VersionsPanel';


interface NoteData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  noteDate: string;
  updatedAt: string;
  role?: 'EDITOR' | 'VIEWER';
}

const NotePage: React.FC = () => {
  const {id} = useParams<{ id: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [noteData, setNoteData] = useState<NoteData | null>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const navigate = useNavigate();
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const isReadOnly = noteData?.role === 'VIEWER';

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({placeholder: 'Start writing...', emptyEditorClass: 'is-editor-empty'}),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      TextStyle,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      ResizeImage,
      // Link,
    ],
    content: '',
    editable: !isReadOnly,
    onUpdate: ({editor}) => {
      handleAutoSave(editor.getHTML());
    },
    onSelectionUpdate: () => {
    }
  });

  const handleAutoSave = useCallback(
    (content?: string, title?: string) => {
      if (isReadOnly || isRemoteUpdate.current) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
        if (id) {
          try {
            const payload: { content?: string; title?: string } = {};
            if (content !== undefined) payload.content = content;
            if (title !== undefined) payload.title = title;

            const res = await api.patch<NoteData>(`/notes/${id}`, payload);

            setNoteData(prev => prev ? { ...prev, updatedAt: res.data.updatedAt } : null);
          } catch (err) {
            console.error("Save error:", err);
          }
        }
      }, 700);
    },
    [id, isReadOnly]
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
      editor.setEditable(noteData.role !== 'VIEWER');

      if (currentContent === '<p></p>' || currentContent === '') {
        const sanitized = (noteData.content || '<p></p>')
          .replace(/#([0-9a-fA-F]{6})FF"/gi, '#$1"');
        editor.commands.setContent(sanitized);
      }
    }
  }, [editor, noteData?.id]);

  const wsRef = useRef<WebSocket | null>(null);
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    if (!id) return;

    let ws: WebSocket;

    const connect = () => {
      const token = localStorage.getItem('accessToken');
      ws = new WebSocket(`ws://localhost:3000/ws?noteId=${id}&token=${token}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data) as {
          type: string;
          content?: string;
          title?: string;
          updatedAt?: string;
        };

        if (data.type === 'note_updated') {
          isRemoteUpdate.current = true;

          if (data.content && editor && !editor.isDestroyed) {
            if (editor.getHTML() !== data.content) {
              const { from, to } = editor.state.selection;
              editor.commands.setContent(data.content, { emitUpdate: false });
              const docSize = editor.state.doc.content.size;
              if (from <= docSize) {
                editor.commands.setTextSelection({ from, to: Math.min(to, docSize) });
              }
            }
          }

          if (data.title) {
            setNoteData(prev => prev ? { ...prev, title: data.title!, updatedAt: data.updatedAt! } : null);
          }

          isRemoteUpdate.current = false;
        }
      };

      ws.onclose = (event) => {
        if (event.code === 1008 || event.code === 1000) return;
        setTimeout(connect, 3000);
      };

      ws.onerror = (e) => console.error('WS error:', e);
    };

    connect();

    return () => ws?.close(1000, 'Component unmounted');
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) fetchNote(id);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [id, fetchNote]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handleTitleBlur = async () => {
    if (!id || !noteData || isReadOnly) return;
    try {
      await api.patch(`/notes/${id}`, {title: noteData.title});
    } catch (err) {
      console.error("Title save error:", err);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!id) return;
    try {
      const res = await api.post<NoteData>(`/notes/${id}/versions/${versionId}/restore`);
      setNoteData(res.data);
      editor?.commands.setContent(res.data.content || '<p></p>');
      setIsVersionsOpen(false);
    } catch (err) {
      console.error('Restore error:', err);
    }
  };

  return (
    <div className="page-wrapper">
      <TopBar onToggleMenu={toggleSidebar} onSearchChange={() => {
      }}/>

      <div className="content">
        <LeftPanel
          isOpen={isSidebarOpen}
          onSelectMenuItem={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
        />

        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="note-layout-container">
            <div className="file-editor">
              <div className="note-top-nav">
                <button className="back-button" onClick={() => navigate(-1)}>
                  <ArrowLeft size={20}/>
                  <span>Back</span>
                </button>
                {!isReadOnly && (
                  <button className="back-button" onClick={() => setIsVersionsOpen(true)}>
                    <History size={18} />
                    <span>History</span>
                  </button>
                )}
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
              {isReadOnly && (
                <div style={{
                  padding: '6px 12px',
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid var(--color-purple)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: 'var(--color-purple)',
                  marginBottom: '8px'
                }}>
                  👁 View only
                </div>
              )}
              <div className="note-content-scrollable">

                <div className="note-header">
                  <textarea
                    className="note-title-input"
                    placeholder="Untitled"
                    rows={1}
                    value={noteData?.title ?? ""}
                    readOnly={isReadOnly}
                    onChange={e => {
                      const newTitle = e.target.value;
                      setNoteData(prev => prev ? { ...prev, title: newTitle } : prev);
                      handleAutoSave(editor?.getHTML(), newTitle);
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
                </div>

                <EditorContent editor={editor} className="tiptap-renderer"/>
              </div>
            </div>
            {!isReadOnly && (
              <>
                <button
                  className="right-panel-toggle"
                  onClick={() => setIsRightPanelOpen(prev => !prev)}
                >
                  <Palette size={30} />
                </button>
                <RightPanel editor={editor} isOpen={isRightPanelOpen} />
              </>
            )}
          </div>
        </main>
      </div>
      {isVersionsOpen && id && (
        <VersionsPanel
          noteId={id}
          onRestore={handleRestoreVersion}
          onClose={() => setIsVersionsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotePage;