const db = require("../../database");

async function beginTransaction() {
  await db.query("BEGIN");
}

async function commitTransaction() {
  await db.query("COMMIT");
}

async function rollbackTransaction() {
  await db.query("ROLLBACK");
}

const returModels = {
  async beginTransaction() {
    await beginTransaction();
  },

  async commitTransaction() {
    await commitTransaction();
  },

  async rollbackTransaction() {
    await rollbackTransaction();
  },

  async getReturnsByDepartments(departments) {
    const query = `
      SELECT 
        r.retur_id,
        r.retur_no,
        r.customer_name,
        r.country,
        r.qty,
        r.serial_no,
        r.issue,
        r.product_id AS return_product_id,
        rp.product_name AS return_product_name,
        p.product_id,
        p.product_name,
        f.family_name,
        s.sector_name,
        r.analyse_id,
        a.analyze_id AS analysis_id,
        a.root_cause,
        a.defect_type,
        a.action,
        a.verification
      FROM 
        retur r
      JOIN 
        products rp ON r.product_id = rp.product_id
      JOIN 
        products p ON r.product_id = p.product_id
      JOIN 
        families f ON p.family_id = f.family_id
      JOIN 
        sectors s ON f.sector_id = s.sector_id
      LEFT JOIN 
        analysis a ON r.analyse_id = a.analyze_id
      WHERE 
        s.sector_name = ANY($1::text[])
    `;

    try {
      const result = await db.query(query, [departments]);

      const formattedResult = result.rows.map((row) => ({
        returnData: {
          retur_id: row.retur_id,
          retur_no: row.retur_no,
          customer_name: row.customer_name,
          country: row.country,
          product_name: row.return_product_name,
          qty: row.qty,
          serial_no: row.serial_no,
          issue: row.issue,
          products: {
            product_id: row.product_id,
            product_name: row.product_name,
            families: {
              family_name: row.family_name,
              sectors: {
                sector_name: row.sector_name,
              },
            },
          },
          analysis: {
            analyze_id: row.analysis_id,
            root_cause: row.root_cause,
            defect_type: row.defect_type,
            action: row.action,
            verification: row.verification,
          },
        },
      }));

      return formattedResult;
    } catch (error) {
      console.error("Error in getReturnsByDepartments:", error.message || error);
      throw new Error("Database query failed");
    }
  },

  async checkSerialNo(serial_no) {
    try {
      const result = await db.query("SELECT 1 FROM retur WHERE serial_no = $1 LIMIT 1", [serial_no]);
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error in checkSerialNo:", error.message || error);
    }
  },

  async getLastReturId() {
    try {
      const result = await db.query("SELECT retur_id FROM retur ORDER BY retur_id DESC LIMIT 1");
      return result.rows[0] ? result.rows[0].retur_id : null;
    } catch (error) {
      console.error("Error in getLastReturId:", error.message || error);
      throw new Error("Database query failed");
    }
  },

  async generateNextReturId() {
    const lastReturId = await this.getLastReturId();
    let nextId = 1;

    if (lastReturId) {
      const lastNumber = parseInt(lastReturId.replace("RET", ""), 10);
      nextId = lastNumber + 1;
    }

    return `RET${nextId.toString().padStart(5, "0")}`;
  },

  async createReturn(data) {
    const newReturId = await this.generateNextReturId();

    try {
      const result = await db.query(
        `INSERT INTO retur (retur_id, retur_no, customer_name, country, product_id, qty, serial_no, issue, analyse_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING retur_id, retur_no, customer_name, country, product_id, qty, serial_no, issue`,
        [newReturId, data.retur_no, data.customer_name, data.country, data.product_id, data.qty, data.serial_no, data.issue, data.analyse_id]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error in create Return:", error.message || error);
      throw new Error("Database query failed");
    }
  },

  async getReturnWithDetails(id) {
    try {
      const result = await db.query(
        `
        SELECT r.retur_id, r.retur_no, r.customer_name, r.country, r.qty, r.serial_no, r.issue, r.analyse_id,
               p.product_id, p.product_name,
               f.family_name,
               s.sector_name,
               a.analyze_id AS analysis_id, a.root_cause, a.defect_type, a.action, a.verification
        FROM retur r
        JOIN products p ON r.product_id = p.product_id
        LEFT JOIN families f ON p.family_id = f.family_id
        LEFT JOIN sectors s ON f.sector_id = s.sector_id
        LEFT JOIN analysis a ON r.analyse_id = a.analyze_id
        WHERE r.retur_id = $1
      `,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const returnData = result.rows[0];

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
      console.error("Error in getReturnWithDetails:", error.message || error);
      throw new Error("Database query failed");
    }
  },

  async updateReturnById(id, retur) {
    const { retur_no, customer_name, country, product_id, serial_no, issue } = retur;

    try {
      const result = await db.query(
        `UPDATE retur 
         SET retur_no = $1, customer_name = $2, country = $3, product_id = $4, serial_no = $5, issue = $6
         WHERE retur_id = $7 RETURNING *`,
        [retur_no, customer_name, country, product_id, serial_no, issue, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error in updateReturnById:", error.message || error);
      throw new Error("Database query failed");
    }
  },

  async deleteReturnTransaction(id, sesa) {
    try {
      await db.query("BEGIN");

      const result = await db.query("SELECT * FROM retur WHERE retur_id = $1", [id]);
      if (result.rows.length === 0) {
        await db.query("ROLLBACK");
        return null;
      }

      const retur = result.rows[0];

      await db.query("DELETE FROM retur WHERE retur_id = $1", [id]);

      await db.query(
        `INSERT INTO history (analyse_id, created_at, status, created_by) 
         VALUES ($1, $2, $3, $4)`,
        [retur.analyse_id, new Date(), "deleted", sesa]
      );

      await db.query("COMMIT");
      return retur;
    } catch (error) {
      await db.query("ROLLBACK");
      console.error("Error in deleteReturnTransaction:", error.message || error);
      throw new Error("Database transaction failed");
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
      console.error("Error in createAnalysis:", error.message || error);
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
          a.location,
          a.category,
          a.images,
          a.caption,
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

      return {
        retur_id: returnData.retur_id,
        retur_no: returnData.retur_no,
        customer_name: returnData.customer_name,
        country: returnData.country,
        qty: returnData.qty,
        serial_no: returnData.serial_no,
        issue: returnData.issue,
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
        analysis: {
          analyze_id: returnData.analysis_id,
          root_cause: returnData.root_cause,
          defect_type: returnData.defect_type,
          action: returnData.action,
          verification: returnData.verification,
          location: returnData.location,
          category: returnData.category,
          images: returnData.images, // Assuming images is a JSON or text field containing image data
          caption: returnData.caption,
        },
      };
    } catch (error) {
      console.error("Error in getReturnById:", error.message || error);
      throw new Error("Database query failed");
    }
  },
  async getReturIdByAnalyzeId(analyze_id) {
    try {
      const result = await db.query(
        `
        SELECT retur_id 
        FROM retur 
        WHERE analyse_id = $1
        `,
        [analyze_id]
      );

      if (result.rows.length === 0) {
        return null; // Jika tidak ditemukan retur_id
      }

      return result.rows[0]; // Mengembalikan retur_id yang ditemukan
    } catch (error) {
      console.error("Error in getReturIdByAnalyzeId:", error.message || error);
      throw new Error("Database query failed");
    }
  },
};

module.exports = returModels;
