import { useState } from "react";
import "../../pages/Shared/SharedPage.css"

export interface SharedUser {
  userId: string;
  role: "VIEWER" | "EDITOR";
  user: { id: string; username: string; email: string };
}

export interface ShareableItem {
  id: string;
  type: "note" | "folder";
  userId: string;
  sharedWith?: SharedUser[];
  title?: string;
  name?: string;
}

export type Role = "VIEWER" | "EDITOR";

const itemName = (item: ShareableItem) => item.title ?? item.name ?? "";

export function ShareModal({ item, currentUserId, onClose, onRevoke, onChangeRole, onShare }: {
  item: ShareableItem;
  currentUserId: string;
  onClose: () => void;
  onRevoke: (userId: string) => Promise<void>;
  onChangeRole: (userId: string, role: Role) => Promise<void>;
  onShare: (email: string, role: Role) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("VIEWER");
  const [loading, setLoading] = useState(false);
  const isOwner = item.userId === currentUserId;

  const handleShare = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try { await onShare(email.trim(), role); setEmail(""); }
    finally { setLoading(false); }
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="share-modal-h3">Manage access — {itemName(item)}</h3>

        {(item.sharedWith ?? []).length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <p className="share-modal-label">Shared with</p>
            {item.sharedWith!.map((s) => (
              <div key={s.userId} className="share-modal-user-row">
                <span className="share-modal-email">
                  {s.user?.email || `User (${s.userId.substring(0, 5)}...)`}
                </span>
                {isOwner ? (
                  <>
                    <select
                      className="share-modal-select"
                      value={s.role}
                      onChange={(e) => onChangeRole(s.userId, e.target.value as Role)}
                    >
                      <option value="VIEWER">Viewer</option>
                      <option value="EDITOR">Editor</option>
                    </select>
                    <button className="share-modal-revoke-btn" onClick={() => onRevoke(s.userId)}>
                      Revoke
                    </button>
                  </>
                ) : (
                  <span className="share-modal-role-badge">{s.role}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {isOwner && (
          <div>
            <p className="share-modal-label">Add people</p>
            <div className="share-modal-form-group">
              <input
                type="email"
                className="share-modal-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleShare()}
              />
              <select
                className="share-modal-select"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="VIEWER">Viewer</option>
                <option value="EDITOR">Editor</option>
              </select>
            </div>
            <button
              className="share-modal-primary-btn"
              onClick={handleShare}
              disabled={loading || !email.trim()}
            >
              {loading ? "Sharing..." : "Share"}
            </button>
          </div>
        )}

        <button className="share-modal-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}