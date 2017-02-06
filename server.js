var express = require('express');
var formidable = require('formidable');
var util = require('util');
var fs = require('fs-extra');

var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
  const pug = require('pug');

  // Compile template.pug, and render a set of data
  var page = pug.renderFile('views/index.pug');

  res.send(page);
})

app.post('/upload', function(req, res){
    var form = new formidable.IncomingForm(),
    files = [],
    fields = [];
    form.on('field', function(field, value) {
      console.log(field, value);
        fields.push([field, value]);
    })
    form.on('file', function(field, file) {
        console.log(file.name);
        files.push([field, file]);
    })

    form.on('progress', function(bytesReceived, bytesExpected) {
        var percent_complete = (bytesReceived / bytesExpected) * 100;
        console.log(percent_complete.toFixed(2));
    });

    form.on('error', function(err) {
        console.error(err);
    });

    form.on('end', function(fields, files) {
        var new_location = 'public/uploads/';

        this.openedFiles.forEach(function(openedFile) {
          var temp_path = openedFile.path;
          var file_name = openedFile.name;

          fs.copy(temp_path, new_location + file_name, function(err) {
              if (err) {
                  console.error(err);
              } else {
                  console.log("success!")
              }
          });

        })
        res.redirect('/');
    });

    form.parse(req);
});



app.listen(3000, function () {
  console.log('Listening on port 3000!');
});
