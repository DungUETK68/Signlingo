// Centralized API Client for Signlingo
// Connects to NestJS Backend Core (Port 3000) and Python AI Service (Port 8000)

export const CORE_API_URL = import.meta.env.VITE_CORE_API_URL || 'http://localhost:3000/api';
export const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000/api';

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

const getAuthHeaders = () => {
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
    const res = await fetch(`${CORE_API_URL}/progress/complete-lesson`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lessonId, score }),
    });
    return res.json();
  },

  async getLeaderboard(limit = 20) {
    const res = await fetch(`${CORE_API_URL}/progress/leaderboard?limit=${limit}`);
    if (!res.ok) return [];
    return res.json();
  },

  async getMyHistory(limit = 20) {
    const res = await fetch(`${CORE_API_URL}/progress/my-history?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },
};

// ========================================================
// 4. Adaptive Learning & SRS API (Lộ trình thích ứng & Ôn tập)
// ========================================================
export const adaptiveApi = {
  async getRecommendations() {
    const res = await fetch(`${CORE_API_URL}/adaptive/recommendations`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  },

  async getDueReviewQueue() {
    const res = await fetch(`${CORE_API_URL}/adaptive/review-queue`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },
};

// ========================================================
// 5. User Profile & Settings API (Hồ sơ người dùng)
// ========================================================
export const userApi = {
  async getProfile() {
    const res = await fetch(`${CORE_API_URL}/users/profile`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
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
};

