$(function() {
  // Initialize Cloud Firestore through Firebase
  var db = firebase.firestore();
  // Disable deprecated features
  db.settings({
    timestampsInSnapshots: true
  });

  var stacks = [
    {
      name: 'Mobile',
      color: 'primary',
      icon: 'fas fa-mobile-alt',
      id: 'mobile'
    },
    { name: 'Web', color: 'secondary', icon: 'fab fa-node-js', id: 'web' },
    {
      name: 'Machine Learning / AI',
      color: 'warning',
      icon: 'fas fa-microchip',
      id: 'mlai'
    },
    { name: 'Cloud', color: 'danger', icon: 'fas fa-cloud', id: 'cloud' }
  ];

  var $modals = {
    course: $('#courseModal'),
    book: $('#bookModal'),
    documentation: $('#documentationModal')
  };
  var $modalModeText = $('.modalModeText');
  var activeStack = 'web';
  var courseDataMap = [
    ['title', '#courseTitle'],
    ['description', '#courseDescription'],
    ['level', '#courseLevel'],
    ['link', '#courseLink']
  ];
  var bookDataMap = [
    ['title', '#bookTitle'],
    ['author', '#bookAuthor'],
    ['description', '#bookDescription'],
    ['level', '#bookLevel'],
    ['link', '#bookLink'],
    ['types', '[name="bookAvailability"]:checked']
  ];
  var documentationDataMap = [
    ['title', '#documentationTitle'],
    ['description', '#documentationDescription'],
    ['level', '#documentationLevel'],
    ['link', '#documentationLink']
  ];
  var dataMaps = {
    course: courseDataMap,
    book: bookDataMap,
    documentation: documentationDataMap
  };
  var $tables = {
    course: $('#courseTable'),
    book: $('#bookTable'),
    documentation: $('#documentationTable')
  };
  var formMode = null;
  var activeEditDocId = null;
  function setupForm(type) {
    var $modal = $modals[type];
    var $form = $modal.find('form');
    var $errorAlert = $modal.find('.error-alert');
    var $submitButton = $form.find('.btn-submit');
    var dataMap = dataMaps[type];
    $form.on('submit', function(event) {
      event.preventDefault();
      $submitButton.attr('disabled', true);
      $errorAlert.hide();
      var data = {
        stack: activeStack,
        type: type
      };
      for (var i = 0; i < dataMap.length; i++) {
        var map = dataMap[i];
        var fieldName = map[0];
        var inputSelector = map[1];
        var valueAttribute = map[2];
        if (valueAttribute) {
          if ($(inputSelector).length > 1) {
            var values = $(inputSelector).map(function (_, elem) {
              return elem[valueAttribute];
            }).get()
            data[fieldName] = values
          } else {
            data[fieldName] = $(inputSelector)[0][valueAttribute];
          }
        } else {
          if ($(inputSelector).length > 1) {
            var values = $(inputSelector).map(function () {
              return $(this).val();
            }).get()
            data[fieldName] = values
          } else {
            data[fieldName] = $(inputSelector).val();
          }
        }
      }
      if (formMode === 'edit') {
        if (!activeEditDocId) {
          throw new Error('No document is being edited?!');
        } else {
          db.collection('materials')
            .doc(activeEditDocId)
            .update(data)
            .then(function() {
              $modal.modal('hide');
              $submitButton.removeAttr('disabled');
              fetchData(type);
            })
            .catch(function(error) {
              $errorAlert.text(error.message);
              $errorAlert.show();
            });
        }
      } else {
        db.collection('materials')
          .add(data)
          .then(function() {
            $modal.modal('hide');
            $submitButton.removeAttr('disabled');
            fetchData(type);
          })
          .catch(function(error) {
            $errorAlert.text(error.message);
            $errorAlert.show();
          });
      }
    });
  }
  function makeCol(text) {
    return $('<td></td>').text(text);
  }
  function makeColWithChildren(children) {
    return $('<td></td')
      .addClass('d-flex')
      .append(children);
  }
  function makeRow(cols) {
    var $row = $('<tr></tr>');
    cols.forEach(function(col) {
      $row.append(col);
    });
    return $row;
  }
  function makeEditButton(doc, type) {
    var data = doc.data();
    return $('<button></button>')
      .addClass('btn')
      .addClass('btn-success')
      .append(
        $('<i></i')
          .addClass('fas')
          .addClass('fa-edit')
      )
      .on('click', function() {
        $modalModeText.text('Edit');
        formMode = 'edit';
        activeEditDocId = doc.id;
        var $modal = $modals[type];
        var dataMap = dataMaps[type];
        for (var i = 0; i < dataMap.length; i++) {
          var map = dataMap[i];
          var fieldName = map[0];
          var inputSelector = map[1];
          var valueAttribute = map[2];
          if (valueAttribute) {
            if ($(inputSelector).length > 1) {
              $(inputSelector).each(function (index, elem) {
                elem[valueAttribute] = data[fieldName][index];
              })
            } else {
              data[fieldName] = $(inputSelector)[0][valueAttribute];
            }
          } else {
            if ($(inputSelector).length > 1) {
              $(inputSelector).each(function (index, elem) {
                $(elem).val(data[fieldName][index]);
              })
            } else {
              $(inputSelector).val(data[fieldName]);
            }
          }
        }
        $modal.modal('show');
      });
  }
  function makeDeleteButton(doc, type) {
    return $('<button></button>')
      .addClass('btn')
      .addClass('btn-danger')
      .addClass('ml-1')
      .append(
        $('<i></i>')
          .addClass('fas')
          .addClass('fa-trash')
      )
      .on('click', function() {
        var docId = doc.id;
        var confirmDelete = confirm(
          'Are you sure you want to delete this material?'
        );
        if (confirmDelete) {
          db.collection('materials')
            .doc(docId)
            .delete()
            .then(function() {
              fetchData(type);
            })
            .catch(function(error) {
              alert('Failed to delete material because ' + error.message);
            });
        }
      });
  }
  function convertToDate(firebaseTimestamp) {
    return new Date(firebaseTimestamp.seconds * 1000);
  }
  function fetchData(type, stack) {
    if (stack === null || stack === undefined) stack = activeStack;
    var $table = $tables[type];
    var $body = $table.find('tbody');
    var $refreshButton = $('.btn-refresh[data-type="' + type + '"]');
    var $errorAlert = $('.error-alert[data-type="' + type + '"]');
    $refreshButton.addClass('fa-spin');
    $errorAlert.hide();
    $body.empty();
    var dataAttributes = dataMaps[type].map(function(map) {
      return map[0];
    });
    db.collection('materials')
      .where('stack', '==', stack)
      .where('type', '==', type)
      .get()
      .then(function(querySnapshot) {
        if ($.fn.dataTable.isDataTable($table)) {
          $table
            .DataTable()
            .clear()
            .draw()
            .destroy();
        }
        querySnapshot.forEach(function(doc) {
          var data = doc.data();
          var uiData = dataAttributes.map(function(attr) {
            if (attr === 'description') {
              return data[attr].slice(0, 30) + '...';
            } else {
              return data[attr];
            }
          });
          var dataCols = uiData.map(makeCol);
          $body.append(
            makeRow(
              dataCols.concat([
                makeColWithChildren([
                  makeEditButton(doc, type),
                  makeDeleteButton(doc, type)
                ])
              ])
            )
          );
        });

        $table.DataTable();
        $refreshButton.removeClass('fa-spin');
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(
          '[DSC:Firebase:Firestore:Error:' + errorCode + ']',
          'Failed to load materials of type ' +
            type +
            ' because ' +
            errorMessage
        );
        console.warn(error);
        $errorAlert.text(errorMessage);
        $errorAlert.show();
      });
  }
  function fetchStackData(stack) {
    for (var type in $modals) {
      fetchData(type, stack);
    }
  }
  $('#stackSelect').val(activeStack);
  $('#stackSelect').on('change', function() {
    activeStack = $('#stackSelect').val();
    fetchStackData(activeStack);
  });
  $('.btn-add').on('click', function() {
    var type = $(this).data('type');
    formType = type;
    formMode = 'add';
    $modalModeText.text('Add');
    var dataMap = dataMaps[type];
    var $modal = $modals[type];
    for (var i = 0; i < dataMap.length; i++) {
      var map = dataMap[i];
      var inputSelector = map[1];
      var valueAttribute = map[2];
      if (valueAttribute) {
        $(inputSelector)[0][valueAttribute] = null;
      } else {
        $(inputSelector).val(null);
      }
    }
    $modal.modal('show');
  });
  for (var type in $modals) {
    setupForm(type);
  }
  window.__DSCAuthPromise.then(function(user) {
    for (var type in $modals) {
      fetchData(type);
    }
    $('.btn-add').removeAttr('disabled');
    $('.btn-refresh').on('click', function() {
      var type = $(this).data('type');
      fetchData(type);
    });
  });
});
