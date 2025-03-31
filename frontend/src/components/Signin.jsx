import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

const Signin = () => {
  const handleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("User signed in:", result.user.displayName);
      })
      .catch((error) => {
        console.error("Error during sign-in:", error);
      });
  };

  return (
    <div>
      <button 
        onClick={handleSignIn}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Signin;