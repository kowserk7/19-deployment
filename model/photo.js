'use strict';

const fs = require('fs');
const del = require('del');
const path = require('path');
const mongoose = require('mongoose');
const tempDir = `${__dirname}/../temp`;
const awsS3 = require('../lib/aws-s3');
const Photo = mongoose.Schema({
  name: {type: String, required: true},
  desc: {type: String, required: true},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'auth', required: true},
  libraryId: {type: mongoose.Schema.Types.ObjectId, ref: 'library', required: true},
  objectKey: {type: String, required: true, unique: true},
  imageURI: {type: String, required: true, unique: true},
});

Photo.statics.upload = function(request) {
  return new Promise((resolve, reject) => {
    if(!request.file) return reject(new Error('Multi-part Form Data Error. File not present on request.'));
    if(!request.file.path) return reject(new Error('Multi-part Form Data Error. File path not present on request.'));
    let params = {
      ACL: 'public-read',
      Bucket: process.env.AWS_BUCKET,
      Key: `${request.file.filename}${path.extname(request.file.originalname)}`,
      Body: fs.createReadStream(request.file.path),
    };
    return awsS3.uploadProm(params)
      .then(data => {
        del([`${tempDir}/${request.file.filename}`]);
        let photoData = {
          name: request.body.name,
          desc: request.body.desc,
          userId: request.user._id,
          libraryId: request.body.libraryId,
          imageURI: data.Location,
          objectKey: data.Key,
        };
        resolve(photoData);
      })
      .catch(reject);
  });
};
module.exports = mongoose.model('photo', Photo);