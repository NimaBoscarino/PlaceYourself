var express = require('express');
var formidable = require('formidable');
var util = require('util');
var fs = require('fs-extra');
var pug = require('pug');
var sizeOf = require('image-size');
var sharp = require('sharp');
var app = express();

var selectImage = function(collection, height, width) {
  // open up description file, read into object
  // calculate scores
  // select one image
  // return image
  var fileName = `public/defs/${collection}.json`;
  var defs = JSON.parse(fs.readFileSync(fileName, 'utf8'));

  var ratio = height/width;

  var items = defs.map(function(x) {
    return x.name
  });

  // score compared to requested ratio
  var rawScores = defs.map(function(x) {
    return 1 - Math.abs((x.height/x.width) - ratio)
  });

  // normalize so scores add up to 1
  var rawSum = rawScores.reduce((a, b) => a + b, 0);

  var normalScores = rawScores.map(function(x) {
    return x/rawSum
  });

  var rand = function(min, max) {
      return Math.random() * (max - min) + min;
  };

  var getRandomItem = function(list, weight) {
    var total_weight = weight.reduce(function (prev, cur, i, arr) {
      return prev + cur;
    });

    var random_num = rand(0, total_weight);
    var weight_sum = 0;
    //console.log(random_num)

    for (var i = 0; i < list.length; i++) {
      weight_sum += weight[i];
      weight_sum = +weight_sum.toFixed(2);

      if (random_num <= weight_sum) {
        return list[i];
      }
    }

  };
  var randomItem;
  while (randomItem == null) { // because I'm too sleepy to fix the algorithm
    randomItem = getRandomItem(items, normalScores);
  }
  return randomItem

}
app.use(express.static('public'));

app.get('/', function (req, res) {
  // Compile template.pug, and render a set of data
  var page = pug.renderFile('views/index.pug');

  res.send(page);
});

app.get('/collections/:name', function (req, res) {
  var page = pug.renderFile('views/collection.pug', {
    name: req.params.name,
  });
  res.send(page);
});

app.get('/collections/:name/:height/:width', function (req, res) {
  const folder = 'public/uploads/' + req.params.name + '/';

  if (fs.existsSync(folder)) {
    // this needs to return an image with that height and width
    var retImage = selectImage(req.params.name, req.params.height, req.params.width);

    var filepath = __dirname + `/public/uploads/${req.params.name}/${retImage}`
    var filepath2 = __dirname + `/public/uploads/${req.params.name}/~${retImage}`
    sharp(filepath)
      .resize(Number(req.params.width), Number(req.params.height))
      .toFile(filepath2, function() {
        res.sendFile(filepath2, function() {
          fs.unlinkSync(filepath2);
        });
      });

  } else {
    res.send(req.params.name + ' collection does not exist!');
    // this needs to return a 404
  }

});

app.post('/upload', function(req, res){
  var form = new formidable.IncomingForm();
  var files = [];
  var fields = [];
  var sizes = []
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
    var new_location = `public/uploads/${fields.collectionName}/`;
    fs.ensureDir(new_location, function (err) {
      files.forEach(function(file) {
        var temp_path = file.path;
        var file_name = file.name;

        var dimensions = sizeOf(temp_path);
        console.log(dimensions);
        sizes.push({
          name: file_name,
          width: dimensions.width,
          height: dimensions.height
        });

        fs.copy(temp_path, new_location + file_name, function(err) {
            if (err) {
                console.error(err);
            } else {
              // nothing
            }
        });

        var def = `public/defs/${fields.collectionName}.json`;
        fs.ensureDir(new_location, function (err) {
          fs.writeFileSync(def, JSON.stringify(sizes) , 'utf-8');
        });

      });

      res.redirect('/collections/' + fields.collectionName);

    });
    // right now you don't get all the images, because I'm loading stuff serverside
    // i'll do it with an ajax call later. for now you just have to refresh until you see everything.

  });

  form.parse(req);
});



app.listen(3000, function () {
  console.log('Listening on port 3000!');
});
