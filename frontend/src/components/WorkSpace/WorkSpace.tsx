import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './WorkSpace.css';

interface Tag {
  tag: {
    name: string;
  };
}

interface NoteItem {
  id: string;
  title: string;
  content: string;
  noteDate: string | null;
  folderId: string | null;
  createdAt: string;
  updatedAt?: string;
  tags: Tag[];
  type: 'note';
}

interface FolderItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    notes: number;
  };
  type: 'folder';
}

type WorkspaceItem = NoteItem | FolderItem;

const MOCK_DATA: WorkspaceItem[] = [
  {
    id: '1',
    type: 'folder',
    name: 'Навчання',
    createdAt: new Date().toISOString(),
    _count: { notes: 12 },
  },
  {
    id: '2',
    type: 'note',
    title: 'План на тиждень',
    content: 'Дописати лабораторну роботу №3, налаштувати Docker для мікросервісів та сходити в зал.',
    noteDate: new Date().toISOString(),
    folderId: null,
    createdAt: new Date().toISOString(),
    tags: [{ tag: { name: 'Work' } }, { tag: { name: 'Uni' } }],
  },
  {
    id: '3',
    type: 'folder',
    name: 'Проекти',
    createdAt: new Date('2026-03-20').toISOString(),
    _count: { notes: 5 },
  },
  {
    id: '4',
    type: 'note',
    title: 'Ідеї для дизайну',
    content: 'Використати Glassmorphism, неонові фіолетові кольори та розмиття фону для карток.',
    noteDate: null,
    folderId: '3',
    createdAt: new Date('2026-03-21').toISOString(),
    tags: [{ tag: { name: 'Design' } }],
  }
];

const MoreVert: React.FC = () => (
  <button className="more-vert-btn" aria-label="Options">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
    </svg>
  </button>
);

const NoteBlock: React.FC<{ data: NoteItem }> = ({ data }) => {
  const dateStr = data.noteDate
    ? new Date(data.noteDate).toLocaleDateString('uk-UA')
    : 'Немає дати';

  return (
    <div className="card-box note-variant">
      <MoreVert />
      <h2 className="card-title">{data.title}</h2>
      <p className="card-text-content">{data.content}</p>

      <div className="card-meta-block">
        <span>📅 {dateStr}</span>
        <span>🕒 {new Date(data.createdAt).toLocaleDateString('uk-UA')}</span>
      </div>

      <div className="card-tags">
        {data.tags?.map((t, i) => (
          <span key={i}>#{t.tag.name}</span>
        ))}
      </div>
    </div>
  );
};

const FolderBlock: React.FC<{ data: FolderItem }> = ({ data }) => {
  return (
    <div className="card-box folder-variant">
      <MoreVert />

      <div className="folder-icon-area">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="var(--color-purple)">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
        </svg>
        <h2 className="card-title folder-title-adjust">{data.name}</h2>
      </div>

      <div className="card-meta-block">
        <span>🕒 {new Date(data.createdAt).toLocaleDateString('uk-UA')}</span>
        <span>📄 {data._count?.notes || 0} notes</span>
      </div>
    </div>
  );
};

export const WorkSpace: React.FC = () => {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [foldersRes, notesRes] = await Promise.all([
          axios.get<FolderItem[]>('http://localhost:3000/folders', config),
          axios.get<NoteItem[]>('http://localhost:3000/notes', config)
        ]);

        const folders = foldersRes.data.map(f => ({ ...f, type: 'folder' as const }));
        const notes = notesRes.data.map(n => ({ ...n, type: 'note' as const }));

        const combined = [...folders, ...notes].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setItems(combined);
      } catch (err) {
        console.warn('API error → using MOCK_DATA');
        console.error(err);

        setItems(
          [...MOCK_DATA].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceData();
  }, []);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <>
      <div className="workspace-grid">
        {items.map((item) =>
          item.type === 'folder'
            ? <FolderBlock key={item.id} data={item} />
            : <NoteBlock key={item.id} data={item} />
        )}
      </div>
    </>
  );
};