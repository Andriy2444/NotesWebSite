import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/Home/HomePage"
import AuthPage from "./pages/Auth/AuthPage"
import ProfilePage from "./pages/Profile/ProfilePage.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<HomePage />}></Route>
        <Route path="/auth" element={<AuthPage />}></Route>
        <Route path="/profile" element={<ProfilePage />}></Route>
        <Route path="/folders/:folderId" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App