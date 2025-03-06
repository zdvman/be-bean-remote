const { selectVisitsByUser } = require('../models/visits.models');
const { selectUserByUserId } = require('../models/users.models');

function getVisitsByUser(req, res, next) {
    const user_id = req.query.user_id;
    selectUserByUserId(user_id)
    .then(() => {
      return selectVisitsByUser(user_id);
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