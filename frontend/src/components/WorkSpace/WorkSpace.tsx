import React, {useEffect, useState} from 'react';
import {api} from '../../api.ts';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {MoreVertical, Folder as FolderIcon, ArrowLeft, Star, Archive, Trash2, RotateCcw, SlidersHorizontal} from 'lucide-react';
import './WorkSpace.css';
import {CreateModal} from "../CreateModal/CreateModal.tsx";

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
  isFavorite?: boolean;
  tags: Tag[];
  type: 'note';
}

interface FolderItem {
  id: string;
  name: string;
  createdAt: string;
  isFavorite?: boolean;
  _count?: { notes: number };
  type: 'folder';
}

type ItemAction = 'favorite' | 'archive' | 'unarchive' | 'trash' | 'restore' | 'delete';
type WorkspaceItem = (NoteItem | FolderItem) & { isFavorite?: boolean };

interface MoreMenuProps {
  onAction: (action: ItemAction) => void;
  isFavorite?: boolean;
  view: string;
}

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, onConfirm, onCancel }) => (
  <div className="confirm-backdrop" onClick={onCancel}>
    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
      <h3 className="confirm-title">{title}</h3>
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button className="confirm-btn cancel" onClick={onCancel}>Cancel</button>
        <button className="confirm-btn danger" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

const MoreMenu: React.FC<MoreMenuProps> = ({ onAction, isFavorite, view }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (e: React.MouseEvent, action: ItemAction) => {
    e.stopPropagation();
    onAction(action);
    setIsOpen(false);
  };

  return (
    <div className="more-vert-container">
      <button
        className="more-vert-btn"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
      >
        <MoreVertical size={20}/>
      </button>
      {isOpen && (
        <>
          <div className="menu-backdrop" onClick={() => setIsOpen(false)} />
          <div className="glass-menu">
            {view === 'trash' ? (
              <>
                <div className="menu-item" onClick={(e) => handleAction(e, 'restore')}>
                  <RotateCcw size={16} />
                  Restore
                </div>
                <div className="menu-item delete" onClick={(e) => handleAction(e, 'delete')}>
                  <Trash2 size={16} />
                  Delete permanent
                </div>
              </>
            ) : view === 'archive' ? (
              <>
                <div className="menu-item" onClick={(e) => handleAction(e, 'unarchive')}>
                  <Archive size={16} />
                  Unarchive
                </div>
                <div className="menu-item delete" onClick={(e) => handleAction(e, 'trash')}>
                  <Trash2 size={16} />
                  Move to Trash
                </div>
              </>
            ) : (
              <>
                <div className="menu-item" onClick={(e) => handleAction(e, 'favorite')}>
                  <Star size={16} fill={isFavorite ? "var(--color-purple)" : "none"} color={isFavorite ? "var(--color-purple)" : "currentColor"} />
                  {isFavorite ? 'Unfavorite' : 'Favorite'}
                </div>
                <div className="menu-item" onClick={(e) => handleAction(e, 'archive')}>
                  <Archive size={16} />
                  Archive
                </div>
                <div className="menu-item delete" onClick={(e) => handleAction(e, 'trash')}>
                  <Trash2 size={16} />
                  Move to Trash
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const NoteBlock: React.FC<{
  data: NoteItem;
  onClick: () => void;
  onAction: (id: string, action: ItemAction) => void;
  view: string;
}> = ({ data, onClick, onAction, view }) => {
  const dateStr = data.noteDate
    ? new Date(data.noteDate).toLocaleDateString('uk-UA')
    : 'No data';

  return (
    <div className="card-box note-variant" onClick={onClick} style={{ cursor: 'pointer' }}>
      <MoreMenu onAction={(action) => onAction(data.id, action)} isFavorite={data.isFavorite} view={view} />
      <h2 className="card-title">{data.title}</h2>
      <div className="card-text-content" dangerouslySetInnerHTML={{ __html: data.content }} />
      <div className="card-meta-block">
        <span>📅 {dateStr}</span>
        <span>🕒 {new Date(data.updatedAt || data.createdAt).toLocaleDateString('uk-UA')}</span>
      </div>
      <div className="card-tags">
        {data.tags?.map((t, i) => <span key={i}>#{t.tag.name}</span>)}
      </div>
    </div>
  );
};

const FolderBlock: React.FC<{
  data: FolderItem;
  onClick: () => void;
  onAction: (id: string, action: ItemAction) => void;
  view: string;
}> = ({ data, onClick, onAction, view }) => (
  <div className="card-box folder-variant" onClick={onClick} style={{ cursor: 'pointer' }}>
    <MoreMenu onAction={(action) => onAction(data.id, action)} isFavorite={data.isFavorite} view={view} />
    <div className="folder-icon-area">
      <FolderIcon size={60} color="var(--color-purple)" fill="rgba(168, 85, 247, 0.2)"/>
      <h2 className="card-title">{data.name}</h2>
    </div>
    <div className="card-meta-block">
      <span>📅 {new Date(data.createdAt).toLocaleDateString('uk-UA')}</span>
      <span>📄 {data._count?.notes || 0} notes</span>
    </div>
  </div>
);

export const WorkSpace: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: 'note' | 'folder'; name: string } | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'folders' | 'notes'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'type'>('type');
  const location = useLocation();
  const navigate = useNavigate();
  const { folderId } = useParams<{ folderId: string }>();
  const view = new URLSearchParams(location.search).get('view') || 'all';

  const fetchWorkspaceData = async () => {
    setLoading(true);
    try {
      const scope = folderId ?? (view === 'all' ? 'null' : undefined);

      const [notesRes, foldersRes] = await Promise.all([
        api.get<NoteItem[]>(`/notes${scope !== undefined ? `?folderId=${scope}&` : '?'}view=${view}`),
        api.get<FolderItem[]>(`/folders${scope !== undefined ? `?parentId=${scope}&` : '?'}view=${view}`),
      ]);

      const combined: WorkspaceItem[] = [
        ...(foldersRes.data || []).map(f => ({ ...f, type: 'folder' as const })),
        ...(notesRes.data || []).map(n => ({ ...n, type: 'note' as const })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setItems(combined);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [location.pathname, location.search, folderId]);

  const handleCreate = async (type: 'note' | 'folder', name: string) => {
    const endpoint = type === 'folder' ? '/folders' : '/notes';
    const payload = type === 'folder'
      ? { name, parentId: folderId || null }
      : { title: name, content: '', folderId: folderId || null, noteDate: new Date().toISOString() };

    try {
      await api.post(endpoint, payload);
      await fetchWorkspaceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemAction = async (id: string, type: 'note' | 'folder', action: ItemAction) => {
    if (action === 'delete') {
      const item = items.find(i => i.id === id);
      if (!item) return;
      const name = 'title' in item ? item.title : item.name;
      setConfirmDelete({ id, type, name });
      return;
    }

    const currentItem = items.find(i => i.id === id);
    if (!currentItem) return;

    const payload: Record<string, unknown> = {};
    if (action === 'favorite')       payload.isFavorite = !currentItem.isFavorite;
    else if (action === 'archive')   payload.isArchived = true;
    else if (action === 'unarchive') payload.isArchived = false;
    else if (action === 'trash')     payload.toTrash = true;
    else if (action === 'restore')   payload.toTrash = false;

    try {
      await api.patch(`/${type === 'folder' ? 'folders' : 'notes'}/${id}`, payload);
      setItems(prev =>
        prev
          .map(item => item.id === id ? { ...item, ...payload } : item)
          .filter(item => !(
            (action === 'trash' || action === 'archive' || action === 'restore' || action === 'unarchive') &&
            item.id === id
          ))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const { id, type } = confirmDelete;
    try {
      await api.delete(`/${type === 'folder' ? 'folders' : 'notes'}/${id}`);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDelete(null);
    }
  };

  const filteredItems = items
    .filter(item =>
      ('title' in item ? item.title : item.name)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .filter(item => {
      if (filterType === 'folders') return item.type === 'folder';
      if (filterType === 'notes') return item.type === 'note';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'type') {
        if (a.type === 'folder' && b.type === 'note') return -1;
        if (a.type === 'note' && b.type === 'folder') return 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="workspace-wrapper">
      <div className="workspace-filter-container">
        <button
          className={`filter-toggle-btn ${isFilterOpen ? 'active' : ''}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <SlidersHorizontal size={20} />
          <span>Filter</span>
        </button>

        {isFilterOpen && (
          <>
            <div className="filter-backdrop" onClick={() => setIsFilterOpen(false)} />
            <div className="glass-filter-menu">
              <div className="filter-menu-section-title">Filter by</div>
              <div
                className={`filter-item ${filterType === 'all' ? 'selected' : ''}`}
                onClick={() => { setFilterType('all'); setIsFilterOpen(false); }}
              >
                All Items
              </div>
              <div
                className={`filter-item ${filterType === 'folders' ? 'selected' : ''}`}
                onClick={() => { setFilterType('folders'); setIsFilterOpen(false); }}
              >
                Folders Only
              </div>
              <div
                className={`filter-item ${filterType === 'notes' ? 'selected' : ''}`}
                onClick={() => { setFilterType('notes'); setIsFilterOpen(false); }}
              >
                Notes Only
              </div>

              <div className="filter-menu-divider" />

              <div className="filter-menu-section-title">Sort by</div>
              <div
                className={`filter-item ${sortBy === 'type' ? 'selected' : ''}`}
                onClick={() => { setSortBy('type'); setIsFilterOpen(false); }}
              >
                Folders First
              </div>
              <div
                className={`filter-item ${sortBy === 'date' ? 'selected' : ''}`}
                onClick={() => { setSortBy('date'); setIsFilterOpen(false); }}
              >
                By Date Created
              </div>
            </div>
          </>
        )}
      </div>
      <div className="workspace-grid">
        {confirmDelete && (
          <ConfirmModal
            title="Delete permanently?"
            message={`"${confirmDelete.name}" will be deleted forever.`}
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmDelete(null)}
          />
        )}

        {folderId && (
          <div
            className="card-box folder-variant back-btn"
            onClick={() => navigate(-1)}
            style={{ cursor: 'pointer', border: '1px solid var(--color-purple)' }}
          >
            <ArrowLeft size={40} color="var(--color-purple)"/>
            <span style={{ marginTop: '10px' }}>Back</span>
          </div>
        )}

        {view === 'all' && (
          <div
            className="card-box note-variant"
            style={{ border: '2px dashed var(--color-white-25)', cursor: 'pointer', justifyContent: 'center', alignItems: 'center' }}
            onClick={() => setIsModalOpen(true)}
          >
            <span style={{ fontSize: '60px', color: 'var(--color-purple)', textShadow: '0 0 10px var(--color-purple)' }}>+</span>
            <span style={{ fontWeight: 300, opacity: 0.8 }}>Add new item</span>
          </div>
        )}

        {filteredItems.map(item =>
          item.type === 'folder'
            ? <FolderBlock
                key={item.id}
                data={item as FolderItem}
                onClick={() => navigate(`/folders/${item.id}?view=${view}`)}
                onAction={(id, action) => handleItemAction(id, 'folder', action)}
                view={view}
              />
            : <NoteBlock
                key={item.id}
                data={item as NoteItem}
                onClick={() => navigate(`/notes/${item.id}?view=${view}`)}
                onAction={(id, action) => handleItemAction(id, 'note', action)}
                view={view}
              />
        )}

        <CreateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreate}
        />
      </div>
    </div>
  );
};