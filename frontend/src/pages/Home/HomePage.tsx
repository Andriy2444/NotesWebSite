import { TopBar } from "../../components/Topbar/TopBar.tsx";
import { LeftPanel } from "../../components/LeftBar/LeftPanel.tsx";
import { useState } from "react";

function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div>
      <TopBar onToggleMenu={toggleSidebar} />
      <LeftPanel isOpen={isSidebarOpen}
                 onSelectMenuItem={() => {
                    if (window.innerWidth <= 768) setIsSidebarOpen(false);
                 }} />
    </div>
  );
}

export default HomePage;