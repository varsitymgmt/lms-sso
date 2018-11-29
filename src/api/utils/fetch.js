import fetch from 'universal-fetch';

export default function(url, params, context) {
  // console.info(url, params, context);
  const { user } = context;
  if (params.body) {
    const body = JSON.parse(params.body);
    body.user = user;
    params.body = JSON.stringify(body); // eslint-disable-line
  } else {
    const body = {};
    body.user = user;
    params.body = JSON.stringify(body); // eslint-disable-line
    params.headers = { 'Content-Type': 'application/json' };// eslint-disable-line

    //  console.info(params);
  }

  return fetch(url, params);
}
