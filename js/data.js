$(function () {
  // Initialize Cloud Firestore through Firebase
  var db = firebase.firestore();
    

  // Disable deprecated features
  db.settings({
    timestampsInSnapshots: true
  });
  // Initialize Firebase Storage
  var storage = firebase.storage();
  var storageRef = storage.ref();
  var instructorImagesRef = storageRef.child('images/instructors');

  var $projectList = $('#projectList');
  var $upcomingEventsList = $('#upcomingEventsList');
  var $pastEventsList = $('#pastEventsList');
  var $teamSliderIndicators = $('.team-slider__indicators');
  var $teamSlider = $('.team-slider');
  function makeOwlDot() {
    return $('<li></li>').addClass('owl-dot');
  }
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
  var stacks = {
    web: {
      icon: 'fab fa-node-js',
      color: 'primary'
    },
    mobile: {
      icon: 'fas fa-mobile-alt',
      color: 'secondary'
    }
  } 
  var eventTemplateSource = document.getElementById('events-template').innerHTML;
  var eventTemplate = Handlebars.compile(eventTemplateSource);
  var pastEventsTemplateSource = document.getElementById('past-events-template').innerHTML;
  var pastEventsTemplate = Handlebars.compile(pastEventsTemplateSource);
  var errorTemplateSource = document.getElementById('error-message-template').innerHTML;
  var errorTemplate = Handlebars.compile(errorTemplateSource);
  var spinnerTemplateSource = document.getElementById('spinner-template').innerHTML;
  var spinnerTemplate = Handlebars.compile(spinnerTemplateSource);
  var teamItemTemplateSource = document.getElementById('team-item-template').innerHTML;
  var teamItemTemplate = Handlebars.compile(teamItemTemplateSource);
  var projectsTemplateSource = document.getElementById('projects-template').innerHTML;
  var projectsTemplate = Handlebars.compile(projectsTemplateSource);
  Handlebars.registerHelper('stackColor', function (stack) {
    if (stacks[stack]) {
      return new Handlebars.SafeString('bg-dimped__' + stacks[stack].color);
    } else {
      console.warn('Unknown stack', stack);
      return ''
    }
  })
  Handlebars.registerHelper('stackIcon', function (stack) {
    if (stacks[stack]) {
      return new Handlebars.SafeString(stacks[stack].icon);
    } else {
      console.warn('Unknown stack', stack);
      return ''
    }
  })
  Handlebars.registerHelper('developerLinks', function (developers) {
    var result = '';
    developers = developers
      .split(',')
      .map(function (developer) { return developer.trim() });
    developers.forEach(function (developer, index) {
      result += '<a href="https://twitter.com/'
        + developer.substr(1) + '" target="_blank"'
        + ' rel="noreferrer noopener">'
        + developer + '</a>'
      if (index !== developers.length - 1) result += ', '
    })
    return new Handlebars.SafeString(result);
  })
  $upcomingEventsList.empty();
  $pastEventsList.empty();
  $teamSlider.empty();
  $teamSliderIndicators.empty();
  $projectList.empty();
  $upcomingEventsList.html(spinnerTemplate());
  $pastEventsList.html(spinnerTemplate());
  $teamSlider.html(spinnerTemplate());
  $projectList.html(spinnerTemplate());
  db.collection('projects').get().then(function (querySnapshot) {
    $projectList.empty()
    var docDatas = []
    querySnapshot.forEach(function (doc) {
      var data = doc.data();
      docDatas.push(data);
    });
    var html = projectsTemplate({
      projects: docDatas
    })
    $projectList.html(html);
  }).catch(function (err) {
    console.warn(err);
    $projectList.empty();
    var html = errorTemplate({
      error: 'Failed to fetch projects, please check your internet connection'
    })
    $projectList.html(html);
  })
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
  db.collection('instructors').get().then(function (querySnapshot) {
    var promises = [];
    querySnapshot.forEach(function (doc) {
      promises.push(new Promise(function (resolve, reject) {
        var data = doc.data();
        var id = doc.id;
        instructorImagesRef.child(id).getDownloadURL().then(function (url) {
          resolve(Object.assign({}, data, {
            id: id,
            imageURL: url
          }));
        }).catch(function (error) { 
          if (error.code === 'storage/object-not-found') {
            // Instructor hasn't uploaded an image
            resolve(Object.assign({}, data, {
              id: id,
              imageURL: '/images/assets/team/avatar.png'
            }));
          } else {
            reject(err);
          }
        });
      }));
    })
    return Promise.all(promises);
  }).then(function (instructors) {
    instructors = instructors.map(function (data) {
      return Object.assign({}, data, {
        imageCSS: 'background-image: url(' + data.imageURL + ')'
      });
    });
    $teamSliderIndicators.empty();
    $teamSliderIndicators.append(new Array(instructors.length).fill(makeOwlDot()));
    $teamSlider.empty();
    var html = teamItemTemplate({
      instructors: instructors
    });
    $teamSlider.html(html);
    var $ClientsSlider = $('.team-slider');
    if ($ClientsSlider.length > 0) {
      $ClientsSlider.owlCarousel({
        loop: true,
        center: true,
        margin: 0,
        items: 1,
        nav: false,
        dots: true,
        lazyLoad: true,
        dotsContainer: '.dots'
      })
      $('.owl-dot').on('click', function() {
        $(this).addClass('active').siblings().removeClass('active');
        $ClientsSlider.trigger('to.owl.carousel', [$(this).index(), 300]);
      });
    }
  }).catch(function (err) {
    console.warn(err);
    $teamSlider.empty();
    var html = errorTemplate({
      error: 'Failed to fetch instructors, please check your internet connection'
    });
    $teamSlider.html(html);
  });
});