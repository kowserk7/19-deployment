'use strict';

const Photo = require('../model/photo');
const bodyParser = require('body-parser').json();
const errorHandler = require('../lib/error-handler');
const bearerAuth = require('../lib/bearer-auth-middleware');
const multer = require('multer');
const tempDir = `${__dirname}/../temp`;
const upload = multer({dest: tempDir});

module.exports = function(router) {
  router.get('/photos/me', bearerAuth, (request, response) => {
    Photo.find({userId: request.user._id})
      .then(photos => photos.map(photo => photo._id))
      .then(ids => response.status(200).json(ids))
      .catch(err => errorHandler(err, response));
  });
  router.route('/photo/:id?')
    .post(bearerAuth, bodyParser, upload.single('image'), (request, response) => {
      Photo.upload(request)
        .then(photoData => new Photo(photoData).save())
        .then(pic => response.status(201).json(pic))
        .catch(err => errorHandler(err, response));
    })
    .get(bearerAuth, (request, response) => {
      if(request.params.id) {
        return Photo.findById(request.params.id)
          .then(pic => response.status(200).json(pic))
          .catch(err => errorHandler(err, response));
      }
      Photo.find({userID: request.query.userId})
        .then(photos => photos.map(photo => photo._id))
        .then(ids => response.status(200).json(ids))
        .catch(err => errorHandler(err, response));
    });
};