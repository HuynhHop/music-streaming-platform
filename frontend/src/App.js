import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import SongInfo from './components/SongInfo';
import AlbumInfo from './components/AlbumInfo';
import PlaylistInfo from './components/PlaylistInfo';
import FavoriteInfo from './components/FavoriteInfo';
import SongListByGenre from './components/SongListByGenre';
import PersonalPage from './pages/PersonalPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage'; 
import ContactPage from './pages/ContactPage'; 
import LoginPage from './pages/LoginPage'; 
import RegisterPage from './pages/RegisterPage'; 
import ArtistPage from './pages/ArtistPage'; 
import SearchPage from './pages/SearchPage'; 
import SongManagement from './components/SongManagement';
import ReportManagement from './components/ReportManagement';
import ArtistInfo from './components/ArtistInfo';
import SystemStats from './components/SystemStats';
import UserInfo from './components/UserInfo';
const ETypeRole = require("./enums/ETypeRole");

function App() {
  const { authState } = React.useContext(AuthContext);
  const { isAuthenticated, role } = authState;
  const lastActiveRef = useRef(Date.now());

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // 🎯 detect activity
    const updateActivity = () => {
      lastActiveRef.current = Date.now();
    };

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("click", updateActivity);

    const interval = setInterval(() => {
      const now = Date.now();

      // ❌ không hoạt động 60s → bỏ
      if (now - lastActiveRef.current > 60000) return;

      // ❌ tab không active → bỏ
      if (document.visibilityState !== "visible") return;

      fetch("http://127.0.0.1:5000/api/users/heartbeat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch((err) => console.error("Heartbeat error:", err));

      console.log("🔥 Heartbeat sent");
    }, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("click", updateActivity);
    };
  }, [isAuthenticated]);

  console.log('Auth:', isAuthenticated, 'Role:', role);

  return (
    <Router>
      <div style={styles.container}>
        <HeaderWithLocationKey />

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route 
            path="/" 
            element={
              !isAuthenticated ? (
                <Navigate to="/login" />
              ) : role === ETypeRole.ADMIN ? (
                <Navigate to="/admin-dashboard" />
              ) : role === ETypeRole.USER ? (
                <Navigate to="/user-dashboard" />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />


          <Route 
            path="/admin-dashboard/*" 
            element={isAuthenticated && role === ETypeRole.ADMIN ? <AdminDashboard /> : <Navigate to="/login" />}>
            <Route path="" element={<SongManagement />} />
            <Route path="songs" element={<SongManagement />} />
            <Route path="reports" element={<ReportManagement />} />
            <Route path="artists" element={<ArtistInfo />} />
            <Route path="stats" element={<SystemStats />} />
          </Route>

          <Route 
            path="/user-dashboard" 
            element={isAuthenticated && role === ETypeRole.USER ? <UserDashboard /> : <Navigate to="/login" />} 
          />

          <Route path="/contact" element={<ContactPage />} />
          <Route path="/song/:id" element={ <SongInfo />} />
          <Route path="/user/:id" element={isAuthenticated && role !== null ? <UserInfo /> : <Navigate to="/login" />}  />
          <Route path="/album/:id" element={ <AlbumInfo />} />
          <Route path="/playlist/:id" element={ <PlaylistInfo />} />
          <Route path="/favorite" element={isAuthenticated && role === ETypeRole.USER ? <FavoriteInfo /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/songs/:genre" element={isAuthenticated && role === ETypeRole.USER ? <SongListByGenre /> : <Navigate to="/login" />} />
          <Route path="/artist/:id" element={isAuthenticated && role === ETypeRole.USER ? <ArtistInfo /> : <Navigate to="/login" />} />
          <Route path="/personal-music" element={isAuthenticated && role === ETypeRole.USER ? <PersonalPage /> : <Navigate to="/login" />} />
          <Route path="/search" element={isAuthenticated && role === ETypeRole.USER ? <SearchPage /> : <Navigate to="/login" />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

function HeaderWithLocationKey() {
  const location = useLocation(); 
  return <Header key={location.key} />; 
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
};

export default App;

// import React, { useEffect } from "react";
// import { connectSocket, disconnectSocket } from "./s/socketService";

// const App = () => {
//   useEffect(() => {
//     const userId = "user123"; // Replace with actual user ID
//     connectSocket(userId);

//     // Cleanup function to disconnect when component unmounts
//     return () => {
//       disconnectSocket();
//     };
//   }, []);

//   return (
//     <div className="App">
//       <h1>Socket.io with React</h1>
//     </div>
//   );
// };

// export default App;
