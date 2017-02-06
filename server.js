var express = require('express');
var formidable = require('formidable');
var util = require('util');

var app = express();

app.use(express.static('public'))

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
    form.on('end', function() {
        console.log('done');
        res.redirect('/');
    });
    form.parse(req);
});



app.listen(3000, function () {
  console.log('Listening on port 3000!');
})
