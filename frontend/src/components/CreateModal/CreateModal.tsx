import React, { useState } from 'react';
import { X, FileText, Folder as FolderIcon } from 'lucide-react';
import './CreateModal.css';

interface CreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreate: (type: 'note' | 'folder', name: string) => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({ isOpen, onClose, onCreate }) => {
	const [type, setType] = useState<'note' | 'folder'>('note');
	const [name, setName] = useState('');

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (name.trim()) {
			onCreate(type, name);
			setName('');
			onClose();
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content card-box note-variant" onClick={e => e.stopPropagation()}>
				<button className="modal-close-btn" onClick={onClose}><X size={24} /></button>

				<h2 className="modal-title">Create New Item</h2>

				<div className="type-selector">
					<button
						className={`type-btn ${type === 'note' ? 'active' : ''}`}
						onClick={() => setType('note')}
					>
						<FileText size={20} /> Note
					</button>
					<button
						className={`type-btn ${type === 'folder' ? 'active' : ''}`}
						onClick={() => setType('folder')}
					>
						<FolderIcon size={20} /> Folder
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<input
						type="text"
						className="modal-input"
						placeholder={type === 'note' ? "Note title..." : "Folder name..."}
						value={name}
						onChange={(e) => setName(e.target.value)}
						autoFocus
					/>
					<button type="submit" className="modal-submit-btn">Create</button>
				</form>
			</div>
		</div>
	);
};