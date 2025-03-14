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
    apiKey: "AIzaSyDrjtlELIX3VQyS9dSIiU-43-mNG_fAIjY",
    authDomain: "filxconnect-e5c34.firebaseapp.com",
    databaseURL: "https://filxconnect-e5c34-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "filxconnect-e5c34",
    storageBucket: "filxconnect-e5c34.firebasestorage.app",
    messagingSenderId: "41245507627",
    appId: "1:41245507627:web:652a3e03b42eadd824ea6e",
    measurementId: "G-51R1JXY3RG"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);