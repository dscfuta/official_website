(function () {
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
  // Initialize Cloud Firestore through Firebase
  var db = firebase.firestore();
    

  // Disable deprecated features
  db.settings({
    timestampsInSnapshots: true
  });
  var $projectList = $('#projectList');
  function makeViewProjectButtonNode(link) {
    var icon = $('<i></i>').addClass('fas fa-arrow-right');
    return $('<a></a>')
      .addClass('btn btn-primary btn-md')
      .attr({ target: '_blank', rel: 'noreferrer noopener' })
      .attr({ href: link })
      .append(document.createTextNode('View project '))
      .append(icon);
  }
  function makeProjectNameNode(name) {
    return $('<h4></h4')
      .addClass('feature-title')
      .text(name);
  }
  function makeProjectDescriptionNode(description) {
    return $('<p></p>')
      .text(description);
  }
  function makeProjectDeveloperLinkNode(developer) {
    return $('<a></a>')
      .attr({ target: '_blank', rel: 'noreferrer noopener' })
      .attr({ href: 'https://twitter.com/' + developer.substr(1) })
      .text(developer);
  }
  function makeProjectDevelopersNode(developers) {
    developers = developers
      .split(',')
      .map(function (developer) { return developer.trim() });
    var children = [];
    developers.forEach(function (developer, index) {
      children.push(makeProjectDeveloperLinkNode(developer));
      if (index !== developers.length - 1) children.push(document.createTextNode(', '));
    })
    return $('<p></p>')
      .append(children);
  }
  function makeProjectIconNode(stack) {
    stack = stack.toLowerCase()
    var iconWrapper = $('<div></div>').addClass('u-icon u-icon__circle u-icon__lg')
    var icon = $('<i></i>');
    switch (stack) {
      case 'web':
        iconWrapper.addClass('bg-dimped__primary')
        icon.addClass('fab fa-chrome');
        break;
      case 'mobile':
        iconWrapper.addClass('bg-dimped__secondary');
        icon.addClass('fas fa-mobile-alt');
        break;
      default:
        throw new Error('Unknown stack: ' + stack);
    }
    iconWrapper.append(icon);
    return iconWrapper;
  }
  function makeProjectWrapperNode() {
    return $('<div></div>')
      .addClass('col-sm-4')
  }
  function makeProjectCardNode() {
    return $('<div></div>')
      .addClass('feature-card');
  }
  function makeProjectBodyNode() {
    return $('<div></div>')
      .addClass('feature-card__body');
  }
  function makeProjectNode(project) {
    var wrapper = makeProjectWrapperNode();
    var card = makeProjectCardNode();
    var body = makeProjectBodyNode();

    card.append(makeProjectIconNode(project.stack));
    body.append([
      makeProjectNameNode(project.name),
      makeProjectDescriptionNode(project.description),
      makeProjectDevelopersNode(project.developers),
      makeViewProjectButtonNode(project.link)
    ]);
    card.append(body);
    wrapper.append(card);
    return wrapper;
  }
  // $projectList.empty()
  db.collection('projects').get().then(function (querySnapshot) {
    $projectList.empty()
    querySnapshot.forEach(function (doc) {
      var data = doc.data();
      $projectList.append(makeProjectNode(data));
    });
  })
});