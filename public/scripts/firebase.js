
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    apiKey: "AIzaSyBRtc0QjMkPp2_FXrt9qniK47ESKTTP7Ow",
    authDomain: "covid19dataforbulgaria.firebaseapp.com",
    databaseURL: "https://covid19dataforbulgaria.firebaseio.com",
    projectId: "covid19dataforbulgaria",
    storageBucket: "covid19dataforbulgaria.appspot.com",
    messagingSenderId: "924116209844",
    appId: "1:924116209844:web:ab15d5cb8ea40bdb2b47e1",
    measurementId: "G-Y8GMDQ478K"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  //Initialize Analitics
  firebase.analytics();
  
  var firestoreDB = firebase.firestore();
