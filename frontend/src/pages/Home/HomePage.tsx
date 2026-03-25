import { TopBar } from "../../components/Topbar/TopBar.tsx";
import { LeftPanel } from "../../components/LeftBar/LeftPanel.tsx";
import { useState } from "react";
import { WorkSpace } from "../../components/WorkSpace/WorkSpace.tsx";
import "./HomePage.css"

function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div>
      <TopBar onToggleMenu={toggleSidebar}/>
      <div className="content">
        <LeftPanel isOpen={isSidebarOpen}
                   onSelectMenuItem={() => {
                     if (window.innerWidth <= 768) setIsSidebarOpen(false);
                   }}/>
        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <WorkSpace />
        </main>
      </div>
    </div>
  );
}

export default HomePage;