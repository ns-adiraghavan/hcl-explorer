import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

const App = () => (
  <BrowserRouter>
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Mobile: add top padding for mobile bar; Desktop: left margin for sidebar */}
      <main className="flex-1 pt-12 md:pt-0 md:ml-60">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
);

export default App;
