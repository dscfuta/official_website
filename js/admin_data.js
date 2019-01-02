$(function () {
  // Initialize Cloud Firestore through Firebase
  var db = firebase.firestore();
    

  // Disable deprecated features
  db.settings({
    timestampsInSnapshots: true
  });
  var $projectModal = $('#projectModal');
  var $projectForm = $('#projectForm');
  var $projectSubmitButton = $('#projectSubmitButton');
  var $projectModalModeText = $('.projectModalModeText');
  var $projectModalErrorAlert = $('#projectModalErrorAlert');
  var formMode = null;
  var activeEditDocId = null;
  $('#addProjectButton').on('click', function () {
    formMode = 'add';
    $projectModalModeText.text('Add');
    $('#projectName').val(null);
    $('#projectDescription').val(null);
    $('#projectStack').val(null);
    $('#projectDevelopers').val(null);
    $('#projectLink').val(null);
    $projectModal.modal('show');
  })
  $projectForm.on('submit', function (event) {
    event.preventDefault();
    $projectSubmitButton.attr('disabled', true);
    $projectModalErrorAlert.hide();
    var data = {
      name: $('#projectName').val(),
      description: $('#projectDescription').val(),
      stack: $('#projectStack').val(),
      developers: $('#projectDevelopers').val(),
      link: $('#projectLink').val()
    };
    if (formMode === 'edit') {
      if (!activeEditDocId) {
        throw new Error('No document is being edited?!');
      } else {
        db.collection("projects")
          .doc(activeEditDocId)
          .update(data).then(function () {
          $projectModal.modal('hide')
          $projectSubmitButton.removeAttr('disabled');
          fetchProjectsData();
        }).catch(function (error) {
          $projectModalErrorAlert.text(error.message);
          $projectModalErrorAlert.show();
        })
      }
    } else {
      db.collection("projects").add(data).then(function (docRef) {
        $projectModal.modal('hide')
        $projectSubmitButton.removeAttr('disabled');
        fetchProjectsData();
      }).catch(function (error) {
        $projectModalErrorAlert.text(error.message);
        $projectModalErrorAlert.show();
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
        $projectModalModeText.text('Edit');
        formMode = 'edit';
        activeEditDocId = doc.id;
        $('#projectName').val(data.name);
        $('#projectDescription').val(data.description);
        $('#projectStack').val(data.stack);
        $('#projectDevelopers').val(data.developers);
        $('#projectLink').val(data.link);
        $projectModal.modal('show');
      });
  }
  function makeDeleteButton(doc) {
    return $('<button></button>')
      .addClass('btn')
      .addClass('btn-danger')
      .addClass('ml-1')
      .append($('<i></i>').addClass('fas').addClass('fa-trash'))
      .on('click', function () {
        var confirmDelete = confirm('Delete project ' + doc.data().name + '?');
        if (confirmDelete) {
          db.collection("projects")
          .doc(doc.id)
          .delete().then(function () {
            fetchProjectsData()
          }).catch(function (error) {
            alert('Failed to delete project because ' + error.message);
          })
        }
      })
  }
  function fetchProjectsData() {
    var $projectsTable = $('#projectsTable');
    var $projectsTableBody = $projectsTable.find('tbody');
    $('#refreshProjectsButton').addClass('fa-spin');
    $('#projectsErrorAlert').hide();
    $projectsTableBody.empty();
    db.collection("projects").get().then(function (querySnapshot) {
      var docDatas = querySnapshot.docs.map(function (doc) {
        return doc.data();
      });
      if ($.fn.dataTable.isDataTable($projectsTable)) {
        $projectsTable.DataTable().clear().draw().destroy();
      }
      querySnapshot.forEach(function (doc) {
        var data = doc.data()
        console.log(`${doc.id}`, data)

        $projectsTableBody.append(makeRow([
          makeCol(data.name),
          makeCol(data.description),
          makeCol(data.stack),
          makeCol(data.developers),
          makeCol(data.link),
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
      $projectsTable.DataTable()
      $('#refreshProjectsButton').removeClass('fa-spin');
    }).catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log('[DSC:Firebase:Firestore:Error:' + errorCode + ']', 'Failed to load projects because ' + errorMessage);
      console.warn(error)
      $('#projectsErrorAlert').text(errorMessage);
      $('#projectsErrorAlert').show();
    })
  }
  window.__DSCAuthPromise.then(function (user) {
    fetchProjectsData();
    $('#addProjectButton').removeAttr('disabled');
    $('#refreshProjectsButton').on('click', fetchProjectsData);
  })


});