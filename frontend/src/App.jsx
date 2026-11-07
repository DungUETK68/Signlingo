import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import PersonalizedPathView from './components/LearningPath/PersonalizedPathView';
import LearningPathView from './components/LearningPath/LearningPathView';
import GrammarView from './components/Grammar/GrammarView';
import DictionaryView from './components/Dictionary/DictionaryView';
import SentencesView from './components/Sentences/SentencesView';
import AIStudioView from './components/AIStudio/AIStudioView';
import GamesView from './components/Games/GamesView';
import ReviewView from './components/Review/ReviewView';
import DashboardView from './components/Dashboard/DashboardView';
import AdminView from './components/Admin/AdminView';
import AuthModal from './components/AuthModal';
import LandingView from './components/Landing/LandingView';
import { getUserProfile, saveUserProfile } from './data/personalizedStore';
import { getStoredToken, authApi } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('personalized');
  const [previousTab, setPreviousTab] = useState('personalized');
  const [practiceTargetWord, setPracticeTargetWord] = useState('Cảm ơn');
  const [selectedLearningLesson, setSelectedLearningLesson] = useState(null);
  const [selectedLearningTopic, setSelectedLearningTopic] = useState(null);
  const [selectedSentenceId, setSelectedSentenceId] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
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
        setIsAuthOpen(false);
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
          // Token không hợp lệ hoặc hết hạn -> xóa token và đưa về trang giới thiệu
          authApi.logout();
          setIsAuthenticated(false);
          setIsAuthOpen(false);
        }
      } catch (err) {
        console.warn('Lỗi kết nối kiểm tra tài khoản từ Backend:', err);
        const current = getUserProfile();
        if (current && current.isLoggedIn && token) {
          setIsAuthenticated(true);
          setIsAuthOpen(false);
        } else {
          setIsAuthenticated(false);
          setIsAuthOpen(false);
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
    setAuthMode('login');
    setForceOnboarding(true);
    setIsAuthOpen(true);
  };

  const handleOpenAuthGeneral = (mode = 'login') => {
    setAuthMode(mode);
    setForceOnboarding(false);
    setIsAuthOpen(true);
  };

  // Đăng xuất: xóa JWT token, chuyển về trang Landing
  const handleLogout = () => {
    authApi.logout();
    const guestProfile = {
      ...userProfile,
      isLoggedIn: false,
    };
    saveUserProfile(guestProfile);
    setUserProfile(guestProfile);
    setIsAuthenticated(false);
    setForceOnboarding(false);
    setIsAuthOpen(false);
  };

  // Màn hình loading nhẹ khi kiểm tra auth token
  if (isCheckingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        gap: '1rem',
      }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
          fontSize: '1.5rem',
        }}>
          ✨
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0284c7' }}>
          Đang tải Signlingo AI...
        </div>
      </div>
    );
  }

  // 1. Khi chưa đăng nhập: Hiển thị Trang Giới Thiệu (Landing Page) kèm Modal Đăng nhập / Đăng ký
  if (!isAuthenticated) {
    return (
      <>
        <LandingView
          onOpenAuth={(mode = 'login') => {
            setAuthMode(mode);
            setForceOnboarding(false);
            setIsAuthOpen(true);
          }}
        />
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          forceOnboarding={forceOnboarding}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={(newUserData) => {
            setUserProfile(newUserData);
            setIsAuthenticated(true);
            setIsAuthOpen(false);
            setActiveTab('personalized');
          }}
        />
      </>
    );
  }

  // 2. Khi đã đăng nhập: Hiển thị Giao diện học tập chính (Duo Layout)

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

        {/* TAB 2.5: NGỮ PHÁP VSL */}
        {activeTab === 'grammar' && (
          <GrammarView
            onSelectTab={setActiveTab}
            onOpenSentenceDetail={(sentenceId) => {
              setSelectedSentenceId(sentenceId);
              setActiveTab('sentences');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
          <SentencesView
            onStartPracticeWord={handleStartPracticeWord}
            initialSentenceId={selectedSentenceId}
          />
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
            onOpenSentenceDetail={(sentenceId) => {
              setSelectedSentenceId(sentenceId);
              setActiveTab('sentences');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateSentences={() => {
              setActiveTab('sentences');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateLearning={() => {
              setActiveTab('learning');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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

      {/* 4. Auth Modal & Onboarding Assessment */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        forceOnboarding={forceOnboarding}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(newUserData) => {
          setUserProfile(newUserData);
          setIsAuthOpen(false);
        }}
      />
    </div>
  );
}
