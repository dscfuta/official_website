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
  var $upcomingEventsList = $('#upcomingEventsList');
  var $pastEventsList = $('#pastEventsList');
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
  function makeProjectRepoLinkNode(repo) {
    var icon = $('<i></i>').addClass('fas fa-arrow-right');
    return $('<a></a>')
    .attr({ target: '_blank', rel: 'noreferrer noopener' })
    .attr({ href: repo })
    .addClass('btn btn-primary btn-sm mt-2')
    .append(document.createTextNode('Source code '))
    .append(icon);
  }
  function makeProjectWrapperNode() {
    return $('<div></div>')
      .addClass('col-md-4')
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
      makeViewProjectButtonNode(project.link),
      makeProjectRepoLinkNode(project.repo)
    ]);
    card.append(body);
    wrapper.append(card);
    return wrapper;
  }
  // $projectList.empty()
  function makeErrorNode(error, icon) {
    icon = icon || document.createTextNode(':(');
    return $('<div></div>')
      .addClass('message-wrapper')
      .append(
        $('<div></div>').addClass('message-icon').append(icon)
      )
      .append(
        $('<div></div>').addClass('message-text').append(error)
      );
  }
  db.collection('projects').get().then(function (querySnapshot) {
    $projectList.empty()
    querySnapshot.forEach(function (doc) {
      var data = doc.data();
      $projectList.append(makeProjectNode(data));
    });
  }).catch(function (err) {
    console.warn(err);
    $projectList.empty();
    $projectList.append(makeErrorNode('Failed to fetch projects, please check your internet connection'));
  })
  var eventTemplateSource = document.getElementById('events-template').innerHTML;
  var eventTemplate = Handlebars.compile(eventTemplateSource);
  var pastEventsTemplateSource = document.getElementById('past-events-template').innerHTML;
  var pastEventsTemplate = Handlebars.compile(pastEventsTemplateSource);
  var errorTemplateSource = document.getElementById('error-message-template').innerHTML;
  var errorTemplate = Handlebars.compile(errorTemplateSource);
  var spinnerTemplateSource = document.getElementById('spinner-template').innerHTML;
  var spinnerTemplate = Handlebars.compile(spinnerTemplateSource);
  $upcomingEventsList.empty();
  $upcomingEventsList.html(spinnerTemplate());
  $pastEventsList.empty();
  $pastEventsList.html(spinnerTemplate());
  function convertDateTimestampToString(date) {
    if (date.from) {
      return {
        date: new Date(date.from.seconds * 1000).toLocaleDateString() + ' - ' + new Date(date.to.seconds * 1000).toLocaleDateString(),
      }
    } else {
      return {
        date: new Date(date.seconds * 1000).toLocaleDateString(),
        time: new Date(date.seconds * 1000).toLocaleTimeString()
      }
    }
  }
  db.collection('events').get().then(function (querySnapshot) {
    $upcomingEventsList.empty();
    $pastEventsList.empty();
    var docDatas = [];
    querySnapshot.forEach(function (doc) {
      docDatas.push(doc.data());
    });
    var pastEvents = docDatas.filter(function (doc) {
      var docDate = doc.date;
      var date;
      var now = new Date();
      if (doc.from) {
        date = new Date(doc.to.seconds);
      } else {
        date = new Date(docDate.seconds);
      }
      return now > date;
    })
    var upcomingEvents = docDatas.filter(function (doc) {
      var docDate = doc.date;
      var date;
      var now = new Date();
      if (doc.from) {
        date = new Date(doc.to);
      } else {
        date = new Date(docDate);
      }
      return now < date;
    })
    pastEvents = pastEvents.map(function (event) {
      var newEvent = Object.assign({}, event, convertDateTimestampToString(event.date));
      return newEvent
    })
    upcomingEvents = upcomingEvents.map(function (event) {
      var newEvent = Object.assign({}, event, convertDateTimestampToString(event.date));
      return newEvent
    })
    var html;
    if (upcomingEvents.length === 0) {
      html = errorTemplate({
        error: 'We have nothing planned, for now...'
      })
    } else {
      html = eventTemplate({
        events: upcomingEvents
      });
    }
    $upcomingEventsList.html(html)
    if (pastEventsTemplate.length === 0) {
      html = errorTemplate({
        error: 'Our past remains blank, look to the future...'
      })
    } else {
      html = pastEventsTemplate({
        events: pastEvents
      })
    }
    $pastEventsList.html(html);
  }).catch(function (err) {
    console.warn(err);
    $upcomingEventsList.empty();
    $pastEventsList.empty();
    var html = errorTemplate({
      error: 'Failed to fetch events, please check your internet connection'
    });
    $upcomingEventsList.html(html);
    $pastEventsList.html(html);
  })
});