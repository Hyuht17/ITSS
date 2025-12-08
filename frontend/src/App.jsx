import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import TeacherProfile from './pages/TeacherProfile';
import EditTeacherProfile from './pages/EditTeacherProfile';
import TeacherConnection from './pages/TeacherConnection';
import TeacherRecommendations from './pages/TeacherRecommendations';
import Schedule from './pages/Schedule';
import Messages from './pages/Messages';
import MatchingStatus from './pages/MatchingStatus';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <TeacherProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit/:id"
            element={
              <ProtectedRoute>
                <EditTeacherProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-connection"
            element={
              <ProtectedRoute>
                <TeacherConnection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/connection"
            element={
              <ProtectedRoute>
                <TeacherConnection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <TeacherRecommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matching-status/*"
            element={
              <ProtectedRoute>
                <MatchingStatus />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
