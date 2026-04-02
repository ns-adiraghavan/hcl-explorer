import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="*"
        element={
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 pt-12 md:pt-0 md:ml-60">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile/:id" element={<Profile />} />
              </Routes>
            </main>
          </div>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default App;
