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

// Initialize Firebase App & Services globally
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  window.db = firebase.firestore();
  window.auth = firebase.auth();
} else {
  console.warn("Firebase SDK belum dimuat di HTML.");
}
