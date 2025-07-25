'use client';

import { useState, useEffect } from 'react';
import { Settings, X, Target, Globe, Sun, Moon, User, LogOut, HelpCircle, Key, Shield, FileText } from 'lucide-react';
import { MacroGoals, UserProfile } from '@/types';
import GoalsSettings from './GoalsSettings';
import ProfileSettings from './ProfileSettings';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
// import OnboardingHelp from './OnboardingHelp';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, getUserLanguage, setUserLanguage } from '@/lib/storage';

interface SettingsMenuProps {
  goals: MacroGoals;
  onGoalsUpdated: (goals: MacroGoals) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export default function SettingsMenu({ 
  goals, 
  onGoalsUpdated, 
  isDarkMode,
  onToggleTheme
}: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [language, setLanguage] = useState<string>('en-US');
  const { user, logout } = useAuth();

  // Change password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        getUserProfile(),
        getUserLanguage()
      ]).then(([profile, userLanguage]) => {
        setUserProfile(profile);
        setLanguage(userLanguage);
      });
    }
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    try {
      await setUserLanguage(newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);

    try {
      const { updatePassword, reauthenticateWithCredential, EmailAuthProvider } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      
      if (!auth.currentUser || !user?.email) {
        throw new Error('No authenticated user found');
      }

      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, passwordForm.newPassword);

      setPasswordSuccess('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Close modal after success
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordSuccess('');
      }, 2000);

    } catch (error: any) {
      console.error('Change password error:', error);
      let errorMessage = 'Failed to change password';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please sign out and sign back in, then try again';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setPasswordError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const getDisplayName = () => {
    if (user?.isAnonymous) return 'Guest';
    
    // Use profile username if available
    if (userProfile.username) {
      return userProfile.username;
    }
    
    // Use profile first name if available
    if (userProfile.firstName) {
      return userProfile.firstName;
    }
    
    // Fall back to auth display name or email
    if (user?.displayName) {
      return user.displayName.split(' ')[0]; // Get first name only
    }
    
    if (user?.email) {
      return user.email.split('@')[0]; // Use part before @ as name
    }
    
    return 'User';
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-6 right-6 z-50 btn-pill-secondary w-14 h-14 p-0 tap-effect"
        aria-label="Settings"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Settings className="w-6 h-6" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={closeMenu}
        />
      )}

      {/* Menu Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="glass-card-strong h-full rounded-none rounded-l-3xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-primary mb-6">Settings</h2>
            
            {/* Compact User Info */}
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 mb-6">
                <User className="w-5 h-5 text-secondary" />
                <span className="font-medium text-primary">
                  {getDisplayName()}
                </span>
              </div>
            )}
            
            {/* Settings Options */}
            <div className="space-y-3">
              {/* Theme Setting */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10">
                <div className="flex items-center gap-3">
                  <Sun className={`w-5 h-5 ${isDarkMode ? 'text-secondary' : 'text-yellow-500'}`} />
                  <span className="font-medium text-primary">Theme</span>
                </div>
                <button
                  onClick={onToggleTheme}
                  className={`
                    w-12 h-6 rounded-full transition-all duration-300 relative
                    ${isDarkMode ? 'bg-blue-500' : 'bg-gray-300'}
                  `}
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <div className={`
                    w-5 h-5 bg-white rounded-full transition-transform duration-300 absolute top-0.5
                    ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}
                  `} />
                </button>
              </div>

              {/* Language Setting */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-secondary" />
                  <span className="font-medium text-primary">Voice Language</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <option value="en-US" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>English</option>
                  <option value="sv-SE" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>Swedish</option>
                </select>
              </div>

              {/* Profile Settings Button */}
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors tap-effect"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-secondary" />
                  <span className="font-medium text-primary">Profile</span>
                </div>
                <span className="text-sm text-secondary">Edit →</span>
              </button>

              {/* Change Password Button */}
              {user && !user.isAnonymous && (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors tap-effect"
                >
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-secondary" />
                    <span className="font-medium text-primary">Change Password</span>
                  </div>
                  <span className="text-sm text-secondary">Update →</span>
                </button>
              )}

              {/* Help/Onboarding Button */}
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors tap-effect"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-secondary" />
                  <span className="font-medium text-primary">Help & Tutorial</span>
                </div>
                <span className="text-sm text-secondary">Learn →</span>
              </button>

              {/* Privacy Policy Button */}
              <button
                onClick={() => setShowPrivacyPolicy(true)}
                className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors tap-effect"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-secondary" />
                  <span className="font-medium text-primary">Privacy Policy</span>
                </div>
                <span className="text-sm text-secondary">View →</span>
              </button>

              {/* Terms of Service Button */}
              <button
                onClick={() => setShowTermsOfService(true)}
                className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors tap-effect"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-secondary" />
                  <span className="font-medium text-primary">Terms of Service</span>
                </div>
                <span className="text-sm text-secondary">View →</span>
              </button>

              {/* Logout Button */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 transition-colors tap-effect"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-400" />
                    <span className="font-medium text-red-400">Sign Out</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Goals Settings Section */}
          <div className="flex-1 overflow-y-auto smooth-scroll p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-primary">Macro Goals</h3>
              </div>
              <GoalsSettings 
                currentGoals={goals}
                onGoalsUpdated={onGoalsUpdated}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowChangePassword(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="glass-card-strong w-full max-w-md p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-primary">Change Password</h3>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="btn-pill-secondary w-10 h-10 p-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Success Message */}
              {passwordSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-green-400 text-sm font-medium">{passwordSuccess}</p>
                </div>
              )}

              {/* Error Message */}
              {passwordError && (
                <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm font-medium">{passwordError}</p>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }));
                      setPasswordError('');
                    }}
                    className="input-field-small w-full"
                    placeholder="Enter current password"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                      setPasswordError('');
                    }}
                    className="input-field-small w-full"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                      setPasswordError('');
                    }}
                    className="input-field-small w-full"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-pill-primary w-full mt-6"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showProfile && (
        <ProfileSettings onClose={() => setShowProfile(false)} />
      )}

      {/* Help Tutorial Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: isDarkMode ? undefined : '#f0EEEC' }}>
          <div className={`min-h-full w-full ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : ''}`}>
          <div className="glass-card-strong m-4 p-6 rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary">Help & FAQ</h2>
              <button
                onClick={() => setShowOnboarding(false)}
                className="btn-pill-secondary w-10 h-10 p-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Getting Started Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b border-white/20 pb-2">Getting Started</h3>
                
                <div className="space-y-4">
                  <div className="glass-card-compact">
                    <h4 className="font-semibold text-primary mb-2">🎯 How do I set my macro goals?</h4>
                    <p className="text-secondary text-sm">
                      Go to Settings and adjust your Macro Goals. You can either let our AI calculate them based on your profile, or set them manually. Your daily targets for protein, carbs, fat, and calories will be saved automatically.
                    </p>
                  </div>
                  
                  <div className="glass-card-compact">
                    <h4 className="font-semibold text-primary mb-2">🍽️ How do I log my meals?</h4>
                    <p className="text-secondary text-sm">
                      Tap the + button and describe your meal in plain English. Our AI will automatically calculate the macros for you. For example: &quot;grilled chicken breast with rice and broccoli&quot; or &quot;protein shake with banana&quot;.
                    </p>
                  </div>
                  
                  <div className="glass-card-compact">
                    <h4 className="font-semibold text-primary mb-2">🎤 Can I use voice input?</h4>
                    <p className="text-secondary text-sm">
                      Yes! Click the microphone icon in the meal input field and speak your meal description. Uses OpenAI Whisper for highly accurate speech recognition. Make sure to allow microphone access when prompted by your browser.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking & Analysis Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b border-white/20 pb-2">Tracking & Analysis</h3>
                
                <div className="space-y-4">
                  <div className="glass-card-compact">
                    <h4 className="font-semibold text-primary mb-2">🤖 How accurate is the AI analysis?</h4>
                    <p className="text-secondary text-sm">
                      Our AI uses Google Gemini and the USDA food database to provide accurate macro calculations. It&apos;s trained on extensive nutritional data, but remember that actual values can vary based on preparation methods and portion sizes.
                    </p>
                  </div>
                  
                  <div className="glass-card-compact">
                    <h4 className="font-semibold text-primary mb-2">📊 What do the progress circles mean?</h4>
                    <p className="text-secondary text-sm">
                      The colored circles show your daily progress: Blue for protein, green for carbs, purple for fat, and orange for calories. The percentage shows how much of your daily goal you&apos;ve reached.
                    </p>
                  </div>
                  
                  <div className="glass-card-compact">
                    <h4 className="font-semibold text-primary mb-2">📅 Can I view past days?</h4>
                    <p className="text-secondary text-sm">
                      Yes! Use the Calendar tab to view your nutrition history and see how you&apos;ve been tracking over time. You can also add meals to previous dates.
                    </p>
                  </div>
                </div>
              </div>

              {/* Common Issues Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b border-white/20 pb-2">Common Issues</h3>
                
                <div className="space-y-4">
                  <div className="glass-card-compact">
                    <h4 className="font-semibold text-primary mb-2">❌ The AI can&apos;t analyze my meal</h4>
                    <p className="text-secondary text-sm">
                                              Try being more specific with your description. Instead of &quot;lunch&quot;, try &quot;turkey sandwich with lettuce and tomato&quot;. If the AI still struggles, you can use the USDA food search for precise nutritional data.
                    </p>
                  </div>
                  
                  <div className="glass-card-compact">
                    <h4 className="font-semibold text-primary mb-2">🔄 My data isn&apos;t syncing</h4>
                    <p className="text-secondary text-sm">
                      Make sure you&apos;re signed in to your account. Data is automatically saved to the cloud when you&apos;re authenticated. If you&apos;re using guest mode, data is stored locally on your device.
                    </p>
                  </div>
                  
                  <div className="glass-card-compact">
                    <h4 className="font-semibold text-primary mb-2">🎨 How do I change the theme?</h4>
                    <p className="text-secondary text-sm">
                      In Settings, use the theme toggle switch to switch between dark and light modes. Your preference will be saved automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips & Tricks Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b border-white/20 pb-2">Tips & Tricks</h3>
                
                <div className="space-y-4">
                  <div className="glass-card-compact">
                    <h4 className="font-semibold text-primary mb-2">💡 Getting better AI results</h4>
                    <p className="text-secondary text-sm">
                      Include cooking methods, portion sizes, and specific ingredients. &quot;200g grilled salmon with steamed vegetables&quot; is better than just &quot;fish and veggies&quot;.
                    </p>
                  </div>
                  
                  <div className="glass-card-compact">
                    <h4 className="font-semibold text-primary mb-2">⚡ Quick meal logging</h4>
                    <p className="text-secondary text-sm">
                      Save time by describing multiple items at once: &quot;Greek yogurt with berries, coffee with milk, and a protein bar&quot; will be analyzed as separate items.
                    </p>
                  </div>
                  
                  <div className="glass-card-compact">
                    <h4 className="font-semibold text-primary mb-2">📱 Install as an app</h4>
                    <p className="text-secondary text-sm">
                      For the best experience, install this as a web app on your phone. Look for the &quot;Add to Home Screen&quot; option in your browser menu.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="glass-card-compact">
                <h3 className="text-lg font-semibold text-primary mb-2">Still need help?</h3>
                <p className="text-secondary text-sm">
                  Can&apos;t find what you&apos;re looking for? Our AI-powered macro tracking is designed to be intuitive, but we&apos;re always here to help you succeed on your nutrition journey.
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <PrivacyPolicy 
          onClose={() => setShowPrivacyPolicy(false)}
          showAsModal={true}
        />
      )}

      {/* Terms of Service Modal */}
      {showTermsOfService && (
        <TermsOfService
          onClose={() => setShowTermsOfService(false)}
          showAsModal={true}
        />
      )}
    </>
  );
} 