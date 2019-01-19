$(function () {
  // Initialize Cloud Firestore through Firebase
  var db = firebase.firestore();
    

  // Disable deprecated features
  db.settings({
    timestampsInSnapshots: true
  });
  var $eventModal = $('#eventModal');
  var $eventForm = $('#eventForm');
  var $eventSubmitButton = $('#eventSubmitButton');
  var $eventModalModeText = $('.eventModalModeText');
  var $eventModalErrorAlert = $('#eventModalErrorAlert');
  var formMode = null;
  var activeEditDocId = null;
  function inputsToDate(date, time) {
    var result = new Date(time);
    result.setFullYear(date.getFullYear());
    result.setMonth(date.getMonth());
    result.setDate(date.getDate());
    return result;
  }
  $('#addButton').on('click', function () {
    formMode = 'add';
    $eventModalModeText.text('Add');
    $('#eventName').val(null);
    $('#eventDescription').val(null);
    $('#eventVenue').val(null);
    $('#eventDate').val(null);
    $('#eventTime').val(null);
    $('#eventPhotosURL').val(null);
    $('#eventYoutubeURL').val(null);
    $('#eventMeetupURL').val(null);
    $eventModal.modal('show');
  })
  $eventForm.on('submit', function (event) {
    event.preventDefault();
    $eventSubmitButton.attr('disabled', true);
    $eventModalErrorAlert.hide();
    var data = {
      name: $('#eventName').val(),
      description: $('#eventDescription').val(),
      venue: $('#eventVenue').val(),
      date: inputsToDate($('#eventDate')[0].valueAsDate, $('#eventTime')[0].valueAsDate),
      photosURL: $('#eventPhotosURL').val(),
      youtubeURL: $('#eventYoutubeURL').val(),
      meetupURL: $('#eventMeetupURL').val()
    };
    if (formMode === 'edit') {
      if (!activeEditDocId) {
        throw new Error('No document is being edited?!');
      } else {
        db.collection("events")
          .doc(activeEditDocId)
          .update(data).then(function () {
          $eventModal.modal('hide')
          $eventSubmitButton.removeAttr('disabled');
          fetchEventsData();
        }).catch(function (error) {
          $eventModalErrorAlert.text(error.message);
          $eventModalErrorAlert.show();
        })
      }
    } else {
      db.collection("events").add(data).then(function (docRef) {
        $eventModal.modal('hide')
        $eventSubmitButton.removeAttr('disabled');
        fetchEventsData();
      }).catch(function (error) {
        $eventModalErrorAlert.text(error.message);
        $eventModalErrorAlert.show();
      })
    }
  })
  function makeCol(text) {
    return $('<td></td>').text(text);
  }
  function makeColWithChildren(children) {
    return $('<td></td').addClass('d-flex').append(children);
  }
  function makeRow(cols) {
    var $row = $('<tr></tr>');
    cols.forEach(function (col) {
      $row.append(col);
    });
    return $row;
  }
  function makeEditButton(doc) {
    var data = doc.data()
    return $('<button></button>')
      .addClass('btn')
      .addClass('btn-success')
      .append($('<i></i').addClass('fas').addClass('fa-edit'))
      .on('click', function () {
        $eventModalModeText.text('Edit');
        formMode = 'edit';
        activeEditDocId = doc.id;
        $('#eventName').val(data.name);
        $('#eventDescription').val(data.description);
        $('#eventVenue').val(data.venue);
        $('#eventDate')[0].valueAsDate = convertToDate(data.date);
        $('#eventTime')[0].valueAsDate = convertToDate(data.date);
        $('#eventPhotosURL').val(data.photosURL);
        $('#eventYoutubeURL').val(data.youtubeURL);
        $('#eventMeetupURL').val(data.meetupURL);
        $eventModal.modal('show');
      });
  }
  function makeDeleteButton(doc) {
    return $('<button></button>')
      .addClass('btn')
      .addClass('btn-danger')
      .addClass('ml-1')
      .append($('<i></i>').addClass('fas').addClass('fa-trash'))
      .on('click', function () {
        var confirmDelete = confirm('Delete event ' + doc.data().name + '?');
        if (confirmDelete) {
          db.collection("events")
          .doc(doc.id)
          .delete().then(function () {
            fetchEventsData()
          }).catch(function (error) {
            alert('Failed to delete event because ' + error.message);
          })
        }
      })
  }
  function convertToDate(firebaseTimestamp) {
    return new Date(firebaseTimestamp.seconds * 1000);
  }
  function fetchEventsData() {
    var $eventsTable = $('#eventsTable');
    var $eventsTableBody = $eventsTable.find('tbody');
    $('#refreshButton').addClass('fa-spin');
    $('#eventsErrorAlert').hide();
    $eventsTableBody.empty();
    db.collection("events").get().then(function (querySnapshot) {
      var docDatas = querySnapshot.docs.map(function (doc) {
        return doc.data();
      });
      if ($.fn.dataTable.isDataTable($eventsTable)) {
        $eventsTable.DataTable().clear().draw().destroy();
      }
      querySnapshot.forEach(function (doc) {
        var data = doc.data()
        var dateString = convertToDate(data.date).toLocaleDateString() + ' ' + convertToDate(data.date).toLocaleTimeString();
        $eventsTableBody.append(makeRow([
          makeCol(data.name),
          makeCol(data.description),
          makeCol(data.venue),
          makeCol(dateString),
          makeCol(data.photosURL),
          makeCol(data.youtubeURL),
          makeColWithChildren([
            makeEditButton(doc),
            makeDeleteButton(doc)
          ])
        ]));
      });
      // {
        // data: docDatas,
        // columns: [
        //   { data: 'name' },
        //   { data: 'description' },
        //   { data: 'stack' },
        //   { data: 'developers' },
        //   { data: 'link' }
        // ]
      // }
      $eventsTable.DataTable()
      $('#refreshButton').removeClass('fa-spin');
    }).catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log('[DSC:Firebase:Firestore:Error:' + errorCode + ']', 'Failed to load events because ' + errorMessage);
      console.warn(error)
      $('#eventsErrorAlert').text(errorMessage);
      $('#eventsErrorAlert').show();
    })
  }
  window.__DSCAuthPromise.then(function (user) {
    fetchEventsData();
    $('#addButton').removeAttr('disabled');
    $('#refreshButton').on('click', fetchEventsData);
  })


});