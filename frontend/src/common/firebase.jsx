// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider,getAuth, signInWithPopup } from 'firebase/auth';
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCMYNA5K5ODg3b0DteVbiUt1Gyi2L2AHSE",
  authDomain: "niqi-foundation.firebaseapp.com",
  projectId: "niqi-foundation",
  storageBucket: "niqi-foundation.appspot.com",
  messagingSenderId: "690926385297",
  appId: "1:690926385297:web:c456cd72c9d39b3f492730",
  measurementId: "G-5GM5777056"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const provider = new GoogleAuthProvider()

const auth = getAuth();

export const authWithGoogle = async () => {
    let user = null;

    await signInWithPopup(auth,provider)
    .then((result) => {
        user = result.user

    })
    .catch((err) => {
        console.log(err)
    })

    return user;
}


