const db = require('../db/connection');

function selectReports() {
  const sql = `SELECT * FROM reports;`;
  return db.query(sql).then(({ rows }) => {
    return rows;
  });
}

function insertReport({ reporter_id, cafe_id, reason }) {
  if (!reporter_id || !cafe_id || !reason) {
    return Promise.reject({
      msg: 'Report is missing required fields',
      status: 400,
    });
  }

  const sql = `INSERT INTO reports (reporter_id, cafe_id, reason) VALUES ($1, $2, $3) RETURNING *;`;
  const params = [reporter_id, cafe_id, reason];
  return db.query(sql, params).then(({ rows }) => {
    return rows[0];
  });
}

function selectReportByReportId({ id }) {
  if (!id) {
    return Promise.reject({
      msg: 'Report ID is missing',
      status: 400,
    });
  }
  const sql = `SELECT * FROM reports WHERE id=$1;`;
  const params = [id];
  return db.query(sql, params).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        msg: `No report found for report_id: ${id}`,
        status: 404,
      });
    }
    return rows[0];
  });
}

function updateReportByReportId({ id }, { status }) {
  if (!id) {
    return Promise.reject({
      msg: 'Report ID is missing',
      status: 400,
    });
  }
  if (!status) {
    return Promise.reject({
      msg: 'Report status is missing',
      status: 400,
    });
  }
  const sql = `UPDATE reports SET status=$1 WHERE id=$2 RETURNING *;`;
  const params = [status, id];
  return db.query(sql, params).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        msg: `No report found for report_id: ${id}`,
        status: 404,
      });
    }
    return rows[0];
  });
}

function removeReportByReportId({ id }) {
  if (!id) {
    return Promise.reject({
      msg: 'Report ID is missing',
      status: 400,
    });
  }
  const sql = `DELETE FROM reports WHERE id=$1;`;
  const params = [id];
  return db.query(sql, params).then(({ rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({
        msg: `No report found for report_id: ${id}`,
        status: 404,
      });
    }
    return;
  });
}

module.exports = {
  selectReports,
  insertReport,
  selectReportByReportId,
  updateReportByReportId,
  removeReportByReportId,
};
