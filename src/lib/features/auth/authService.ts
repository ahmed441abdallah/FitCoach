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
};

export default { register, login, logout };
