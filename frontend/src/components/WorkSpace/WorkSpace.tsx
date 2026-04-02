import React, { useEffect, useState } from 'react';
import { api } from '../../api.ts';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { MoreVertical, Folder as FolderIcon, ArrowLeft } from 'lucide-react';
import './WorkSpace.css';
import { CreateModal } from "../CreateModal/CreateModal.tsx";

interface Tag {
  tag: { name: string };
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
  _count?: {
    notes: number;
  };
  type: 'folder';
}

type WorkspaceItem = NoteItem | FolderItem;

const MoreVert = () => (
  <button className="more-vert-btn">
    <MoreVertical size={24} />
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

const FolderBlock: React.FC<{ data: FolderItem; onClick: () => void }> = ({ data, onClick }) => {
  return (
    <div className="card-box folder-variant" onClick={onClick} style={{ cursor: 'pointer' }}>
      <MoreVert />
      <div className="folder-icon-area">
        <FolderIcon size={60} color="var(--color-purple)" fill="rgba(168, 85, 247, 0.2)" />
        <h2 className="card-title">{data.name}</h2>
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { folderId } = useParams<{ folderId: string }>();

  const handleCreate = async (type: 'note' | 'folder', name: string) => {
    const endpoint = type === 'folder' ? '/folders' : '/notes';
    const payload = type === 'folder'
      ? { name }
      : {
          title: name,
          content: '',
          folderId: folderId || null,
          noteDate: new Date().toISOString()
        };

    try {
      await api.post(endpoint, payload);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      setLoading(true);
      try {
        const path = location.pathname;
        const params = new URLSearchParams();

        if (path === '/' || path === '/all-items') {
          params.append('folderId', 'null');
        } else if (folderId) {
          params.append('folderId', folderId);
        } else if (path === '/favorites') {
          params.append('isFavorite', 'true');
        }

        const notesUrl = `/notes?${params.toString()}`;
        const foldersUrl = '/folders';

        const [notesRes, foldersRes] = await Promise.all([
          api.get<NoteItem[]>(notesUrl),
          (path === '/' || path === '/all-items' || path === '/folders')
            ? api.get<FolderItem[]>(foldersUrl)
            : Promise.resolve({ data: [] })
        ]);

        const notesData = (notesRes.data || []).map(n => ({ ...n, type: 'note' as const }));
        const foldersData = (foldersRes.data || []).map(f => ({ ...f, type: 'folder' as const }));

        let combined: WorkspaceItem[] = [];

        if (path === '/folders') {
          combined = [...foldersData];
        } else if (path === '/notes') {
          combined = [...notesData];
        } else {
          combined = [...foldersData, ...notesData];
        }

        combined.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setItems(combined);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceData();
  }, [location.pathname, folderId]);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="workspace-grid">
      {folderId && (
        <div
          className="card-box folder-variant back-btn"
          onClick={() => navigate(-1)}
          style={{ cursor: 'pointer', border: '1px solid var(--color-purple)' }}
        >
          <ArrowLeft size={40} color="var(--color-purple)" />
          <span style={{ marginTop: '10px' }}>Назад</span>
        </div>
      )}

      <div
        className="card-box note-variant"
        style={{
          border: '2px dashed var(--color-white-25)',
          cursor: 'pointer',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <span style={{ fontSize: '60px', color: 'var(--color-purple)', textShadow: '0 0 10px var(--color-purple)' }}>+</span>
        <span style={{ fontWeight: 300, opacity: 0.8 }}>Add new item</span>
      </div>

      {items.map((item) =>
        item.type === 'folder'
          ? <FolderBlock
              key={item.id}
              data={item}
              onClick={() => navigate(`/folders/${item.id}`)}
            />
          : <NoteBlock key={item.id} data={item} />
      )}

      <CreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};