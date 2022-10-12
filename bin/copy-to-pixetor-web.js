const rmdir = require('rmdir');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

const PIXETOR_PATH = path.resolve(__dirname, '..');
const PIXETORAPP_PATH = path.resolve(__dirname, '../../pixetor-web');

var pjson = require('../package.json');

// Callbacks sorted by call sequence.
function onCopy(err) {
  if (err) {
    console.error('Failed to copy static files...');
    return console.error(err);
  }

  console.log('Copied static files to pixetor-web...');
  let previousPartialPath = path.resolve(PIXETORAPP_PATH, 'templates/editor/main-partial.html');
  fs.access(previousPartialPath, fs.constants.F_OK, function (err) {
    if (err) {
      // File does not exit, call next step directly.
      console.error('Previous main partial doesn\'t exist yet.');
      onDeletePreviousPartial();
    } else {
      // File exists, try to delete it before moving on.
      fs.unlink(previousPartialPath, onDeletePreviousPartial);
    }
  })
}

function onDeletePreviousPartial(err) {
  if (err) {
    console.error('Failed to delete previous main partial...');
    return console.error(err);
  }

  console.log('Previous main partial deleted...');
  fse.copy(
    path.resolve(PIXETORAPP_PATH, "pixetorapp-partials/main-partial.html"),
    path.resolve(PIXETORAPP_PATH, "templates/editor/main-partial.html"),
    onCopyNewPartial
  );
}

function onCopyNewPartial(err) {
  if (err) {
    console.error('Failed to delete previous main partial...');
    return console.error(err);
  }

  console.log('Main partial copied...');
  rmdir(
    path.resolve(PIXETORAPP_PATH, "pixetorapp-partials/"),
    onDeleteTempPartial
  );
}

function onDeleteTempPartial(err) {
  if (err) {
    console.error('Failed to delete temporary main partial...');
    return console.error(err);
  }

  console.log('Temporary main partial deleted...');

  fs.writeFile(path.resolve(PIXETORAPP_PATH, "VERSION"), pjson.version, onVersionFileCreated);
}

function onVersionFileCreated(err) {
  if (err) {
    console.error('Failed to create temporary main partial...');
    return console.error(err);
  }

  console.log('Version file created...');
  console.log('Finished!');
}

fse.copy(
  path.resolve(PIXETOR_PATH, "dest/prod"),
  path.resolve(PIXETORAPP_PATH, ""),
  onCopy
);