import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// const firebaseConfig = {
//     apiKey: "AIzaSyDw36-l_b3g3df3BGw5JiO2wQlsf1jw2zg",
//     authDomain: "filxconnect.firebaseapp.com",
//     projectId: "filxconnect",
//     storageBucket: "filxconnect.firebasestorage.app",
//     messagingSenderId: "753135672640",
//     appId: "1:753135672640:web:80929bc09921e13ed7eea5",
//     measurementId: "G-RCLHMWDD0W"
// };

const firebaseConfig = {
    apiKey: "AIzaSyBEcri_KLkBzQgPaM3BMtvXPn_eHHz8h7w",
    authDomain: "filxconnect-admin.firebaseapp.com",
    databaseURL: "https://filxconnect-admin-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "filxconnect-admin",
    storageBucket: "filxconnect-admin.firebasestorage.app",
    messagingSenderId: "940972681645",
    appId: "1:940972681645:web:13e5a7be82bcc79abe1924",
    measurementId: "G-J6NW758K68"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);