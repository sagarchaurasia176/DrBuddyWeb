import { useState, useEffect } from 'react';
import React from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Initialize Firestore
const db = getFirestore();

const ProblemTracker = () => {
  const [user, setUser] = useState(null);
  const [problemCount, setProblemCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUserData(user.uid);
    }
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      await initializeUser(user.uid);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProblemCount(0);
  };

  const initializeUser = async (userId) => {
    const userDoc = doc(db, "users", userId);
    const docSnap = await getDoc(userDoc);
    if (!docSnap.exists()) {
      await setDoc(userDoc, { problemCount: 0 });
    } else {
      setProblemCount(docSnap.data().problemCount);
    }
  };

  const loadUserData = async (userId) => {
    const userDoc = doc(db, "users", userId);
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
      setProblemCount(docSnap.data().problemCount);
    }
  };

  const incrementProblemCount = async () => {
    const newCount = problemCount + 1;
    setProblemCount(newCount);
    if (user) {
      await setDoc(doc(db, "users", user.uid), { problemCount: newCount });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-2/3 w-64 h-64 bg-emerald-600 rounded-full blur-3xl"></div>
      </div>

      {/* Floating code snippets */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute text-xs font-mono" style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 40 - 20}deg)`
          }}>
            {`if(solved) { trackProgress(); }`}
          </div>
        ))}
      </div>

      <div className="relative z-10">
        <nav className="px-6 py-4 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-br from-emerald-500 to-blue-600">
              <span className="text-white font-bold text-xl">&lt;/&gt;</span>
            </div>
            <span className="ml-3 font-bold text-xl">DrBuddy</span>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <button onClick={logout} className="text-white bg-slate-800 px-4 py-2 rounded-md hover:bg-slate-700">
                Sign Out
              </button>
            ) : (
              <button onClick={signInWithGoogle} className="text-white bg-emerald-600 px-4 py-2 rounded-md hover:bg-emerald-700">
                Sign In with Google
              </button>
            )}
          </div>
        </nav>

        <main>
          {/* Hero Section */}
          <section className="py-16 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 space-y-6">
                <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-medium">
                  BETA ACCESS AVAILABLE NOW
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Track. Solve. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Conquer.</span>
                </h1>

                <p className="text-slate-300 text-lg md:text-xl max-w-xl">
                  The intelligent problem-tracking extension that helps developers monitor their coding challenges and maximize productivity.
                </p>

                <div className="pt-4 flex flex-wrap gap-4">
                  <button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl">
                    Install Extension
                  </button>

                  <button className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-8 rounded-lg transition-all">
                    View Demo
                  </button>
                </div>

                <div className="pt-6 flex items-center space-x-4 text-sm text-slate-400">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900"></div>
                    ))}
                  </div>
                  <p>Join <span className="text-emerald-400 font-medium">2,400+</span> developers</p>
                </div>
              </div>

              <div className="md:w-1/2 relative">
                <div className="absolute -top-6 -right-6 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Problems Tracked: <span className="text-emerald-400">{problemCount}</span></span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                  <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-xs font-medium text-slate-400">Your Problem Tracker Dashboard</div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-medium">Recent Activity</h3>
                      <div className="text-xs text-slate-400">Today</div>
                    </div>

                    <div className="space-y-4">
                      {['Binary Search Tree', 'Dynamic Programming', 'Linked List Reversal'].map((problem, i) => (
                        <div key={i} className="flex items-center p-3 rounded-lg bg-slate-800 border border-slate-700">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mr-3">✓</div>
                          <div>
                            <div className="font-medium">{problem}</div>
                            <div className="text-xs text-slate-400">Solved {30 + i * 15} minutes ago</div>
                          </div>
                          <div className="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-500">
                            {['Medium', 'Hard', 'Easy'][i]}
                          </div>
                        </div>
                      ))}
                    </div>
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
              ].map((feature, i) => (
                <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition-all hover:translate-y-[-4px]">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-300 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProblemTracker;
