import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import PersonalizedPathView from './components/LearningPath/PersonalizedPathView';
import LearningPathView from './components/LearningPath/LearningPathView';
import DictionaryView from './components/Dictionary/DictionaryView';
import AIStudioView from './components/AIStudio/AIStudioView';
import GamesView from './components/Games/GamesView';
import ReviewView from './components/Review/ReviewView';
import DashboardView from './components/Dashboard/DashboardView';
import AdminView from './components/Admin/AdminView';
import AuthModal from './components/AuthModal';
import { getUserProfile } from './data/personalizedStore';

export default function App() {
  const [activeTab, setActiveTab] = useState('personalized');
  const [previousTab, setPreviousTab] = useState('personalized');
  const [practiceTargetWord, setPracticeTargetWord] = useState('Chào');
  const [selectedLearningLesson, setSelectedLearningLesson] = useState(null);
  const [selectedLearningTopic, setSelectedLearningTopic] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [forceOnboarding, setForceOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState(() => getUserProfile());

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

  const handleOpenLessonFromReview = (lesson, topic) => {
    setSelectedLearningLesson(lesson);
    setSelectedLearningTopic(topic);
    setActiveTab('learning');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuthForSurvey = () => {
    setForceOnboarding(true);
    setIsAuthOpen(true);
  };

  const handleOpenAuthGeneral = () => {
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
            onClearInitialLesson={() => {
              setSelectedLearningLesson(null);
              setSelectedLearningTopic(null);
            }}
          />
        )}

        {/* TAB 3: TỪ ĐIỂN */}
        {activeTab === 'dictionary' && (
          <DictionaryView onStartPracticeWord={handleStartPracticeWord} />
        )}

        {/* TAB 4: LUYỆN TẬP CAMERA AI */}
        {activeTab === 'practice' && (
          <AIStudioView 
            key={practiceTargetWord}
            initialWord={practiceTargetWord} 
            onBack={handleBackFromPractice}
          />
        )}

        {/* TAB 5: TRÒ CHƠI & THỬ THÁCH */}
        {activeTab === 'games' && (
          <GamesView onStartPracticeWord={handleStartPracticeWord} />
        )}

        {/* TAB 6: ÔN TẬP BÀI ĐÃ LƯU */}
        {activeTab === 'review' && (
          <ReviewView
            onOpenLesson={handleOpenLessonFromReview}
            onStartPracticeWord={handleStartPracticeWord}
            onNavigateLearning={() => {
              setSelectedLearningLesson(null);
              setSelectedLearningTopic(null);
              setActiveTab('personalized');
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
      />

      {/* 4. Auth Modal & Onboarding Assessment */}
      <AuthModal
        isOpen={isAuthOpen}
        forceOnboarding={forceOnboarding}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(newUserData, level) => {
          setUserProfile(newUserData);
          setActiveTab('personalized');
        }}
      />
    </div>
  );
}
