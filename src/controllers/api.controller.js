const { fetchApi } = require('../models/api.model');

function getApi(request, response, next) {
  return fetchApi()
    .then((endpoints) => {
      response.status(200).send({ endpoints });
    })
    .catch(next);
}

module.exports = { getApi };
