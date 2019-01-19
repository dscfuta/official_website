(function () {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyB6U0DJvc5eNtmOFd0q7YXXwdB5xl9zRvM",
    authDomain: "dscfuta-website.firebaseapp.com",
    databaseURL: "https://dscfuta-website.firebaseio.com",
    projectId: "dscfuta-website",
    storageBucket: "dscfuta-website.appspot.com",
    messagingSenderId: "345694247293"
  };
  firebase.initializeApp(config);
})();
$(function () {
  window.__DSCAuthPromise = new Promise(function (resolve) {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log('[DSC:Firebase:Auth]', 'Sucessfully signed in user')
        if (location.href.endsWith('login.html')) {
          location.href = location.href.slice(0, location.href.indexOf('login.html'))
        } else {
          resolve(user)
        }
      } else {
        // No user is signed in.
        console.log('[DSC:Firebase:Auth]', 'Sucessfully signed out user')
        if (!location.href.endsWith('login.html')) {
          location.href = location.href.slice(0, location.href.lastIndexOf('/')) + '/login.html'
        }
      }
    });
  })
  $('#loginForm').on('submit', function (event) {
    event.preventDefault();
    $('#errorAlert').hide();
    $('#messageDsiplayArea').text('');
    var email = $('#inputEmail').val();
    var password =  $('#inputPassword').val();
    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log('[DSC:Firebase:Auth:Error:' + errorCode + ']', 'Failed to authenticate because ' + errorMessage);
        var shownErrorMessage;
        if (errorCode === 'auth/user-not-found') {
          shownErrorMessage = 'No user with that email was found'
        } else if (errorCode === 'auth/network-request-failed') {
          shownErrorMessage = 'Network error, please check your internet connection'
        } else if (errorCode === 'auth/wrong-password') {
          shownErrorMessage = 'The provided password is invalid'
        } else {
          shownErrorMessage = 'An unknown error occured (Code ' + errorCode + ')'
        }
        $('#messageDisplayArea').text(shownErrorMessage);
        $('#errorAlert').show();
      });
  });
  $('#logoutButton').on('click', function (event) {
    event.preventDefault()
    $('#errorAlert').hide()
    firebase.auth().signOut().catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log('[DSC:Firebase:Auth:Error:' + errorCode + ']', 'Failed to signout because ' + errorMessage);
      $('#errorAlert').text(errorMessage);
      $('#errorAlert').show();
    })
  })
});