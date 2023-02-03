// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIHO5HO2l_PjPhbJfmKbki8KGjjIOmnjE",
  authDomain: "bikesale-aa9b5.firebaseapp.com",
  projectId: "bikesale-aa9b5",
  storageBucket: "bikesale-aa9b5.appspot.com",
  messagingSenderId: "556586023198",
  appId: "1:556586023198:web:e58d5e46478baaf035710f",
  measurementId: "G-13RLZY00CZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
