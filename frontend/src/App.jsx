import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import ReviewDraft from './pages/ReviewDraft';
import EditExpense from './pages/EditExpense';
import { Toaster } from 'react-hot-toast';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/add" element={isAuthenticated ? <AddExpense /> : <Navigate to="/login" />} />
        <Route path="/review/:id" element={isAuthenticated ? <ReviewDraft /> : <Navigate to="/login" />} />
        <Route path="/edit-expense/:id" element={isAuthenticated ? <EditExpense /> : <Navigate to="/login" />} />

        {/* Default Route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;