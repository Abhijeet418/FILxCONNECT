import { useState, useEffect } from 'react';

export function useAuth() {
  const signOut = async () => {
    // Add your sign out logic here
    // For example:
    // - Clear local storage/cookies
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // - Clear any auth state
    // - Make API call to backend to invalidate session if needed
  };

  return {
    signOut,
  };
}