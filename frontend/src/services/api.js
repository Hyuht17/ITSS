import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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

  // 教師おすすめ一覧を取得
  getRecommendations: async (params = {}) => {
    const queryParams = new URLSearchParams();

    // 時間帯
    if (params.timeSlots && params.timeSlots.length > 0) {
      params.timeSlots.forEach(slot => queryParams.append('timeSlots', slot));
    }

    // 地域
    if (params.cities && params.cities.length > 0) {
      params.cities.forEach(city => queryParams.append('cities', city));
    }

    // 専門分野
    if (params.specialties && params.specialties.length > 0) {
      params.specialties.forEach(specialty => queryParams.append('specialties', specialty));
    }

    // ページネーション
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await api.get(`/recommendations?${queryParams.toString()}`);
    return response.data; // { success, data: { teachers, pagination } }
  },
};

// Availability API calls
export const availabilityAPI = {
  getAvailability: async () => {
    const response = await api.get('/teachers/availability/me');
    return response.data;
  },

  registerAvailability: async (availabilities) => {
    const response = await api.post('/teachers/availability', { availabilities });
    return response.data;
  },

  // 登録済み空き時間を取得 (legacy endpoint?)
  getAvailabilities: async () => {
    const response = await api.get('/teachers/availability');
    return response.data;
  },

  // 特定の空き時間を取得
  getAvailabilityById: async (id) => {
    const response = await api.get(`/teachers/availability/${id}`);
    return response.data;
  },

  // 空き時間を更新
  updateAvailability: async (id, updateData) => {
    const response = await api.put(`/teachers/availability/${id}`, updateData);
    return response.data;
  },

  // 空き時間を削除
  deleteAvailability: async (id) => {
    const response = await api.delete(`/teachers/availability/${id}`);
    return response.data;
  },

  // 全ての空き時間を削除
  deleteAllAvailabilities: async () => {
    const response = await api.delete('/teachers/availability');
    return response.data;
  },
};

// Matching API calls
export const matchingAPI = {
  createRequest: async (receiverId) => {
    const response = await api.post('/matching/requests', { receiverId });
    return response.data;
  },
  getRequests: async () => {
    const response = await api.get('/matching/requests');
    return response.data;
  },
  approveRequest: async (id) => {
    const response = await api.patch(`/matching/requests/${id}/approve`);
    return response.data;
  },
  rejectRequest: async (id) => {
    const response = await api.patch(`/matching/requests/${id}/reject`);
    return response.data;
  },
  cancelRequest: async (id) => {
    const response = await api.delete(`/matching/requests/${id}`);
    return response.data;
  },
  getAcceptedMatchings: async () => {
    const response = await api.get('/matching/accepted');
    return response.data;
  },
  getFinished: async () => {
    const response = await api.get('/matching/finished');
    return response.data;
  }
};

// Messages API
export const messagesAPI = {
  // Get list of conversations
  getMessageList: async () => {
    const response = await api.get('/messages/list');
    return response.data;
  },
  // Get conversation with a specific user
  getConversation: async (userId) => {
    const response = await api.get(`/messages/conversation/${userId}`);
    return response.data;
  },
  // Send a message (with optional file attachment)
  sendMessage: async (formData) => {
    const response = await api.post('/messages/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  // Mark messages as read
  markAsRead: async (userId) => {
    const response = await api.patch(`/messages/read/${userId}`);
    return response.data;
  }
};

// Schedule API calls
export const scheduleAPI = {
  getSchedules: async (startDate, endDate) => {
    const response = await api.get('/schedules', {
      params: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      }
    });
    return response.data;
  },

  getScheduleById: async (id) => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },

  createSchedule: async (scheduleData) => {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  },

  getScheduleTemplates: async () => {
    const response = await api.get('/schedules/templates');
    return response.data;
  }
};

// Feedback API
export const feedbackAPI = {
  create: async (data) => {
    const response = await api.post('/feedbacks', data);
    return response.data;
  },
  getByMatching: async (matchingId) => {
    const response = await api.get(`/feedbacks/matching/${matchingId}`);
    return response.data;
  },
  getReceived: async () => {
    const response = await api.get('/feedbacks/received');
    return response.data;
  },
  update: async (feedbackId, data) => {
    const response = await api.put(`/feedbacks/${feedbackId}`, data);
    return response.data;
  }
};

export default api;


