import { useState, useEffect } from 'react';
import React from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

// Initialize Firestore
const db = getFirestore();

const ProblemTracker = () => {
  const [user, setUser] = useState(null);
  const [problemCount, setProblemCount] = useState(0);
  const [showAddProblem, setShowAddProblem] = useState(false);
  const [newProblem, setNewProblem] = useState({ title: '', difficulty: 'Medium', platform: 'LeetCode', notes: '' });
  const [recentProblems, setRecentProblems] = useState([]);
  const [activeTab, setActiveTab] = useState('recent');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showStats, setShowStats] = useState(false);

  // Mock stats data
  const statsData = {
    easy: 12,
    medium: 24,
    hard: 8,
    platforms: { 'LeetCode': 20, 'GeeksforGeeks': 14, 'Codeforces': 10 },
    weeklyProgress: [5, 7, 3, 8, 6, 9, 4]
  };

  useEffect(() => {
    if (user) {
      loadUserData(user.uid);
    }
  }, [user]);

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      await initializeUser(user.uid);
      showNotification('Successfully signed in!');
    } catch (error) {
      console.error("Login failed", error);
      showNotification('Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await signOut(auth);
    setUser(null);
    setProblemCount(0);
    setRecentProblems([]);
    showNotification('Successfully logged out');
    setIsLoading(false);
  };

  const initializeUser = async (userId) => {
    const userDoc = doc(db, "users", userId);
    const docSnap = await getDoc(userDoc);
    if (!docSnap.exists()) {
      await setDoc(userDoc, { problemCount: 0 });
    } else {
      setProblemCount(docSnap.data().problemCount);
    }
    loadRecentProblems(userId);
  };

  const loadUserData = async (userId) => {
    const userDoc = doc(db, "users", userId);
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
      setProblemCount(docSnap.data().problemCount);
      loadRecentProblems(userId);
    }
  };

  const loadRecentProblems = async (userId) => {
    // This is a mock function - in a real app, you'd fetch from Firestore
    setRecentProblems([
      { id: 1, title: 'Binary Search Tree', difficulty: 'Medium', platform: 'LeetCode', solvedAt: new Date(Date.now() - 30 * 60000) },
      { id: 2, title: 'Dynamic Programming', difficulty: 'Hard', platform: 'GeeksforGeeks', solvedAt: new Date(Date.now() - 45 * 60000) },
      { id: 3, title: 'Linked List Reversal', difficulty: 'Easy', platform: 'Codeforces', solvedAt: new Date(Date.now() - 60 * 60000) }
    ]);
  };

  const incrementProblemCount = async () => {
    const newCount = problemCount + 1;
    setProblemCount(newCount);
    if (user) {
      await setDoc(doc(db, "users", user.uid), { problemCount: newCount });
    }
  };

  const addNewProblem = async () => {
    setIsLoading(true);
    // Add validation here
    if (!newProblem.title) {
      showNotification('Please enter a problem title', 'error');
      setIsLoading(false);
      return;
    }

    // In a real app, you'd save to Firestore here
    const newProblemWithId = {
      id: Date.now(),
      ...newProblem,
      solvedAt: new Date()
    };

    setRecentProblems([newProblemWithId, ...recentProblems]);
    await incrementProblemCount();
    setNewProblem({ title: '', difficulty: 'Medium', platform: 'LeetCode', notes: '' });
    setShowAddProblem(false);
    showNotification('Problem added successfully!');
    setIsLoading(false);
  };

  const deleteProblem = async (id) => {
    // In a real app, you'd delete from Firestore here
    setRecentProblems(recentProblems.filter(problem => problem.id !== id));
    const newCount = problemCount - 1;
    setProblemCount(newCount);
    if (user) {
      await setDoc(doc(db, "users", user.uid), { problemCount: newCount });
    }
    showNotification('Problem deleted');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const formatTimeAgo = (date) => {
    const minutes = Math.floor((new Date() - date) / 60000);
    if (minutes < 60) return `${minutes} minutes ago`;
    return `${Math.floor(minutes / 60)} hours ago`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-500';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'Hard':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-blue-500/20 text-blue-500';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'LeetCode':
        return '🔢';
      case 'GeeksforGeeks':
        return '👨‍💻';
      case 'Codeforces':
        return '🏆';
      default:
        return '💻';
    }
  };

  // Render stat bars for the stats section
  const renderStatBar = (value, maxValue, color) => {
    const percentage = (value / maxValue) * 100;
    return (
      <div className="h-4 bg-slate-700 rounded-full w-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Dynamic background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-pulse" 
             style={{animationDelay: '2s', animationDuration: '8s'}}></div>
        <div className="absolute top-3/4 left-2/3 w-64 h-64 bg-emerald-600 rounded-full blur-3xl animate-pulse"
             style={{animationDelay: '1s', animationDuration: '10s'}}></div>
      </div>

      {/* Floating code snippets with animation */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="absolute text-xs font-mono animate-float" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 40 - 20}deg)`,
              animationDuration: `${15 + Math.random() * 15}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            {[
              'if(solved) { trackProgress(); }',
              'while(!understood) { practice(); }',
              'function optimize(algorithm) { ... }',
              'class Solution { ... }',
              'const results = problems.map(solve);'
            ][i % 5]}
          </div>
        ))}
      </div>

      {/* Notification system */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-out ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
        } animate-slideIn`}>
          {notification.message}
        </div>
      )}

      <div className="relative z-10">
        <nav className="px-6 py-4 flex justify-between items-center border-b border-slate-800 backdrop-blur-sm bg-slate-900/70 sticky top-0 z-20">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-br from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 transition-all cursor-pointer">
              <span className="text-white font-bold text-xl">&lt;/&gt;</span>
            </div>
            <span className="ml-3 font-bold text-xl">DrBuddy</span>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center border-2 border-emerald-500">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.displayName?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{user.displayName || user.email}</span>
                </div>
                <button 
                  onClick={logout} 
                  className="text-white bg-slate-800 px-4 py-2 rounded-md hover:bg-slate-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle} 
                className="text-white bg-gradient-to-r from-emerald-600 to-blue-600 px-4 py-2 rounded-md hover:from-emerald-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                >
                {isLoading ? 'Connecting...' : 'Sign In with Google'}
              </button>
            )}
          </div>
        </nav>

        <main>
          {/* Hero Section */}
          <section className="py-16 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 space-y-6">
                <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-medium animate-pulse">
                  BETA ACCESS AVAILABLE NOW
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Track. Solve. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 animate-gradient-x">Conquer.</span>
                </h1>

                <p className="text-slate-300 text-lg md:text-xl max-w-xl">
                A productivity-focused Chrome Extension that helps you track DSA (Data Structures & Algorithms) questions and reminds you at the right time with Chrome notifications. Perfect for consistent daily practice and coding interview prep!
                 
                </p>

                <div className="pt-4 flex flex-wrap gap-4">
                  <a href="https://chromewebstore.google.com/detail/dsa-revision-buddy/feecobjobnakjgpghjfnkpbnfhpehkah" target='_blank'>
                    <button className="group bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:translate-y-[-2px]">
                      Install Extension
                      <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </button>
                  </a>
                  <a href="https://github.com/sagarchaurasia176/DRB_ChromeExtension" target='_blank'>
                    <button className="group bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-8 rounded-lg transition-all transform hover:translate-y-[-2px]">
                      View Github
                      <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">↗</span>
                    </button>
                  </a>
                </div>

                <div className="pt-6 flex items-center space-x-4 text-sm text-slate-400">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-70"></div>
                      </div>
                    ))}
                  </div>
                  <p>Join <span className="text-emerald-400 font-medium">2,400+</span> developers</p>
                </div>
              </div>

              <div className="md:w-1/2 relative">
                <div className="absolute -top-6 -right-6 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2 flex items-center space-x-2 transform hover:scale-105 transition-all cursor-pointer hover:border-emerald-500/50">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Problems Tracked: <span className="text-emerald-400">{problemCount}</span></span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden hover:border-slate-700 transition-all transform hover:translate-y-[-4px] hover:shadow-emerald-500/10">
                  <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-xs font-medium text-slate-400">Your Problem Tracker Dashboard</div>
                    <div className="cursor-pointer text-slate-400 hover:text-white transition-colors" onClick={() => setShowStats(!showStats)}>
                      {showStats ? '📊' : '📈'}
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Dashboard tabs */}
                    <div className="flex border-b border-slate-700 mb-6">
                      <button 
                        onClick={() => setActiveTab('recent')}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                          activeTab === 'recent' 
                            ? 'text-emerald-400 border-b-2 border-emerald-400' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Recent Activity
                      </button>
                      <button 
                        onClick={() => setActiveTab('add')}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                          activeTab === 'add' 
                            ? 'text-emerald-400 border-b-2 border-emerald-400' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Add Problem
                      </button>
                      <button 
                        onClick={() => setActiveTab('stats')}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                          activeTab === 'stats' 
                            ? 'text-emerald-400 border-b-2 border-emerald-400' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Statistics
                      </button>
                    </div>

                    {activeTab === 'recent' && (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-medium">Recent Activity</h3>
                          <div className="text-xs text-slate-400">Today</div>
                        </div>

                        {recentProblems.length > 0 ? (
                          <div className="space-y-4">
                            {recentProblems.map((problem, i) => (
                              <div 
                                key={i} 
                                className="flex items-center p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all hover:bg-slate-800/80 group relative"
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-lg ${getPlatformIcon(problem.platform) ? '' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                  {getPlatformIcon(problem.platform) || '✓'}
                                </div>
                                <div className="flex-grow">
                                  <div className="font-medium group-hover:text-emerald-400 transition-colors">{problem.title}</div>
                                  <div className="text-xs text-slate-400">Solved {formatTimeAgo(problem.solvedAt)}</div>
                                </div>
                                <div className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                                  {problem.difficulty}
                                </div>
                                <button 
                                  className="opacity-0 group-hover:opacity-100 ml-2 text-slate-400 hover:text-red-500 transition-all"
                                  onClick={() => deleteProblem(problem.id)}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-400">
                            <div className="text-4xl mb-2">📝</div>
                            <p>No problems tracked yet.</p>
                            <button 
                              onClick={() => setActiveTab('add')}
                              className="mt-4 text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
                            >
                              Add your first problem
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === 'add' && (
                      <div className="space-y-4">
                        <h3 className="font-medium mb-4">Add New Problem</h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Problem Title</label>
                          <input
                            type="text"
                            value={newProblem.title}
                            onChange={(e) => setNewProblem({...newProblem, title: e.target.value})}
                            placeholder="e.g. Two Sum"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Difficulty</label>
                            <select
                              value={newProblem.difficulty}
                              onChange={(e) => setNewProblem({...newProblem, difficulty: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            >
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Platform</label>
                            <select
                              value={newProblem.platform}
                              onChange={(e) => setNewProblem({...newProblem, platform: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            >
                              <option value="LeetCode">LeetCode</option>
                              <option value="GeeksforGeeks">GeeksforGeeks</option>
                              <option value="Codeforces">Codeforces</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Notes (optional)</label>
                          <textarea
                            value={newProblem.notes}
                            onChange={(e) => setNewProblem({...newProblem, notes: e.target.value})}
                            placeholder="Add your approach, time complexity, etc."
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all h-20 resize-none"
                          ></textarea>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => setActiveTab('recent')}
                            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors mr-2"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={addNewProblem}
                            disabled={isLoading || !newProblem.title}
                            className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Adding...' : 'Add Problem'}
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'stats' && (
                      <div className="space-y-6 animate-fadeIn">
                        <h3 className="font-medium mb-4">Your Progress Statistics</h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-300">Easy</span>
                            <span className="text-green-400 font-medium">{statsData.easy}</span>
                          </div>
                          {renderStatBar(statsData.easy, statsData.easy + statsData.medium + statsData.hard, 'bg-green-500')}
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-300">Medium</span>
                            <span className="text-yellow-400 font-medium">{statsData.medium}</span>
                          </div>
                          {renderStatBar(statsData.medium, statsData.easy + statsData.medium + statsData.hard, 'bg-yellow-500')}
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-300">Hard</span>
                            <span className="text-red-400 font-medium">{statsData.hard}</span>
                          </div>
                          {renderStatBar(statsData.hard, statsData.easy + statsData.medium + statsData.hard, 'bg-red-500')}
                        </div>
                        
                        <div className="pt-2">
                          <h4 className="text-sm font-medium mb-3">Weekly Progress</h4>
                          <div className="flex items-end h-32 space-x-2">
                            {statsData.weeklyProgress.map((count, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center">
                                <div 
                                  className="w-full bg-emerald-500/70 hover:bg-emerald-500 transition-all rounded-t-sm cursor-pointer" 
                                  style={{ height: `${(count / Math.max(...statsData.weeklyProgress)) * 100}%` }}
                                ></div>
                                <div className="text-xs text-slate-400 mt-1">{['M','T','W','T','F','S','S'][i]}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 px-6 bg-slate-900/50">
            <div className="max-w-7xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Supercharge Your Coding Journey</h2>
              <p className="text-slate-300 max-w-2xl mx-auto">Powerful features designed to help you track, analyze, and improve your problem-solving skills.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                {
                  icon: "🔗",
                  title: "Add Question Links",
                  desc: "Easily track questions from platforms like LeetCode, GeeksforGeeks, Codeforces, and more.",
                },
                {
                  icon: "🧠",
                  title: "Add Notes",
                  desc: "Write notes about your approach, ideas, or solutions for each problem.",
                },
                {
                  icon: "📅",
                  title: "Set Reminders",
                  desc: "Set custom reminders to revisit problems after a day, week, or month.",
                },
                {
                  icon: "🔔",
                  title: "Chrome Notifications",
                  desc: "Get notified to revise even if the extension popup is closed.",
                },
                {
                  icon: "🧳",
                  title: "Local Storage",
                  desc: "All your data is saved locally in your browser – nothing gets lost.",
                },
                {
                  icon: "📊",
                  title: "Visual Progress Tracking",
                  desc: "See your progress with interactive charts and visual statistics.",
                },
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition-all hover:translate-y-[-4px] group hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                  <p className="text-slate-300 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-20 px-6 bg-slate-900/20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">What Developers Say</h2>
                <p className="text-slate-300 max-w-2xl mx-auto">Join thousands of developers who improved their problem-solving skills with our tracker.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    quote: "This tool completely transformed how I track my DSA practice. My interview prep became so much more organized!",
                    name: "Sarah K.",
                    role: "Frontend Developer"
                  },
                  {
                    quote: "The reminder system is a game-changer. I never forget to revise important problems anymore.",
                    name: "Raj P.",
                    role: "Backend Engineer"
                  },
                  {
                    quote: "I went from solving problems randomly to having a structured approach thanks to the analytics.",
                    name: "Michael T.",
                    role: "Full Stack Developer"
                  }
                ].map((testimonial, i) => (
                  <div 
                    key={i} 
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition-all hover:translate-y-[-4px] group hover:border-emerald-500/30"
                  >
                    <div className="text-emerald-400 text-2xl mb-4">"</div>
                    <p className="text-slate-300 mb-6 italic">{testimonial.quote}</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-700 mr-3 flex items-center justify-center text-emerald-400 font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{testimonial.name}</div>
                        <div className="text-sm text-slate-400">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-slate-300">Everything you need to know about the problem tracker.</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    question: "Is my data secure?",
                    answer: "Absolutely! All your data is stored securely in your browser's local storage. We don't send any of your problem data to our servers unless you explicitly sign in with Google for cloud sync."
                  },
                  {
                    question: "Can I use this without the Chrome extension?",
                    answer: "Yes! While the Chrome extension provides the best experience with one-click saving from coding platforms, you can use this web version to manually add and track problems."
                  },
                  {
                    question: "How does the reminder system work?",
                    answer: "The extension uses Chrome's notification system to remind you to revisit problems based on spaced repetition algorithms. You can customize the intervals in the settings."
                  },
                  {
                    question: "Is there a mobile app?",
                    answer: "Not currently, but the web version is fully responsive and works great on mobile browsers. We're considering a mobile app in the future!"
                  }
                ].map((faq, i) => (
                  <div 
                    key={i} 
                    className="border border-slate-800 rounded-lg overflow-hidden group"
                  >
                    <button className="w-full px-6 py-4 text-left flex justify-between items-center bg-slate-900/50 hover:bg-slate-800 transition-colors">
                      <span className="font-medium text-lg group-hover:text-emerald-400 transition-colors">{faq.question}</span>
                      <span className="text-xl text-slate-400 group-hover:text-white transition-colors">+</span>
                    </button>
                    <div className="px-6 py-4 bg-slate-900/30 text-slate-300">
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-20 px-6 bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Coding Practice?</h2>
              <p className="text-slate-300 text-xl mb-8">Join thousands of developers who are tracking their progress and acing their interviews.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="https://chromewebstore.google.com/detail/dsa-revision-buddy/feecobjobnakjgpghjfnkpbnfhpehkah" target='_blank'>
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    Install the Extension - It's Free!
                  </button>
                </a>
                <a href="https://github.com/sagarchaurasia176/DRB_ChromeExtension" target='_blank'>
                  <button className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-8 rounded-lg transition-all transform hover:scale-105">
                    Star on GitHub
                  </button>
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-12 px-6 bg-slate-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-6 md:mb-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-br from-emerald-500 to-blue-600">
                  <span className="text-white font-bold text-xl">&lt;/&gt;</span>
                </div>
                <span className="ml-3 font-bold text-xl">DrBuddy - Copyright|2025-all right reserved</span>
              </div>
          
</div>
</div>
</footer>
</div>
</div>          
  )}

  export default ProblemTracker;