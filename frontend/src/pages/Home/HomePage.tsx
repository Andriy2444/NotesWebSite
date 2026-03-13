import '../../components/Topbar/TopBar.tsx'
import {TopBar} from "../../components/Topbar/TopBar.tsx";

function HomePage() {
  return (
    <div>
      <TopBar></TopBar>
      Home Page
      <div style={{ height: "1000px" }}></div>
    </div>
  )
}

export default HomePage