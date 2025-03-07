const {
  selectReports,
  insertReport,
  selectReportByReportId,
  updateReportByReportId,
  removeReportByReportId,
} = require('../models/reports.models');

function getReports(req, res, next) {
  return selectReports()
    .then((reports) => {
      res.status(200).send({ reports });
    })
    .catch(next);
}

function postReport(req, res, next) {
  console.log(req.body);
  return insertReport(req?.body)
    .then((report) => {
      res.status(201).send({ report });
    })
    .catch(next);
}

function getReportByReportId(req, res, next) {
  return selectReportByReportId(req?.params)
    .then((report) => {
      res.status(200).send({ report });
    })
    .catch(next);
}
function patchReportByReportId(req, res, next) {
  return updateReportByReportId(req?.params, req?.body)
    .then((report) => {
      res.status(200).send({ report });
    })
    .catch(next);
}

function deleteReportByReportId(req, res, next) {
  return removeReportByReportId(req?.params)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
}

module.exports = {
  getReports,
  postReport,
  getReportByReportId,
  patchReportByReportId,
  deleteReportByReportId,
};
