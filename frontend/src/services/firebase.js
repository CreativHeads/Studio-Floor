import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDkBmudweGiEv7yKLGnlpKdmHVAFgX3EJo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "studio-floor-2026.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "studio-floor-2026",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "studio-floor-2026.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "988701792666",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:988701792666:web:ff78666a394952e5998223",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4E3SZ7K0HS"
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Setup Firebase reCAPTCHA Verifier for Phone Auth
 * @param {string} containerId Element ID where reCAPTCHA will render
 * @returns {RecaptchaVerifier}
 */
export const setupRecaptcha = (containerId = 'recaptcha-container') => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - allow signInWithPhoneNumber
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired. Please try again.');
      }
    });
  }

  return window.recaptchaVerifier;
};

/**
 * Send Phone OTP via Firebase
 * @param {string} phoneNumber E.164 formatted phone number (e.g. +14155552671)
 * @param {RecaptchaVerifier} recaptchaVerifier
 * @returns {Promise<ConfirmationResult>}
 */
export const sendPhoneOtp = async (phoneNumber, recaptchaVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return { success: true, confirmationResult };
  } catch (error) {
    console.error('Firebase sendPhoneOtp error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send OTP. Please check the phone number format.' 
    };
  }
};

/**
 * Verify OTP Code with Firebase Confirmation Result
 * @param {ConfirmationResult} confirmationResult 
 * @param {string} otpCode 6-digit code
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const verifyPhoneOtp = async (confirmationResult, otpCode) => {
  try {
    const result = await confirmationResult.confirm(otpCode);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Firebase verifyPhoneOtp error:', error);
    return { 
      success: false, 
      error: 'Invalid verification code. Please check the code and try again.' 
    };
  }
};
