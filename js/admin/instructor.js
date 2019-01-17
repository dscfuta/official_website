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
    

  
  var $instructorModal = $('#instructorModal');
  var $instructorForm = $('#instructorForm');
  var $instructorSubmitButton = $('#instructorSubmitButton');
  var $instructorModalModeText = $('.instructorModalModeText');
  var $instructorModalErrorAlert = $('#instructorModalErrorAlert');
  var $imageUploadProgress = $('#imageUploadProgress');
  var dataMap = [
    ['name', '#instructorName'],
    ['role', '#instructorRole'],
    ['bio', '#instructorBio'],
    ['twitterID', '#instructorTwitterId'],
    ['githubID', '#instructorGithubId'],
  ];
  var formMode = null;
  var activeEditDocId = null;
  function uploadImage(instructorId, imageFile) {
    var imageRef = instructorImagesRef.child(instructorId)
    var uploadTask = imageRef.put(imageFile, { instructorId: instructorId })
    uploadTask.on('state_changed', function (snapshot) {
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      $imageUploadProgress.find('.progress-bar')
        .css({ width: progress + '%' })
        .attr({ ariaValuenow: progress })
        .text(progress + '%')
    })
    return uploadTask
  }
  $('#addButton').on('click', function () {
    formMode = 'add';
    $instructorModalModeText.text('Add');
    for (var i = 0; i < dataMap.length; i++) {
      var map = dataMap[i];
      var inputSelector = map[1];
      var valueAttribute = map[2];
      if (valueAttribute) {
        $(inputSelector)[0][valueAttribute] = null
      } else {
        $(inputSelector).val(null);
      }
    }
    // $('#instructorName').val(null);
    // $('#instructorDescription').val(null);
    // $('#instructorVenue').val(null);
    // $('#instructorDate').val(null);
    // $('#instructorTime').val(null);
    // $('#instructorPhotosURL').val(null);
    // $('#instructorYoutubeURL').val(null);
    // $('#instructorMeetupURL').val(null);
    $instructorModal.modal('show');
  })
  $instructorForm.on('submit', function (instructor) {
    instructor.preventDefault();
    $instructorSubmitButton.attr('disabled', true);
    $instructorModalErrorAlert.hide();
    var data = {}
    for (var i = 0; i < dataMap.length; i++) {
      var map = dataMap[i];
      var fieldName = map[0];
      var inputSelector = map[1];
      var valueAttribute = map[2];
      if (valueAttribute) {
        data[fieldName] = $(inputSelector)[0][valueAttribute];
      } else {
        data[fieldName] = $(inputSelector).val();
      }
    }
    // var data = {
    //   name: $('#instructorName').val(),
    //   description: $('#instructorDescription').val(),
    //   venue: $('#instructorVenue').val(),
    //   date: inputsToDate($('#instructorDate')[0].valueAsDate, $('#instructorTime')[0].valueAsDate),
    //   photosURL: $('#instructorPhotosURL').val(),
    //   youtubeURL: $('#instructorYoutubeURL').val(),
    //   meetupURL: $('#instructorMeetupURL').val()
    // };
    if (formMode === 'edit') {
      if (!activeEditDocId) {
        throw new Error('No document is being edited?!');
      } else {
        db.collection("instructors").doc(activeEditDocId).update(data).then(function () {
          $imageUploadProgress.show();
          var imageFile = document.getElementById('instructorImage').files[0];
          return uploadImage(activeEditDocId, imageFile)
        }).then(function () {
          $instructorModal.modal('hide');
          $imageUploadProgress.hide();
          $instructorSubmitButton.removeAttr('disabled');
          fetchInstructorsData();
        }).catch(function (error) {
          $imageUploadProgress.hide();
          $instructorModalErrorAlert.text(error.message);
          $instructorModalErrorAlert.show();
        })
      }
    } else {
      db.collection("instructors").add(data).then(function (docRef) {
        var instructorId = docRef.id;
        var imageFile = document.getElementById('instructorImage').files[0];
        $imageUploadProgress.show();
        return uploadImage(instructorId, imageFile);
      }).then(function () {
        $imageUploadProgress.hide();
        $instructorModal.modal('hide')
        $instructorSubmitButton.removeAttr('disabled');
        fetchInstructorsData();
      }).catch(function (error) {
        $imageUploadProgress.hide();
        $instructorModalErrorAlert.text(error.message);
        $instructorModalErrorAlert.show();
      })
    }
  })
  function makeCol(text) {
    return $('<td></td>').text(text);
  }
  function makeColWithChildren(children) {
    return $('<td></td').append(children);
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
        $instructorModalModeText.text('Edit');
        formMode = 'edit';
        activeEditDocId = doc.id;
        for (var i = 0; i < dataMap.length; i++) {
          var map = dataMap[i];
          var fieldName = map[0];
          var inputSelector = map[1];
          var valueAttribute = map[2];
          if (valueAttribute) {
            $(inputSelector)[0][valueAttribute] = data[fieldName];
          } else {
            $(inputSelector).val(data[fieldName]);
          }
        }
        // $('#instructorName').val(data.name);
        // $('#instructorDescription').val(data.description);
        // $('#instructorVenue').val(data.venue);
        // $('#instructorDate')[0].valueAsDate = convertToDate(data.date);
        // $('#instructorTime')[0].valueAsDate = convertToDate(data.date);
        // $('#instructorPhotosURL').val(data.photosURL);
        // $('#instructorYoutubeURL').val(data.youtubeURL);
        // $('#instructorMeetupURL').val(data.meetupURL);
        $instructorModal.modal('show');
      });
  }
  function makeDeleteButton(doc) {
    return $('<button></button>')
      .addClass('btn')
      .addClass('btn-danger')
      .addClass('ml-1')
      .append($('<i></i>').addClass('fas').addClass('fa-trash'))
      .on('click', function () {
        var confirmDelete = confirm('Delete instructor ' + doc.data().name + '?');
        if (confirmDelete) {
          instructorImagesRef.child('')
          db.collection("instructors")
          .doc(doc.id)
          .delete().then(function () {
            fetchInstructorsData()
          }).catch(function (error) {
            alert('Failed to delete instructor because ' + error.message);
          })
        }
      })
  }
  function convertToDate(firebaseTimestamp) {
    return new Date(firebaseTimestamp.seconds * 1000);
  }
  function fetchInstructorsData() {
    var $instructorsTable = $('#instructorsTable');
    var $instructorsTableBody = $instructorsTable.find('tbody');
    $('#refreshButton').addClass('fa-spin');
    $('#instructorsErrorAlert').hide();
    $instructorsTableBody.empty();
    db.collection("instructors").get().then(function (querySnapshot) {
      var docDatas = querySnapshot.docs.map(function (doc) {
        return doc.data();
      });
      if ($.fn.dataTable.isDataTable($instructorsTable)) {
        $instructorsTable.DataTable().clear().draw().destroy();
      }
      querySnapshot.forEach(function (doc) {
        var data = doc.data()
        var bioTruncated = (data.bio ? data.bio.slice(0, 30) : '') + '...'
        $instructorsTableBody.append(makeRow([
          makeCol(data.name),
          makeCol(bioTruncated),
          makeCol(data.role),
          makeCol(data.twitterID),
          makeCol(data.githubID),
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
      $instructorsTable.DataTable()
      $('#refreshButton').removeClass('fa-spin');
    }).catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log('[DSC:Firebase:Firestore:Error:' + errorCode + ']', 'Failed to load instructors because ' + errorMessage);
      console.warn(error)
      $('#instructorsErrorAlert').text(errorMessage);
      $('#instructorsErrorAlert').show();
    })
  }
  window.__DSCAuthPromise.then(function (user) {
    fetchInstructorsData();
    $('#addButton').removeAttr('disabled');
    $('#refreshButton').on('click', fetchInstructorsData);
  })


});