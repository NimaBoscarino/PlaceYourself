var express = require('express');
var formidable = require('formidable');
var util = require('util');
var fs = require('fs-extra');
var pug = require('pug');

var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
  // Compile template.pug, and render a set of data
  var page = pug.renderFile('views/index.pug');

  res.send(page);
});

app.get('/collections/:name', function (req, res) {
  const folder = 'public/uploads/' + req.params.name + '/';
  fs.readdir(folder, (err, files) => {
    var page = pug.renderFile('views/collection.pug', {
      name: req.params.name,
      files: files
    });
    res.send(page);
  })


});

app.post('/upload', function(req, res){
  var form = new formidable.IncomingForm();
  var files = [];
  var fields = [];
  form.on('field', function(field, value) {
    fields[field] = value;
  })
  form.on('file', function(field, file) {
    files.push(file);
  })

  form.on('error', function(err) {
    console.error(err);
  });

  form.on('end', function() {
    console.log(fields);
    var new_location = `public/uploads/${fields.collectionName}/`;
    fs.ensureDir(new_location, function (err) {
      files.forEach(function(file) {
        var temp_path = file.path;
        var file_name = file.name;

        fs.copy(temp_path, new_location + file_name, function(err) {
            if (err) {
                console.error(err);
            } else {
                console.log(file_name)
            }
        });
      });
    })
    res.redirect('/collections/' + fields.collectionName);
  });

  form.parse(req);
});



app.listen(3000, function () {
  console.log('Listening on port 3000!');
});
