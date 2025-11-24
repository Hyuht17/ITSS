import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// Teacher API calls
export const teacherAPI = {
  // すべての教師プロフィールを取得
  getAllTeachers: async () => {
    const response = await api.get('/teachers');
    return response.data; // { status, message, data, count }
  },

  // 特定の教師プロフィールを取得
  getTeacherProfile: async (teacherId) => {
    const response = await api.get(`/teachers/${teacherId}`);
    return response.data; // { status, message, data }
  },

  // 自分の教師プロフィールを取得
  getMyTeacherProfile: async () => {
    const response = await api.get('/teachers/me');
    return response.data; // { status, message, data }
  },

  // 教師プロフィールを作成
  createTeacherProfile: async (profileData) => {
    const response = await api.post('/teachers', profileData);
    return response.data; // { status, message, data }
  },

  // 教師プロフィールを更新
  updateTeacherProfile: async (teacherId, profileData) => {
    const response = await api.put(`/teachers/${teacherId}`, profileData);
    return response.data; // { status, message, data }
  },

  // アバター画像をアップロード
  uploadTeacherAvatar: async (teacherId, file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post(`/teachers/${teacherId}/upload-avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // { status, message, data: { avatarUrl, publicId } }
  },
};

export default api;
