import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateItemPage from './pages/CreateItemPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';
import SuccessfulBidsPage from './pages/SuccessfulBids';

function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-item" element={<CreateItemPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/sucessbid" element={<SuccessfulBidsPage />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;