var config = {
    apiKey: "AIzaSyB6U0DJvc5eNtmOFd0q7YXXwdB5xl9zRvM",
    authDomain: "dscfuta-website.firebaseapp.com",
    databaseURL: "https://dscfuta-website.firebaseio.com",
    projectId: "dscfuta-website",
    storageBucket: "dscfuta-website.appspot.com",
    messagingSenderId: "345694247293"
};
firebase.initializeApp(config);

let messagesRef = firebase.database().ref('messages');

document.getElementById('mailform').addEventListener('submit', submitForm);

function submitForm(e) {
    e.preventDefault();
    let email = getInputVal('email');
    saveMessage(email);
    document.querySelector('.alert').style.display = 'block';
    setTimeout(function () {
        document.querySelector('.alert').style.display = 'none';
    }, 5000);
    document.getElementById('mailform').reset();

}

function getInputVal(id) {
    return document.getElementById(id).value;
}

function saveMessage(email) {
    var newMessageRef = messagesRef.push();
    newMessageRef.set({
        email: email
    });
}
