'use strict';

var http = require('http');
var spawn = require('child_process').spawn;
var url = require('url');

var corsify = require('corsify');
var hyperquest = require('hyperquest');
var logfmt = require('logfmt');
var router = require('routes-router');

var config = require('./config');

var app = router();

app.addRoute('/jq?', function (req, res) {
  var query = url.parse(req.url, true).query;
  var remoteUrl = query.url;
  var filter = query.f;
  var flags = query.flags;
  var args;
  if (flags) {
    args = flags.split(',').map(function (flag) {
      if (flag.length > 1) {
        return '--' + flag;
      }
      return '-' + flag;
    });
    args.push(filter);
  } else {
    args = [filter];
  }
  var jq = spawn('jq', args);
  res.statusCode = 200;
  jq.stdout.pipe(res);
  // TODO: Only set the status code once we've received data via jq.stdout,
  // before we write it to req. If we receive something from jq.stderr first,
  // send a 400 with that message (we assume it's the client's fault) and
  // disconnect the other pipe.
  jq.stderr.pipe(process.stdout);
  // TODO: use hippo to support fetching gzip'd remote content
  var remote = hyperquest(remoteUrl);
  remote.pipe(jq.stdin);
  jq.on('error', logfmt);
  remote.on('error', logfmt);
});

var server = http.createServer(corsify(app));
server.listen(config.port, function (error) {
  if (error) {
    logfmt.error(error);
    process.exit(1);
  }
  logfmt.log({ action: 'listening', port: config.port });
});
