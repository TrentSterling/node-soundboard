var async = require('async')
var exec = require('child_process').exec;
var express = require('express');
var fs = require('fs');
var mustache = require('mustache');
var path = require('path');
var walk = require('walk');

var configuration = require('./configuration');
var imageTypes = [".jpg", ".gif", ".png"];
var htmlTemplate = fs.readFileSync("templates/index.mustache", "utf8");

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function getSoundFileNames(done) {
    var files = [];
    var walker = walk.walk(configuration.dataDir, {
        followLinks: false
    });

    walker.on('file', function(root, stat, next) {
        if (stat.name.endsWith(".wav")) {
            files.push(stat.name);
        }

        next();
    });

    walker.on('end', function() {
        done(files);
    });
}

function getFileFullData(file, done) {
    var imgBasePath = configuration.dataDir;
    var imgBaseName = file.replace(/\.[^/.]+$/, "");

    var potentialImageFiles = imageTypes.map(function(type) {
        return imgBaseName + type;
    });


    async.filter(
        potentialImageFiles,
        function(potentialFile, callback) {
            fs.exists(path.join(imgBasePath, potentialFile), callback);
        },
        function(existingImageFiles) {
            result = {
                name: file
            };

            if (typeof existingImageFiles[0] === 'undefined') {
                result.imgName = "generic_image.jpg";
            } else {
                result.imgName = existingImageFiles[0];
            }

            done(null, result);
        }
    )
}

function playFile(file) {
    var command = __dirname + '/scripts/play.sh ' + configuration.dataDir + "/" + file;
    exec(command)
}

function getFilesFullData(callback) {
    getSoundFileNames(function(filesNames) {
        async.map(
            filesNames,
            getFileFullData,
            callback);
    });
}

var app = express();

app.get('/', function(req, res) {
    if (!!req.query.id) {
        playFile(req.query.id);
    }

    getFilesFullData(function(error, result) {
        res.send(mustache.to_html(htmlTemplate, {
            pageTitle: configuration.pageTitle,
            files: result
        }));
    });
});

app.use('/data', express.static(configuration.dataDir));
app.use('/static', express.static(__dirname + '/static/'));
app.listen(configuration.listenPort);

console.log('Soundboard is starting on port ' + configuration.listenPort + '...');