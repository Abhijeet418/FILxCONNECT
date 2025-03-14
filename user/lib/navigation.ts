import { useRouter } from 'next/navigation';

export const navigateToUserProfile = (userId: string) => {
  // Store the userId in localStorage
  localStorage.setItem('viewUserId', userId);
  // Navigate to the user profile page
  window.location.href = '/user';
};

export const navigateToPost = (postId: string) => {
  localStorage.setItem('viewPostId', postId);
  window.location.href = '/post';
};