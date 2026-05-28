/**
 * Require Authentication Component
 * 
 * Redirects to login if user is not authenticated
 */

import { Navigate } from 'react-router-dom';
import { isOAuthLoggedIn, needsProfileCompletion } from '../utils/authSession';

export function RequireAuth({ children }) {
  const isLoggedIn = isOAuthLoggedIn();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (needsProfileCompletion() && !window.location.pathname.startsWith('/complete-profile')) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}
