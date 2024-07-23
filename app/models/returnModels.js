const db = require("../../database");

const returModels = {
  async getAllReturns() {
    try {
      const result = await db.query("SELECT * FROM retur");
      return result.rows;
    } catch (error) {
      console.error("Error in getAllReturns:", error);
      throw new Error("Database query failed");
    }
  },

  async checkSerialNo(serial_no) {
    try {
      const result = await db.query(`SELECT 1 FROM retur WHERE serial_no = $1 LIMIT 1`, [serial_no]);
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error in checkSerialNo:", error);
      throw new Error("Database query failed");
    }
  },

  async createAnalysis(data) {
    const result = await db.query(
      `INSERT INTO analysis ( root_cause, defect_type, action,  verification)
       VALUES ( $1, $2, $3, $4, $5, $6) RETURNING analyze_id`,
      [data.root_cause, data.defect_type, data.action, data.status, data.created_by, data.verification]
    );
    return result.rows[0];
  },

  async createReturn(data) {
    const result = await db.query(
      `INSERT INTO retur (retur_no, customer_name, country, product_id, qty, serial_no, issue, analyse_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING retur_id`,
      [data.retur_no, data.customer_name, data.country, data.product_id, data.qty, data.serial_no, data.issue, data.analyse_id]
    );
    return result.rows[0];
  },

  async createHistory(historyData) {
    const { id_analysa, status, created_by } = historyData;
    const result = await db.query(
      `INSERT INTO history (id_analysa, status, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id_analysa, status, created_by]
    );
    return result.rows[0];
  },

  async getReturnWithDetails(id) {
    try {
      // Fetch return data along with associated product, family, and sector
      const result = await db.query(
        `
        SELECT r.retur_id, r.retur_no, r.customer_name, r.country, r.qty, r.serial_no, r.issue, r.analyse_id,
               p.product_id, p.product_name,
               f.family_name,
               s.sector_name
        FROM retur r
        JOIN products p ON r.product_id = p.product_id
        LEFT JOIN families f ON p.family_id = f.family_id
        LEFT JOIN sectors s ON f.sector_id = s.sector_id
        WHERE r.retur_id = $1
      `,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const returnData = result.rows[0];

      // Fetch analysis data
      const analysisResult = await db.query(
        `
        SELECT analyze_id, root_cause, defect_type, action, verification
        FROM analyze
        WHERE analyze_id = $1
      `,
        [returnData.analyse_id]
      );

      const analysisData = analysisResult.rows[0];

      // Build the response object
      return {
        retur_id: returnData.retur_id,
        retur_no: returnData.retur_no,
        customer_name: returnData.customer_name,
        country: returnData.country,
        products: {
          product_id: returnData.product_id,
          product_name: returnData.product_name,
          families: {
            family_name: returnData.family_name,
            sectors: {
              sector_name: returnData.sector_name,
            },
          },
        },
        qty: returnData.qty,
        serial_no: returnData.serial_no,
        issue: returnData.issue,
        analysis: analysisData,
      };
    } catch (error) {
      console.error("Error in getReturnWithDetails:", error);
      throw new Error("Database query failed");
    }
  },

  async updateReturnById(id, retur) {
    const { retur_no, customer_name, country, product_id, qty, serial_no, issue, analyse_id } = retur;

    try {
      const result = await db.query(
        `UPDATE retur 
         SET retur_no = $1, customer_name = $2, country = $3, product_id = $4, qty = $5, serial_no = $6, issue = $7, analyse_id = $8 
         WHERE retur_id = $9 RETURNING *`,
        [retur_no, customer_name, country, product_id, qty, serial_no, issue, analyse_id, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error in updateReturnById:", error);
      throw new Error("Database query failed");
    }
  },

  async deleteReturnById(id) {
    try {
      const result = await db.query("DELETE FROM retur WHERE retur_id = $1 RETURNING *", [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error in deleteReturnById:", error);
      throw new Error("Database query failed");
    }
  },

  async createAnalysis(analysisData) {
    const { verification, root_cause, defect_type, action } = analysisData;

    try {
      const result = await db.query(
        `INSERT INTO analysis (verification, root_cause, defect_type, action) 
         VALUES ($1, $2, $3, $4 ) RETURNING *`,
        [verification, root_cause, defect_type, action]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error in createAnalysis:", error);
      throw new Error("Database query failed");
    }
  },

  async getReturnById(id) {
    try {
      const result = await db.query(
        `
        SELECT
          r.retur_id,
          r.retur_no,
          r.customer_name,
          r.country,
          r.product_id,
          r.qty,
          r.serial_no,
          r.issue,
          r.analyse_id,
          a.analyze_id AS analysis_id,
          a.root_cause,
          a.defect_type,
          a.action,
          a.verification,
          p.product_name,
          f.family_name,
          s.sector_name
        FROM retur r
        LEFT JOIN analysis a ON r.analyse_id = a.analyze_id
        LEFT JOIN products p ON r.product_id = p.product_id
        LEFT JOIN families f ON p.family_id = f.family_id
        LEFT JOIN sectors s ON f.sector_id = s.sector_id
        WHERE r.retur_id = $1
      `,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const returnData = result.rows[0];

      // Format the response object
      return {
        retur_id: returnData.retur_id,
        retur_no: returnData.retur_no,
        customer_name: returnData.customer_name,
        country: returnData.country,
        products: {
          product_id: returnData.product_id,
          product_name: returnData.product_name,
          families: {
            family_name: returnData.family_name,
            sectors: {
              sector_name: returnData.sector_name,
            },
          },
        },
        qty: returnData.qty,
        serial_no: returnData.serial_no,
        issue: returnData.issue,
        analysis: {
          analyze_id: returnData.analysis_id,
          root_cause: returnData.root_cause,
          defect_type: returnData.defect_type,
          action: returnData.action,
          verification: returnData.verification,
        },
      };
    } catch (error) {
      console.error("Error in getReturnById:", error);
      throw new Error("Database query failed");
    }
  },

  async beginTransaction() {
    try {
      await db.query("BEGIN");
    } catch (error) {
      console.error("Error in beginTransaction:", error);
      throw new Error("Failed to begin transaction");
    }
  },

  async commitTransaction() {
    try {
      await db.query("COMMIT");
    } catch (error) {
      console.error("Error in commitTransaction:", error);
      throw new Error("Failed to commit transaction");
    }
  },

  async rollbackTransaction() {
    try {
      await db.query("ROLLBACK");
    } catch (error) {
      console.error("Error in rollbackTransaction:", error);
      throw new Error("Failed to rollback transaction");
    }
  },
};

module.exports = returModels;
