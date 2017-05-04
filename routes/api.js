var URI = require("urijs");

module.exports = function (app, nus) {
  var opts = app.get('opts')
    , http = require('http')
    , router = require('express').Router();

  router.route('/shorten')
    .post(function (req, res) {
      // Compose long url with utm_*
      var long_url = req.body['long_url']
      if(req.body["utm_source"] !== "__notselected__"){
        long_url = URI(req.body['long_url']).removeQuery("utm_source").removeQuery("utm_medium");
        if(req.body["utm_source"]){
          long_url.addQuery("utm_source",req.body["utm_source"])
        }
        if(req.body["utm_medium"]){
          long_url.addQuery("utm_medium",req.body["utm_medium"])
        }
        long_url = long_url.toString()
      }      
      nus.shorten(long_url, req.body['short_url'], req.body['partners'] || '', function (err, reply) {
        if (err) {
          jsonResponse(res, 500, {status_txt : reply,  status_code : 500});
        } else if (reply) {
          reply.short_url = opts.url.replace(/\/$/, '') + '/' + reply.hash;
          jsonResponse(res, 200, reply);
        } else {
          jsonResponse(res, 500);
        }
      });
    });

  router.route('/expand')
    .post(function (req, res) {
      nus.expand(req.body['short_url'], function (err, reply) {
        if (err) {
          jsonResponse(res, err);
        } else if (reply) {
          jsonResponse(res, 200, reply);
        } else {
          jsonResponse(res, 500);
        }
      });
    });

  router.route('/expand/:short_url')
    .get(function (req, res) {
      nus.expand(req.params.short_url, function (err, reply) {
        if (err) {
          jsonResponse(res, err);
        } else if (reply) {
          jsonResponse(res, 200, reply);
        } else {
          jsonResponse(res, 500);
        }
      });
    });

  function jsonResponse (res, code, data) {
    if(!data){
      data = {};
    }
    if(!data.status_code){
      data.status_code = (http.STATUS_CODES[code]) ? code : 503;
    }
    if(!data.status_txt){
      data.status_txt = http.STATUS_CODES[code] || http.STATUS_CODES[503];
    }

    res.status(data.status_code).json(data);
  }

  return router;
};
