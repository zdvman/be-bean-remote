const { checkUserExists } = require('../db/seeds/utils.js');
const { selectVisitsByUser, insertVisit } = require('../models/visits.models');

function getVisitsByUser(req, res, next) {
    const id = req?.query?.user_id;
    return checkUserExists( id )
    .then(() => {
      return selectVisitsByUser( id );
    })
    .then((visits) => {
      if (visits.length === 0) {
        return res.status(404).send({ msg: 'This user has no visits' });
      }
      res.status(200).send({ visits });
    })
    .catch(next);
}

function addVisit(req, res, next) {
  const newVisit = req.body;
  return insertVisit(newVisit)
  .then((visit) => {
      res.status(201).send({ visit });
  })
  .catch((err) => {
      next(err);
  })
}

module.exports = {
  getVisitsByUser,
  addVisit
};