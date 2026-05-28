/**
 * Protected Route Component
 * 
 * Restricts access to routes based on user role
 */

import { Navigate } from 'react-router-dom';
import { isTrainerSession } from '../utils/trainerAuth';
import { isOAuthLoggedIn } from '../utils/authSession';

export function ProtectedRoute({ children, requiredRole }) {
  const userRole = localStorage.getItem('userRole') || 'student';
  const loggedIn = isOAuthLoggedIn();

  if (requiredRole === 'trainer') {
    if (!isTrainerSession()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  if (requiredRole === 'student' && !loggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function TrainerOnly({ children }) {
  return (
    <ProtectedRoute requiredRole="trainer">
      {children}
    </ProtectedRoute>
  );
}
