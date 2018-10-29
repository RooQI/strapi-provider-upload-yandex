'use strict';

/**
 * Module dependencies
 */

/* eslint-disable import/no-unresolved */
/* eslint-disable no-unused-vars */
// Public node modules.
const _ = require('lodash');
const AWS = require('aws-sdk');

module.exports = {
  provider: 'aws-s3',
  name: 'Amazon Web Service S3',
  auth: {
    public: {
      label: 'Access API Token',
      type: 'text'
    },
    private: {
      label: 'Secret Access Token',
      type: 'text'
    },
    
    bucket: {
      label: 'Bucket',
      type: 'text'
    }
  },
  init: (config) => {
    // configure yandex bucket connection
    AWS.config.update({
      accessKeyId: config.public,
      secretAccessKey: config.private,
      endpoint: "https://storage.yandexcloud.net"
    });

    const S3 = new AWS.S3({
      apiVersion: '2006-03-01',
      params: {
        Bucket: config.bucket
      }
    });

    return {
      upload: (file) => {
        return new Promise((resolve, reject) => {
          // upload file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          S3.upload({
            Key: `${path}${file.hash}${file.ext}`,
            Body: new Buffer(file.buffer, 'binary'),
            ACL: 'public-read',
            ContentType: file.mime,
          }, (err, data) => {
            if (err) {
              return reject(err);
            }

            // set the bucket file url
            file.url = data.Location;

            resolve();
          });
        });
      },
      delete: (file) => {
        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          S3.deleteObject({
            Key: `${path}${file.hash}${file.ext}`
          }, (err, data) => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        });
      }
    };
  }
};
