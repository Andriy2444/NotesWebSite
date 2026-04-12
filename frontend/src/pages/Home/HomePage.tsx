import { TopBar } from "../../components/Topbar/TopBar.tsx";
import { LeftPanel } from "../../components/LeftBar/LeftPanel.tsx";
import { useState } from "react";
import { WorkSpace } from "../../components/WorkSpace/WorkSpace.tsx";
import "./HomePage.css"

function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div>
      <TopBar onToggleMenu={toggleSidebar} onSearchChange={setSearchQuery}/>
      <div className="content">
        <LeftPanel isOpen={isSidebarOpen}
                   onSelectMenuItem={() => {
                     if (window.innerWidth <= 768 && isSidebarOpen) setIsSidebarOpen(false);
                   }}/>
        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <WorkSpace searchQuery={searchQuery}/>
        </main>
      </div>
    </div>
  );
}

export default HomePage;