import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { MoreVertical, Folder as FolderIcon } from 'lucide-react';
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
  updatedAt?: string;
  _count?: {
    notes: number;
  };
  type: 'folder';
}

type WorkspaceItem = NoteItem | FolderItem;

const MoreVert = () => (
  <button className="more-vert-btn">
    <MoreVertical size={24}/>
  </button>
);

const NoteBlock: React.FC<{ data: NoteItem }> = ({data}) => {
  const dateStr = data.noteDate
    ? new Date(data.noteDate).toLocaleDateString('uk-UA')
    : 'Немає дати';

  return (
    <div className="card-box note-variant">
      <MoreVert/>
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

const FolderBlock: React.FC<{ data: FolderItem }> = ({data}) => {
  return (
    <div className="card-box folder-variant">
      <MoreVert/>
      <div className="folder-icon-area">
        <FolderIcon size={60} color="var(--color-purple)" fill="rgba(168, 85, 247, 0.2)"/>
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
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = async (type: 'note' | 'folder', name: string) => {
    const token = localStorage.getItem('accessToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const endpoint = type === 'folder' ? 'folders' : 'notes';
    const data = type === 'folder' ? { name } : { title: name, content: '' };

    try {
      await axios.post(`http://localhost:3000/${endpoint}`, data, config);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const config = {headers: {Authorization: `Bearer ${token}`}};
        const path = location.pathname;

        const [foldersRes, notesRes] = await Promise.all([
          (path === '/' || path === '/folders')
            ? axios.get<FolderItem[]>('http://localhost:3000/folders', config)
            : Promise.resolve({data: []}),
          (path === '/' || path === '/notes')
            ? axios.get<NoteItem[]>('http://localhost:3000/notes', config)
            : Promise.resolve({data: []})
        ]);

        const folders = foldersRes.data.map(f => ({ ...f, type: 'folder' as const }));
        const notes = notesRes.data.map(n => ({ ...n, type: 'note' as const }));

        const combined = [...folders, ...notes].sort((a, b) =>
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
  }, [location.pathname]);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="workspace-grid">
      <div
        className="card-box note-variant"
        style={{
          border: '2px dashed var(--color-white-25)',
          cursor: 'pointer',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onClick={() => {setIsModalOpen(true); console.log('Create new item')}}
      >
        <span
          style={{fontSize: '60px', color: 'var(--color-purple)', textShadow: '0 0 10px var(--color-purple)'}}>+</span>
        <span style={{fontWeight: 300, opacity: 0.8}}>Add new item</span>
      </div>

      {items.map((item) =>
        item.type === 'folder'
          ? <FolderBlock key={item.id} data={item}/>
          : <NoteBlock key={item.id} data={item}/>
      )}

      <CreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};