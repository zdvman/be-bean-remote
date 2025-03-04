const db = require('../db/connection');

function selectUsers() {
  const sql = `SELECT * FROM users`;
  return db.query(sql).then(({ rows }) => {
    return rows;
  });
}

function selectUserByUsername({ username }) {
  console.log(username);
  const sql = `SELECT * FROM users WHERE users.username = $1`;
  const args = [username];
  return db.query(sql, args).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        msg: `User with username "${username}" is not found`,
        status: 404,
      });
    }
    return rows[0];
  });
}

function insertUser({ uid, email, full_name }) {
  const sql = `INSERT INTO users (firebase_uid, email, full_name) VALUES ($1, $2, $3) RETURNING *`;
  const args = [uid, email, full_name];
  return db.query(sql, args).then(({ rows }) => {
    return rows[0];
  });
}

function selectUserByUserId({ id }) {
  const sql = `SELECT * FROM users WHERE users.id = $1`;
  const args = [id];
  return db.query(sql, args).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        msg: `User with ID "${id}" is not found`,
        status: 404,
      });
    }
    return rows[0];
  });
}

module.exports = {
  selectUsers,
  selectUserByUsername,
  insertUser,
  selectUserByUserId,
};
