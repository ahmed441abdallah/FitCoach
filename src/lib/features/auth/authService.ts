import axiosInstance from '@/lib/axios';

const API_URL = '/auth';

const register = async (userData: any) => {
  const response = await axiosInstance.post(`${API_URL}/register`, userData);
  if (response.data && response.data.user) {
    const userObj = { ...response.data.user, token: response.data.token };
    localStorage.setItem('user', JSON.stringify(userObj));
    return userObj;
  }
  return response.data;
};

const login = async (userData: any) => {
  const response = await axiosInstance.post(`${API_URL}/login`, userData);
  if (response.data && response.data.user) {
    const userObj = { ...response.data.user, token: response.data.token };
    localStorage.setItem('user', JSON.stringify(userObj));
    return userObj;
  }
  return response.data;
};

const logout = async () => {
  await axiosInstance.get(`${API_URL}/logout`);
  localStorage.removeItem('user');
  // Remove all offline-cache entries so the next user on this device
  // never sees a previous user's workout plan.
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache:')) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // localStorage unavailable (e.g. private browsing) – ignore.
  }
};

export default { register, login, logout };
