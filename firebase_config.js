// init firebase
const firebaseConfig = {
  apiKey: "AIzaSyDXSfhv1VRg7wWSykO2t1afx4shM7mNDT4",
  authDomain: "diploma-admission-system.firebaseapp.com",
  projectId: "diploma-admission-system",
  storageBucket: "diploma-admission-system.firebasestorage.app",
  messagingSenderId: "640424160540",
  appId: "1:640424160540:web:5089dd8a23f09f3a005ed9"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();

console.log("Firebase Connected");
