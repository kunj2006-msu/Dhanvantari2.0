import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Request interceptor to attach admin JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dhanvantari_admin_token');
    if (token && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const adminLogin = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  return response.data; // Yields { token, name, role }
};

export const fetchAdminDoctors = async () => {
  const response = await api.get('/admin/doctors');
  return response.data; // Returns list of DoctorDTO
};

export const updateDoctorStatus = async (id: string, newStatus: string) => {
  const response = await api.put(`/admin/doctors/${id}/status`, null, {
    params: { status: newStatus }
  });
  return response.data;
};

export default api;
