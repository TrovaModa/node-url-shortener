var url = require('url'),
    _ = require("lodash");

module.exports = function (opts) {
  var self = {};

  self.opts = opts || {};
  self.opts.url = self.opts.url || 'http://127.0.0.1:3000';
  self.opts.port = self.opts.port || 3000;
  self.opts['redis-host'] = self.opts['redis-host'] || 'localhost';
  self.opts['redis-port'] = self.opts['redis-port'] || 6379;
  self.opts['redis-pass'] = self.opts['redis-pass'] || false;
  self.opts['redis-db'] = self.opts['redis-db'] || 0;

  self.checkUrl = function (s, domain) {
    var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
      , valid = true;

    // Url correct
    if (regexp.test(s) !== true) {
      valid = false;
    }

    // Url equal application url
    if (valid === true && domain === true) {
      if (url.parse(self.opts.url).hostname === url.parse(s).hostname) {
        valid = false;
      }
    }

    return valid;
  };

  self.checkHash = function(hash){
    if(hash){
      return /^[\w=]+$/.test(hash);
    }
    else{
      return true;
    }
  };

  self.getModel = function (callback) {
    var RedisModel = require('./redis-model')
      , config = {
          host: self.opts['redis-host'],
          port: self.opts['redis-port'],
          pass: self.opts['redis-pass'],
          db: self.opts['redis-db']
        };

    callback(null, new RedisModel(config));
  };

  self.shorten = function (long_url, short_url, callback) {
    if (this.checkUrl(long_url, true)) {
      if(this.checkHash(short_url)){
        this.getModel(function (err, model) {
          if (err) {
            callback(500);
          } else {
            model.set(long_url, short_url, callback);
          }
        });
      }
      else{
        callback(500, "Short url not valid");
      }
    } else {
      callback(400);
    }
  };

  self.expand = function (short_url, callback, click) {
    if (this.checkUrl(short_url)) {
      short_url = short_url.split('/').pop();
    }

    if (short_url && /^[\w=]+$/.test(short_url)) {
      this.getModel(function (err, model) {
        if (err) {
          callback(500);
        } else {
          model.get(short_url, callback, click);
        }
      });
    } else {
      callback(400);
    }
  };

  self.analytics = function(hash,callback){
    this.getModel(function(err, model){
      if (err) {
        callback(500);
      } else {
        model.getAnalytics(hash,function(err,urls){
          if(err){
            callback(err);
          }
          else{
            urls.reverse();
            // urls = _.sortBy(urls,function(u){
            //   return -u.clicks;
            // });
            callback(false,urls);
          }
        });
      }
    });
  };

  return self;
};
