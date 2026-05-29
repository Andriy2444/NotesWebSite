import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { History, X, RotateCcw } from 'lucide-react';
import './VersionsPanel.css';

interface Version {
  id: string;
  title: string;
  createdAt: string;
}

interface Props {
  noteId: string;
  onRestore: (versionId: string) => void;
  onClose: () => void;
}

export const VersionsPanel: React.FC<Props> = ({ noteId, onRestore, onClose }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Version[]>(`/notes/${noteId}/versions`)
      .then(res => setVersions(res.data))
      .finally(() => setLoading(false));
  }, [noteId]);

  return (
    <div className="versions-overlay" onClick={onClose}>
      <div className="versions-panel" onClick={e => e.stopPropagation()}>
        <div className="versions-header">
          <span><History size={16} /> Version History</span>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        {loading && <p className="versions-empty">Loading...</p>}
        {!loading && versions.length === 0 && (
          <p className="versions-empty">No saved versions yet</p>
        )}

        <ul className="versions-list">
          {versions.map(v => (
            <li key={v.id} className="version-item">
              <div className="version-info">
                <span className="version-title">{v.title || 'Untitled'}</span>
                <span className="version-date">
                  {new Date(v.createdAt).toLocaleString('uk-UA')}
                </span>
              </div>
              <button
                className="version-restore-btn"
                onClick={() => onRestore(v.id)}
              >
                <RotateCcw size={14} /> Restore
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};