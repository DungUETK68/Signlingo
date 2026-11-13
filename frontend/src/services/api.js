// Centralized API Client for Signlingo
// Connects to NestJS Backend Core (Port 3000) and Python AI Service (Port 8000)

const isVitePort = typeof window !== 'undefined' && window.location.port === '5173';
export const CORE_API_URL = import.meta.env.VITE_CORE_API_URL || (isVitePort ? 'http://localhost:3000/api' : '/api');
export const AI_API_URL = import.meta.env.VITE_AI_API_URL || (isVitePort ? 'http://localhost:8000/api' : '/ai');

const TOKEN_KEY = 'signlingo_auth_token';

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch (e) {
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error('Lỗi lưu token:', e);
  }
};

export const getAuthHeaders = () => {
  const token = getStoredToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ========================================================
// 1. Auth API (Xác thực tài khoản)
// ========================================================
export const authApi = {
  async register({ email, password, fullName, learningLevel }) {
    const res = await fetch(`${CORE_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, learningLevel }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại');
    if (data.accessToken) setStoredToken(data.accessToken);
    return data;
  },

  async login({ email, password }) {
    const res = await fetch(`${CORE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');
    if (data.accessToken) setStoredToken(data.accessToken);
    return data;
  },

  async getMe() {
    const res = await fetch(`${CORE_API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  },

  logout() {
    setStoredToken(null);
  },
};

// ========================================================
// 2. Dictionary & Sentences API (Từ điển & Ngữ liệu)
// ========================================================
export const dictionaryApi = {
  async getWords(search = '', category = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const res = await fetch(`${CORE_API_URL}/words?${params.toString()}`);
    if (!res.ok) throw new Error('Không thể tải danh sách từ vựng');
    return res.json();
  },

  async getWordBySlug(slug) {
    const res = await fetch(`${CORE_API_URL}/words/${slug}`);
    if (!res.ok) throw new Error(`Không tìm thấy từ ${slug}`);
    return res.json();
  },

  async getTopics() {
    const res = await fetch(`${CORE_API_URL}/topics`);
    if (!res.ok) throw new Error('Không thể tải danh sách chủ đề');
    return res.json();
  },

  async getSentences(category = '') {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    const res = await fetch(`${CORE_API_URL}/sentences?${params.toString()}`);
    if (!res.ok) throw new Error('Không thể tải danh sách câu');
    return res.json();
  },

  async createWord(wordData) {
    const res = await fetch(`${CORE_API_URL}/words`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(wordData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tạo từ vựng mới trên máy chủ');
    }
    return res.json();
  },

  async deleteWord(id) {
    const res = await fetch(`${CORE_API_URL}/words/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể xóa từ vựng trên máy chủ');
    }
    return res.json();
  },
};

// ========================================================
// 3. Progress & Gamification API (Tiến trình, XP, Streak)
// ========================================================
export const progressApi = {
  async logPractice({ wordSlug, wordName, score, isPassed, badJoints = [], mode = 'camera', durationSeconds = 3 }) {
    try {
      const res = await fetch(`${CORE_API_URL}/progress/practice-log`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          wordSlug,
          wordName,
          score,
          isPassed,
          badJoints,
          mode,
          durationSeconds,
        }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Lỗi ghi nhận lịch sử thực hành về server:', e);
      return null;
    }
  },

  async completeLesson(lessonId, score) {
    try {
      const res = await fetch(`${CORE_API_URL}/progress/complete-lesson`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ lessonId, score }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Lỗi gửi kết quả hoàn thành bài học:', e);
      return null;
    }
  },

  async getUserProgress() {
    try {
      const res = await fetch(`${CORE_API_URL}/progress/my-lessons`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async getLeaderboard(limit = 20) {
    try {
      const res = await fetch(`${CORE_API_URL}/progress/leaderboard?limit=${limit}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async getMyHistory(limit = 20) {
    try {
      const res = await fetch(`${CORE_API_URL}/progress/my-history?limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },
};

// ========================================================
// 4. Adaptive Learning & SRS API (Lộ trình thích ứng & Ôn tập)
// ========================================================
export const adaptiveApi = {
  async getRecommendations() {
    try {
      const res = await fetch(`${CORE_API_URL}/adaptive/recommendations`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async getDueReviewQueue() {
    try {
      const res = await fetch(`${CORE_API_URL}/adaptive/review-queue`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },
};

// ========================================================
// 5. User Profile & Settings API (Hồ sơ người dùng)
// ========================================================
export const userApi = {
  async getProfile() {
    try {
      const res = await fetch(`${CORE_API_URL}/users/profile`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async updateProfile(data) {
    const res = await fetch(`${CORE_API_URL}/users/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Cập nhật thông tin thất bại');
    return res.json();
  },

  async refillHearts() {
    const res = await fetch(`${CORE_API_URL}/users/refill-hearts`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAllUsers() {
    try {
      const res = await fetch(`${CORE_API_URL}/users`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },
};

// ========================================================
// 6. Python AI Service API (FastAPI Cổng 8000 / Proxy /ai)
// ========================================================
export const aiApi = {
  async evaluate(wordSlug, landmarks) {
    const res = await fetch(`${AI_API_URL}/evaluate/${wordSlug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ landmarks }),
    });
    if (!res.ok) throw new Error('AI evaluation failed');
    return res.json();
  },

  async uploadVideo(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${AI_API_URL}/upload_video`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload video lên AI Service thất bại');
    return res.json();
  },

  async getWords() {
    try {
      const res = await fetch(`${AI_API_URL}/words`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async addWord(wordData) {
    try {
      const res = await fetch(`${AI_API_URL}/words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wordData),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async deleteWord(wordId) {
    try {
      const res = await fetch(`${AI_API_URL}/words/${wordId}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async getBenchmarks() {
    try {
      const res = await fetch(`${AI_API_URL}/benchmarks`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },
};

// ========================================================
// 5. Word Contributions API (Đóng góp từ vựng cộng đồng)
// ========================================================
export const contributionsApi = {
  async createContribution(data) {
    const res = await fetch(`${CORE_API_URL}/contributions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể gửi đóng góp từ vựng');
    }
    return res.json();
  },

  async getMyContributions() {
    try {
      const res = await fetch(`${CORE_API_URL}/contributions/my`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.warn('Lỗi lấy danh sách đóng góp từ server:', e);
      return [];
    }
  },

  async getAllContributions(status = 'all', search = '') {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);

      const res = await fetch(`${CORE_API_URL}/contributions?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.warn('Lỗi lấy danh sách toàn bộ đóng góp:', e);
      return [];
    }
  },

  async getContributionById(id) {
    const res = await fetch(`${CORE_API_URL}/contributions/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Không tìm thấy bản đóng góp');
    return res.json();
  },

  async updateContribution(id, data) {
    const res = await fetch(`${CORE_API_URL}/contributions/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể cập nhật đóng góp');
    }
    return res.json();
  },

  async approveContribution(id, feedback = '') {
    const res = await fetch(`${CORE_API_URL}/contributions/${id}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ feedback }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể duyệt đóng góp này');
    }
    return res.json();
  },

  async rejectContribution(id, feedback = '') {
    const res = await fetch(`${CORE_API_URL}/contributions/${id}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ feedback }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể từ chối đóng góp');
    }
    return res.json();
  },

  async deleteContribution(id) {
    const res = await fetch(`${CORE_API_URL}/contributions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể xóa đóng góp');
    }
    return res.json();
  },
};
