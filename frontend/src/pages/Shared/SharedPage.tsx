import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Folder as FolderIcon, MoreVertical } from "lucide-react";
import { TopBar } from "../../components/Topbar/TopBar.tsx";
import { LeftPanel } from "../../components/LeftBar/LeftPanel.tsx";
import { api } from "../../api.ts";
import { ShareModal } from "../../components/ShareModal/ShareModal.tsx";
import "./SharedPage.css"

interface SharedUser {
  userId: string;
  role: "VIEWER" | "EDITOR";
  user: { id: string; username: string; email: string };
}

interface NoteItem {
  id: string; title: string; content: string;
  noteDate: string | null; createdAt: string; updatedAt?: string;
  tags: { tag: { name: string } }[];
  userId: string; sharedWith?: SharedUser[];
  type: "note";
}

interface FolderItem {
  id: string; name: string; createdAt: string;
  userId: string; sharedWith?: SharedUser[];
  _count?: { notes: number };
  type: "folder";
}

type SharedItem = NoteItem | FolderItem;
type Role = "VIEWER" | "EDITOR";

const itemName = (item: SharedItem) => "title" in item ? item.title : item.name;

function MoreMenu({ item, currentUserId, onOpenShare, onLeave }: {
  item: SharedItem; currentUserId: string;
  onOpenShare: () => void; onLeave: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isOwner = item.userId === currentUserId;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="more-vert-container">
      <button className="more-vert-btn" onClick={(e) => { e.stopPropagation(); setIsOpen((p) => !p); }}>
        <MoreVertical size={20} />
      </button>
      {isOpen && (
        <>
          <div className="menu-backdrop" onClick={() => setIsOpen(false)} />
          <div className="glass-menu">
            {isOwner ? (
              <div className="menu-item" onClick={(e) => { e.stopPropagation(); setIsOpen(false); onOpenShare(); }}>
                Manage access
              </div>
            ) : (
              <div className="menu-item delete" onClick={(e) => { e.stopPropagation(); setIsOpen(false); onLeave(); }}>
                Leave shared
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SharedPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [shareTarget, setShareTarget] = useState<SharedItem | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUserId(user.id ?? "");
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.sub ?? "");
    } catch {
      console.error("Failed to parse token");
    }
  }, []);

  const fetchShared = async () => {
    setLoading(true);
    try {
      const [notesRes, foldersRes] = await Promise.all([
        api.get<NoteItem[]>("/notes?space=shared"),
        api.get<FolderItem[]>("/folders?space=shared"),
      ]);
      setNotes((notesRes.data || []).map((n) => ({ ...n, type: "note" as const })));
      setFolders((foldersRes.data || []).map((f) => ({ ...f, type: "folder" as const })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShared(); }, []);

  const refreshTarget = async (target: SharedItem) => {
    await fetchShared();

    setNotes(prevNotes => {
      setFolders(prevFolders => {
        const freshItem = [...prevFolders, ...prevNotes].find(
          (i) => i.id === target.id && i.type === target.type
        );
        if (freshItem) {
          setShareTarget(freshItem);
        }
        return prevFolders;
      });
      return prevNotes;
    });
  };

  const handleShare = async (email: string, role: Role) => {
    if (!shareTarget) return;
    await api.post(`/share/${shareTarget.type}/${shareTarget.id}`, { email, role });
    await refreshTarget(shareTarget);
  };

  const handleChangeRole = async (userId: string, role: Role) => {
    if (!shareTarget) return;
    let email = shareTarget.sharedWith?.find((s) => s.userId === userId)?.user?.email;

    if (!email) {
      const freshItem = [...folders, ...notes].find((i) => i.id === shareTarget.id && i.type === shareTarget.type);
      email = freshItem?.sharedWith?.find((s) => s.userId === userId)?.user?.email;
    }

    if (!email) {
      console.error("Could not find email for userId:", userId);
      return;
    }

    try {
      await api.post(`/share/${shareTarget.type}/${shareTarget.id}`, { email, role });
      await refreshTarget(shareTarget);
    } catch (err) {
      console.error("Failed to change role:", err);
    }
  };

  const handleRevoke = async (userId: string) => {
    if (!shareTarget) return;
    try {
      await api.delete(`/share/${shareTarget.type}/${shareTarget.id}/${userId}`);
      await refreshTarget(shareTarget);
    } catch (err) {
      console.error("Failed to revoke access:", err);
    }
  };

  const handleLeave = async (item: SharedItem) => {
    await api.delete(`/share/${item.type}/${item.id}/${currentUserId}`);
    await fetchShared();
  };

  const allItems = [...folders, ...notes].filter((item) =>
    itemName(item).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <TopBar onToggleMenu={() => setIsSidebarOpen((p) => !p)} onSearchChange={setSearchQuery} />
      <div className="content">
        <LeftPanel isOpen={isSidebarOpen} onSelectMenuItem={() => { if (window.innerWidth <= 768 && isSidebarOpen) setIsSidebarOpen(false); }} />
        <main className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
          <div className="workspace-wrapper">
            <div className="workspace-grid">
              {loading && <div className="loader">Loading...</div>}

              {!loading && allItems.length === 0 && (
                <div style={{ opacity: 0.5, gridColumn: "1/-1", textAlign: "center", marginTop: 60 }}>
                  Nothing shared yet
                </div>
              )}

              {!loading && allItems.map((item) =>
                item.type === "folder" ? (
                  <div key={item.id} className="card-box folder-variant" style={{ cursor: "pointer" }} onClick={() => navigate(`/folders/${item.id}?space=shared`)}>
                    <MoreMenu item={item} currentUserId={currentUserId} onOpenShare={() => setShareTarget(item)} onLeave={() => handleLeave(item)} />
                    <div className="folder-icon-area">
                      <FolderIcon size={60} color="var(--color-purple)" fill="rgba(168, 85, 247, 0.2)" />
                      <h2 className="card-title">{item.name}</h2>
                    </div>
                    <div className="card-meta-block">
                      <span>📅 {new Date(item.createdAt).toLocaleDateString("uk-UA")}</span>
                      <span>📄 {item._count?.notes || 0} notes</span>
                    </div>
                  </div>
                ) : (
                  <div key={item.id} className="card-box note-variant" style={{ cursor: "pointer" }} onClick={() => navigate(`/notes/${item.id}?space=shared`)}>
                    <MoreMenu item={item} currentUserId={currentUserId} onOpenShare={() => setShareTarget(item)} onLeave={() => handleLeave(item)} />
                    <h2 className="card-title">{item.title}</h2>
                    <div className="card-text-content" dangerouslySetInnerHTML={{ __html: item.content }} />
                    <div className="card-meta-block">
                      <span>📅 {item.noteDate ? new Date(item.noteDate).toLocaleDateString("uk-UA") : "No date"}</span>
                      <span>🕒 {new Date(item.updatedAt || item.createdAt).toLocaleDateString("uk-UA")}</span>
                    </div>
                    <div className="card-tags">
                      {item.tags?.map((t, i) => <span key={i}>#{t.tag.name}</span>)}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </main>
      </div>

      {shareTarget && (
        <ShareModal
          item={shareTarget}
          currentUserId={currentUserId}
          onClose={() => setShareTarget(null)}
          onRevoke={handleRevoke}
          onChangeRole={handleChangeRole}
          onShare={handleShare}
        />
      )}
    </div>
  );
}

export default SharedPage;
