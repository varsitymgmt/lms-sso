import { saveLogObject } from './api/logger/logger.controller';

export function morganMessageLogger(tokens, req, res) {
  const data = {};

  data.method = tokens.method(req, res); // method of request
  data.url = tokens.url(req, res); // url of the request
  data.responseLength = tokens.res(req, res, 'content-length'); // length of response
  data.responseTime = tokens['response-time'](req, res); // response time
  data.status = tokens.status(req, res); // status code
  data.statusMessage = res.statusMessage;
  data.remoteAddress = tokens['remote-addr'](req, res); // origin ip address
  data.date = tokens.date(req, res); // timestamp of the request
  data.referrer = tokens.referrer(req, res); // request referrer url.
  data.requestBody = req.body; // request body.
  data.requestParams = req.params; // request params.
  data.email = req.body.email;

  // Authentication status check.
  if (data.status === 200) {
    data.isAuthenticated = true; // authentication Status.
  } else {
    data.isAuthenticated = false; // authentication Status.
  }
  saveLogObject(data); // save the log object into the database.
  return '';
}

export default { morganMessageLogger };
