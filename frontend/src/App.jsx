import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import PersonalizedPathView from './components/LearningPath/PersonalizedPathView';
import LearningPathView from './components/LearningPath/LearningPathView';
import DictionaryView from './components/Dictionary/DictionaryView';
import SentencesView from './components/Sentences/SentencesView';
import AIStudioView from './components/AIStudio/AIStudioView';
import GamesView from './components/Games/GamesView';
import ReviewView from './components/Review/ReviewView';
import DashboardView from './components/Dashboard/DashboardView';
import AdminView from './components/Admin/AdminView';
import AuthModal from './components/AuthModal';
import { getUserProfile, saveUserProfile } from './data/personalizedStore';
import { getStoredToken, authApi } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('personalized');
  const [previousTab, setPreviousTab] = useState('personalized');
  const [practiceTargetWord, setPracticeTargetWord] = useState('Chào');
  const [selectedLearningLesson, setSelectedLearningLesson] = useState(null);
  const [selectedLearningTopic, setSelectedLearningTopic] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [forceOnboarding, setForceOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState(() => getUserProfile());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 1. Kiểm tra Token JWT & Xác thực người dùng tự động khi tải web
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = getStoredToken();
      if (!token) {
        setIsAuthenticated(false);
        setIsAuthOpen(true);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const user = await authApi.getMe();
        if (user && user.id) {
          const profile = {
            id: user.id,
            name: user.fullName || 'Học viên Signlingo',
            email: user.email,
            role: user.role === 'ADMIN' ? 'Quản trị viên' : 'Học viên chăm chỉ',
            isAdmin: user.role === 'ADMIN',
            learningLevel: user.learningLevel || 'beginner',
            dailyGoalMinutes: user.dailyGoalMinutes || 15,
            priorityTopic: user.priorityTopic || 'greeting',
            streakDays: user.streak || 1,
            totalXp: user.xp || 0,
            hearts: user.hearts ?? 5,
            gems: user.gems ?? 100,
            isLoggedIn: true,
            hasCompletedOnboarding: true,
          };
          setUserProfile(profile);
          saveUserProfile(profile);
          setIsAuthenticated(true);
          setIsAuthOpen(false);
        } else {
          // Token không hợp lệ hoặc hết hạn -> xóa token và bắt buộc đăng nhập
          authApi.logout();
          setIsAuthenticated(false);
          setIsAuthOpen(true);
        }
      } catch (err) {
        console.warn('Lỗi kết nối kiểm tra tài khoản từ Backend:', err);
        const current = getUserProfile();
        if (current && current.isLoggedIn && token) {
          setIsAuthenticated(true);
          setIsAuthOpen(false);
        } else {
          setIsAuthenticated(false);
          setIsAuthOpen(true);
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleStartPracticeWord = (wordName) => {
    setPreviousTab(activeTab === 'practice' ? 'personalized' : activeTab);
    setPracticeTargetWord(wordName);
    setActiveTab('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromPractice = () => {
    setActiveTab(previousTab || 'personalized');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLesson = (lesson, topic) => {
    setSelectedLearningLesson(lesson);
    setSelectedLearningTopic(topic);
    setActiveTab('learning');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLessonFromReview = handleOpenLesson;

  const handleOpenAuthForSurvey = () => {
    setForceOnboarding(true);
    setIsAuthOpen(true);
  };

  const handleOpenAuthGeneral = () => {
    setForceOnboarding(false);
    setIsAuthOpen(true);
  };

  // Đăng xuất: xóa JWT token, chuyển về trạng thái chưa xác thực
  const handleLogout = () => {
    authApi.logout();
    const guestProfile = {
      ...userProfile,
      isLoggedIn: false
    };
    saveUserProfile(guestProfile);
    setUserProfile(guestProfile);
    setIsAuthenticated(false);
    setForceOnboarding(false);
    setIsAuthOpen(true);
  };

  return (
    <div className="duo-layout">
      {/* 1. Left Navigation Sidebar (Duolingo Style) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (activeTab !== 'practice') setPreviousTab(activeTab);
          setActiveTab(tab);
        }}
      />

      {/* 2. Main Center Content */}
      <main className="center-content">
        {/* TAB 1: LỘ TRÌNH CÁ NHÂN HÓA THEO KHẢ NĂNG (AI ADAPTIVE PATH) */}
        {activeTab === 'personalized' && (
          <PersonalizedPathView
            onStartPracticeWord={handleStartPracticeWord}
            onOpenSurvey={handleOpenAuthForSurvey}
            onOpenLesson={(lesson, stage) => {
              setSelectedLearningLesson({
                id: lesson.id,
                title: lesson.title,
                description: lesson.desc,
                duration: lesson.duration,
                level: lesson.level,
                completed: lesson.completed,
                score: lesson.score
              });
              setSelectedLearningTopic({
                id: stage.id,
                title: stage.title,
                level: stage.subtitle,
                lessons: stage.lessons
              });
              setActiveTab('learning');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* TAB 2: LỘ TRÌNH CHUẨN CỐ ĐỊNH (GIỮ NGUYÊN) */}
        {activeTab === 'learning' && (
          <LearningPathView 
            onStartPracticeWord={handleStartPracticeWord}
            initialLesson={selectedLearningLesson}
            initialTopic={selectedLearningTopic}
          />
        )}

        {/* TAB 3: TỪ ĐIỂN VSL */}
        {activeTab === 'dictionary' && (
          <DictionaryView 
            onStartPracticeWord={handleStartPracticeWord} 
            onOpenLesson={handleOpenLesson}
          />
        )}

        {/* TAB 3.5: CÂU THƯỜNG GẶP (VSL SENTENCES) */}
        {activeTab === 'sentences' && (
          <SentencesView onStartPracticeWord={handleStartPracticeWord} />
        )}

        {/* TAB 4: LUYỆN TẬP CAMERA AI */}
        {activeTab === 'practice' && (
          <AIStudioView 
            targetWord={practiceTargetWord} 
            onBack={handleBackFromPractice} 
          />
        )}

        {/* TAB 5: MINIGAME & THỬ THÁCH */}
        {activeTab === 'games' && (
          <GamesView onStartPracticeWord={handleStartPracticeWord} />
        )}

        {/* TAB 6: ÔN TẬP (SPACED REPETITION) */}
        {activeTab === 'review' && (
          <ReviewView 
            onStartPracticeWord={handleStartPracticeWord}
            onOpenLesson={handleOpenLessonFromReview}
          />
        )}

        {/* TAB 7: HỒ SƠ NGƯỜI DÙNG */}
        {activeTab === 'dashboard' && (
          <DashboardView onStartPracticeWord={handleStartPracticeWord} />
        )}

        {/* TAB 8: QUẢN TRỊ */}
        {activeTab === 'admin' && (
          <AdminView />
        )}
      </main>

      {/* 3. Right Status & Widgets Sidebar */}
      <RightSidebar
        userProfile={userProfile}
        onOpenAuth={handleOpenAuthGeneral}
        onOpenSurvey={handleOpenAuthForSurvey}
        onStartPractice={handleStartPracticeWord}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* 4. Auth Modal & Onboarding Assessment (Chặn vào web nếu chưa đăng nhập) */}
      <AuthModal
        isOpen={isAuthOpen || (!isAuthenticated && !isCheckingAuth)}
        isMandatory={!isAuthenticated && !isCheckingAuth}
        forceOnboarding={forceOnboarding}
        onClose={() => {
          if (isAuthenticated) {
            setIsAuthOpen(false);
          }
        }}
        onLoginSuccess={(newUserData, level) => {
          setUserProfile(newUserData);
          setIsAuthenticated(true);
          setIsAuthOpen(false);
          setActiveTab('personalized');
        }}
      />
    </div>
  );
}
