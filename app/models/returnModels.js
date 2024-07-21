const db = require("../../database");

const returModels = {
  async getAllReturns() {
    const result = await db.query("SELECT * FROM retur");
    return result.rows;
  },

  async createReturn(retur) {
    const { retur_no, customer_name, country, product_id, qty, serial_no, analyse_id } = retur;
    const result = await db.query("INSERT INTO retur (retur_no, customer_name, country, product_id, qty, serial_no, analyse_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [
      retur_no,
      customer_name,
      country,
      product_id,
      qty,
      serial_no,
      analyse_id,
    ]);
    return result.rows[0];
  },

  async getReturnById(id) {
    const result = await db.query("SELECT * FROM retur WHERE retur_id = $1", [id]);
    return result.rows[0];
  },

  async updateReturnById(id, retur) {
    const { retur_no, customer_name, country, product_id, qty, serial_no, analyse_id } = retur;
    const result = await db.query("UPDATE retur SET retur_no = $1, customer_name = $2, country = $3, product_id = $4, qty = $5, serial_no = $6, analyse_id = $7 WHERE retur_id = $8 RETURNING *", [
      retur_no,
      customer_name,
      country,
      product_id,
      qty,
      serial_no,
      analyse_id,
      id,
    ]);
    return result.rows[0];
  },

  async deleteReturnById(id) {
    const result = await db.query("DELETE FROM retur WHERE retur_id = $1 RETURNING *", [id]);
    return result.rows[0];
  },

  async createAnalysis(analysis) {
    const { verification, root_cause, defect_type, action, status, created_by } = analysis;
    const result = await db.query("INSERT INTO analyse (verification, root_cause, defect_type, action, status, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *", [
      verification,
      root_cause,
      defect_type,
      action,
      status,
      created_by,
    ]);
    return result.rows[0];
  },

  async beginTransaction() {
    await db.query("BEGIN");
  },

  async commitTransaction() {
    await db.query("COMMIT");
  },

  async rollbackTransaction() {
    await db.query("ROLLBACK");
  },
};

module.exports = returModels;
