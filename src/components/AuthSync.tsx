import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/useRedux';
import { setUser } from '@/store/slices/authSlice';

/**
 * Component to sync auth state from localStorage to Redux on app load
 * This ensures authentication persists across page refreshes
 */
export default function AuthSync() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if we have a token and user in localStorage
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');

    if (token && userStr && userStr !== 'undefined') {
      try {
        const user = JSON.parse(userStr);
        // Sync the user to Redux state
        dispatch(setUser(user));
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  return null; // This component doesn't render anything
}
