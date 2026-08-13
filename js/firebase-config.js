// Firebase Config & Initialization for Grandia Game Tavern
const firebaseConfig = {
  apiKey: "AIzaSyAC2y-hNnGm3ykSXUuDnowan218PZtxaFY",
  authDomain: "grandia-game-store.firebaseapp.com",
  projectId: "grandia-game-store",
  storageBucket: "grandia-game-store.firebasestorage.app",
  messagingSenderId: "122614800516",
  appId: "1:122614800516:web:f1ff193265130b0b26a2d1",
  measurementId: "G-5MTFXQRDG5"
};

// Initialize Firebase App & Services globally with Incognito protection
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  try {
    window.db = firebase.firestore();
  } catch (e) {
    console.warn("Firestore init warning:", e);
  }
  try {
    window.auth = firebase.auth();
  } catch (e) {
    console.warn("Firebase Auth init warning (Incognito/Blocked):", e);
  }
} else {
  console.warn("Firebase SDK belum dimuat di HTML.");
}
