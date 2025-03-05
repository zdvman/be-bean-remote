const {
  selectUsers,
  selectUserByUsername,
  insertUser,
  selectUserByUserId,
} = require('../models/users.models');

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

function postUser(request, response, next) {
  return insertUser(request?.body)
    .then((user) => {
      response.status(201).send({ user });
    })
    .catch(next);
}

function getUserByUserId(request, response, next) {
  const id = request.params.id;
  return selectUserByUserId(id)
    .then((user) => {
      console.log(user);
      response.status(200).send({ user });
    })
    .catch(next);
}

module.exports = {
  getUsers,
  getUserByUsername,
  postUser,
  getUserByUserId,
};
