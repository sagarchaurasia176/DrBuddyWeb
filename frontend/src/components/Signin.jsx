import React, { use, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

const Signin = () => {
  const [user, setUser] = useState(localStorage.getItem('username') || "");

  const handleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const username = result.user.displayName;
        setUser(username);
        localStorage.setItem('username', username); // Store username in localStorage
      })
      .catch((error) => {
        console.error("Error during sign-in:", error);
      });
  };

  return (
    <div>
      {user ? (
        <>
          <span className="text-green-500 font-bold">Welcome, {user}!</span>
        </>
      ) : (
        <>
          <button 
            onClick={handleSignIn}
            className="bg-slate-900 cursor-pointer hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Sign in with Google
          </button>
        </>
      )}
    </div>
  );
};

export default Signin;