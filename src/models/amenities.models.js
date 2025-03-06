const db = require('../db/connection');

function selectAmenities() {
  return db.query('SELECT * FROM amenities;').then(({ rows }) => {
    return rows;
  });
}

function insertAmenity({ name }) {
  if (!name) {
    return Promise.reject({
      msg: 'Amenity name is missing',
      status: 400,
    });
  }
  const sql = `INSERT INTO amenities (name) VALUES ($1) RETURNING *;`;
  const params = [name];
  return db.query(sql, params).then(({ rows }) => {
    return rows[0];
  });
}

function selectAmenityByAmenityId({ id }) {
  if (!id) {
    return Promise.reject({
      msg: 'Amenity ID is missing',
      status: 400,
    });
  }
  const sql = `SELECT * FROM amenities WHERE id=$1;`;
  const params = [id];
  return db.query(sql, params).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        msg: `No amenity found for amenity_id: ${id}`,
        status: 404,
      });
    }
    return rows[0];
  });
}

function updateAmenityByAmenityId({ id }, { name }) {
  if (!id) {
    return Promise.reject({
      msg: 'Amenity ID is missing',
      status: 400,
    });
  }
  if (!name) {
    return Promise.reject({
      msg: 'Amenity name is missing',
      status: 400,
    });
  }
  const sql = `UPDATE amenities SET name=$1 WHERE id=$2 RETURNING *;`;
  const params = [name, id];
  return db.query(sql, params).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        msg: `No amenity found for amenity_id: ${id}`,
        status: 404,
      });
    }
    return rows[0];
  });
}

function removeAmenityByAmenityId({ id }) {
  if (!id) {
    return Promise.reject({
      msg: 'Amenity ID is missing',
      status: 400,
    });
  }
  const sql = `DELETE FROM amenities WHERE id=$1;`;
  const params = [id];
  return db.query(sql, params).then(({ rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({
        msg: `No amenity found for amenity_id: ${id}`,
        status: 404,
      });
    }
    return;
  });
}

module.exports = {
  selectAmenities,
  insertAmenity,
  selectAmenityByAmenityId,
  updateAmenityByAmenityId,
  removeAmenityByAmenityId,
};
