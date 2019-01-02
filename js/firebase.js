$(function () {
  window.__DSCAuthPromise = new Promise(function (resolve) {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log('[DSC:Firebase:Auth]', 'Sucessfully signed in user')
        if (location.href.endsWith('login.html')) {
          location.href = location.href.slice(0, location.href.indexOf('login.html')) + 'admin.html'
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
        } else if (errorCode === 'auth/network-request-faied') {
          shownErrorMessage = 'Network error, please check your internet connection'
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