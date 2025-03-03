const { selectUsers, selectUserByUsername } = require('../models/users.models');

function getUsers(request, response, next) {
  return selectUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch(next);
}

function getUserByUsername(request, response, next) {
  return selectUserByUsername(request?.params)
    .then((user) => {
      response.status(200).send({ user });
    })
    .catch(next);
}

module.exports = {
  getUsers,
  getUserByUsername,
};
