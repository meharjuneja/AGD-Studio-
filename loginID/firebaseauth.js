// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import{getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js"
import{ getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js"


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFZ95Do7OVknQIkCIdTY7nnGrjhaK3ACM",
  authDomain: "login-form-6796c.firebaseapp.com",
  projectId: "login-form-6796c",
  storageBucket: "login-form-6796c.firebasestorage.app",
  messagingSenderId: "771787750581",
  appId: "1:771787750581:web:ba86c1f1d92119fdac92fc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function showMessage(message,  divId){
    var messageDiv=document.getElementById(divId);
    messageDiv.style.display="block";
    messageDiv.innerHTML=message;
    messageDiv.style.opacity=1;
     setTimeout(function(){
        messageDiv.style.opacity=0;
     },5000);
}
const signUp= document.getElementById('submitSignUp')
signUp.addEventListener('click', (event)=>{
    event.preventDefault();
    const email=document.getElementById('rEmail').value;
    const password=document.getElementById('rPassword').value;
    const firstName=document.getElementById('fName').value;
    const lastName=document.getElementById('lName').value;

    const auth=getAuth();
    const db=getFirestore();

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential)=>{
        const user=userCredential.user;
        const userData={
            email: email,
            firstname: firstName,
            lastName: lastName
        };
        showMessage('Account Created Successfully', 'signUpMessage')
        const docRe=doc(db, "users", user.uid);
        setDoc(docRef, userData)
        .then(()=>{
            window.location.href='index.html'
        })
        .catch((error)=>  {
             console.error("error riting document", error);
        });
    })
    .catch((error)=>{
          
    })
})