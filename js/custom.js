
$(window).on('load', function() {
  'use strict';
  $('#loading').addClass('hidden');
});

var $iframe = $('iframe'),
    src = $iframe.data('src');

if (window.matchMedia("(min-width: 720px)").matches) {
    $iframe.attr('src', src);
}else{
    $iframe.css('display', 'none');
}

$(document).ready(function(){
    $(window).scroll(function(){
        if ($(this).scrollTop() > 100) {
            $('#scroll').fadeIn();
        } else {
            $('#scroll').fadeOut();
        }
    });
    $('#scroll').click(function(){
        $("html, body").animate({ scrollTop: 0 }, 600);
        return false;
    });
});

(function($, Handlebars) {
  'use strict';

  /*====================================================*/
  /* VARIABLES                                           */
  /*====================================================*/
  var navBar = $('.custom-menu'),
    navbarLinks = $('.custom-menu .nav-link');

  /*====================================================*/
  /* STICKY NAVBAR                                      */
  /*====================================================*/
  $(window).on('scroll', function() {
    if ($(this).scrollTop() > 50) {
      $(navBar).addClass('navbar-is-sticky');
    } else {
      $(navBar).removeClass('navbar-is-sticky');
    }
  });

  $('.navbar-toggler').on('click', function(e) {
    $(this).toggleClass('menu-is-expanded');
  });

  $(document).on('click', '.navbar-collapse.show', function(e) {
    if ($(e.target).is('a')) {
      $(this).collapse('hide');
      $('.navbar-toggler').toggleClass('menu-is-expanded');
      // $('.Menu-Icon--Circle').css('transform', 'translateX(-50%) translateY(-50%) scale(1)');
    }
  });

  /*====================================================*/
  /* NAVBAR ON SCROLL EASING                            */
  /*====================================================*/
  $(navbarLinks).on('click', function(event) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top - 50)
    }, 1250, 'easeInOutExpo');
    event.preventDefault();
  });

  /*====================================================*/
  /* team SLIDER                                 */
  /*====================================================*/


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

  var swiper = new Swiper('.screen-slider', {
    direction: 'horizontal',
    slidesPerView: 1,
    spaceBetween: 1,
    parallax: true,
    breakpoints: {
      480: {
        slidesPerView: 1,
        spaceBetween: 40
      }
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    }
  });

  /*====================================================*/
  /* TABS INIT                                   */
  /*====================================================*/
  $('.js-tabs a').on('click', function(e) {
    e.preventDefault();
    $(this).tab('show');
  });

  /*====================================================*/
  /* TOOLTIPS                                           */
  /*====================================================*/
  $('[data-toggle="tooltip"]').tooltip();

  /*====================================================*/
  /* VIDEO MODALS                                           */
  /*====================================================*/

  $('.js-video-modal-trigger').magnificPopup({
    type: 'iframe',
    iframe: {
      patterns: {
        youtube: {
          index: 'youtube.com/',
          id: function(url) {
            var m = url.match(/[\\?\\&]v=([^\\?\\&]+)/);
            if (!m || !m[1]) return null;
            return m[1];
          },
          src: '//www.youtube.com/embed/%id%?autoplay=1'
        },
        vimeo: {
          index: 'vimeo.com/',
          id: function(url) {
            var m = url.match(/(https?:\/\/)?(www.)?(player.)?vimeo.com\/([a-z]*\/)*([0-9]{6,11})[?]?.*/);
            if (!m || !m[5]) return null;
            return m[5];
          },
          src: '//player.vimeo.com/video/%id%?autoplay=1'
        }
      }
    }
  });

  /*=================================================*/
  /* MATERIALS SECTION                               */
  /* TODO: Fetch this data from Firebase instead     */
  /*=================================================*/
  var sections = [
    { name: "Mobile", color: "primary", icon: "fas fa-mobile-alt", id: "mobile" },
    { name: "Web", color: "secondary", icon: "fab fa-node-js", id: "web" },
    { name: "Machine Learning / AI", color: "warning", icon: "fas fa-microchip", id: "mlai" },
    { name: "IOT / Android Things", color: "danger", icon: "fas fa-sync", id: "iot" },
    { name: "Product Design", color: "info", icon: "fab fa-wpforms", id: "design" }
  ];
  var bookTypes = {
    print: {
      title: "This book is available in printed form",
      icon: "fas fa-book",
      color: "success"
    },
    ebook: {
      title: "This book is available in electronic form",
      icon: "fas fa-mobile-alt",
      color: "secondary"
    },
    web: {
      title: "This book is available to read online",
      icon: "fab fa-chrome",
      color: "info"
    }
  }
  var sectionData = {};
  var activeSectionId = "web";
  var $sectionChooser = $('#section-chooser');
  var $sectionContent = $('#section-content');
  Handlebars.registerHelper('levelTag', function (level) {
    var levelEscaped = Handlebars.escapeExpression(level);
    var levelCapitalized = levelEscaped.substr(0, 1).toUpperCase() + levelEscaped.slice(1);
    return new Handlebars.SafeString(
      '<div class="material-level material-level__' + level + '">' + levelCapitalized + '</div>'
    )
  })
  Handlebars.registerHelper('bookTags', function () {
    console.log(this);
    var typesEscaped = this.types.map(function (type) { return Handlebars.escapeExpression(type) });
    var result = '';
    typesEscaped.forEach(function (type) {
      if (bookTypes[type]) {
        var bookType = bookTypes[type];
        result += '<div class="u-icon u-icon__sm u-icon__circle bg-dimped__' + bookType.color + '">'
          + '<i class="' + bookType.icon + '" title="' + bookType.title + '"></i></div>'
      }
    })
    return new Handlebars.SafeString(result);
  })
  var chooserTemplateSource = document.getElementById('section-chooser-template').innerHTML;
  var chooserTemplate = Handlebars.compile(chooserTemplateSource);
  var sectionTemplateSource = document.getElementById('section-template').innerHTML;
  var sectionTemplate = Handlebars.compile(sectionTemplateSource);
  var spinnerTemplateSource = document.getElementById('spinner-template').innerHTML;
  var spinnerTemplate = Handlebars.compile(spinnerTemplateSource);
  var errorMessageTemplate = document.getElementById('error-message-template').innerHTML;
  var errorMessageTemplate = Handlebars.compile(errorMessageTemplate);
  function renderSpinner() {
    return spinnerTemplate();
  }
  $(document.body).on('click', function (event) {
    var $otherSelections = $('.other-selections');
    var isToggle = $('.section-select').find(event.target).length > 0 || $(event.target).hasClass('section-select');
    if ($otherSelections.hasClass('show') && !isToggle) {
      if ($('.other-selections').find(event.target).length === 0) {
        event.preventDefault();
        $otherSelections.removeClass('show');
        $sectionChooser.find('.section-select-icon').removeClass('flip-upside-down');
      }
    }
  })
  function renderSectionChooser(sections, activeSectionId) {
    var activeSection = null;
    var inactiveSections = []
    for (var i = 0; i < sections.length;i++) {
      var section = sections[i];
      if (section.id === activeSectionId) {
        activeSection = section;
      } else {
        inactiveSections.push(section);
      }
    }
    var html = chooserTemplate({
      activeSection: activeSection,
      inactiveSections: inactiveSections
    });
    $sectionChooser.empty();
    $sectionChooser.html(html);
    $sectionChooser.find('.section-select').on('click', function () {
      $sectionChooser.find('.other-selections').toggleClass('show');
      $sectionChooser.find('.section-select-icon').toggleClass('flip-upside-down');
    })
    $sectionChooser.find('.other-selections .section-selection').on('click', function () {
      var sectionId = $(this).data('section');
      activeSectionId = sectionId
      renderSectionChooser(sections, activeSectionId);
      window.scrollTo(0, 0);
      if (!sectionData[activeSectionId]) {
        fetchAndRenderSection(activeSectionId);
      } else {
        renderSection(activeSectionId);
      }
    })
  }
  function fetchAndRenderSection(id) {
    $sectionContent.empty();
    $sectionContent.html(renderSpinner());
    $.get('/learn/data/' + id + '.json', function (data) {
      sectionData[id] = data;
      renderSection(id);
    }, 'json').fail(function (jqXHR) {
      setTimeout(function () {
        $sectionContent.empty();
        $sectionContent.html(errorMessageTemplate({
          error: "Failed to load resource"
        }))
      }, 1500);
    })
  }
  function renderSection(id) {
    var data = sectionData[id];
    var html = sectionTemplate(data);
    $sectionContent.empty();
    $sectionContent.html(html);
    $sectionContent.find('.js-tabs a').on('click', function(e) {
      e.preventDefault();
      $(this).tab('show');
    });
  }
  renderSectionChooser(sections, activeSectionId);
  fetchAndRenderSection(activeSectionId);
})(jQuery, Handlebars);