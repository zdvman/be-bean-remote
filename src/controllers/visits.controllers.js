const { checkUserExists } = require('../db/seeds/utils.js');
const { selectVisitsByUser } = require('../models/visits.models');

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

module.exports = {
  getVisitsByUser
};