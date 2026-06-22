import { useContext } from 'react';
import { UserContext } from '../Context/UserContext';

export function useUserContext() {
  return useContext(UserContext);
}
