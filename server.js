var express = require('express');
var app = express();

app.use(express.static('public'))

app.get('/', function (req, res) {
  const pug = require('pug');

  // Compile template.pug, and render a set of data
  var page = pug.renderFile('views/index.pug');

  res.send(page);
})

app.listen(3000, function () {
  console.log('Listening on port 3000!');
})
