const db = require("../../database");

const productModels = {
  /// SECTORS
  async sectorFindAll() {
    const result = await db.query("SELECT * FROM sectors");
    return result.rows;
  },

  async createSectors(sector) {
    const { sector_name } = sector;
    const result = await db.query("INSERT INTO sectors (sector_id, sector_name) VALUES ($1, $1) RETURNING *", [sector_name]);
    return result.rows[0];
  },

  async getSectorById(sector_id) {
    const query = "SELECT * FROM sectors WHERE sector_id = $1";
    const values = [sector_id];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async findSectorsByIds(ids) {
    if (!ids.length) return [];

    try {
      const [rows] = await db.query("SELECT * FROM sectors WHERE id IN (?)", [ids]);
      return rows;
    } catch (error) {
      throw new Error("Error fetching sectors: " + error.message);
    }
  },

  async deleteSectorById(sector_id) {
    const query = "DELETE FROM sectors WHERE sector_id = $1";
    const values = [sector_id];
    return await db.query(query, values);
  },

  /// FAMILIES
  async familyFindAll() {
    const result = await db.query("SELECT * FROM families");
    return result.rows;
  },

  async createFamilies(family) {
    const { family_name, sector_id } = family;
    const result = await db.query("INSERT INTO families (family_id, family_name, sector_id) VALUES ($1, $1, $2) RETURNING *", [family_name, sector_id]);
    return result.rows[0];
  },

  async getFamilyById(family_id) {
    const query = "SELECT * FROM families WHERE family_id = $1";
    const values = [family_id];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async updateFamily(familyId, familyData) {
    const { family_name, sector_id } = familyData;
    try {
      const result = await db.query("UPDATE families SET family_name = $1, sector_id = $2 WHERE family_id = $3 RETURNING *", [family_name, sector_id, familyId]);
      return result.rows[0];
    } catch (err) {
      throw new Error("Error updating family: " + err.message);
    }
  },

  async getFamiliesBySector(sector_id) {
    try {
      const result = await db.query("SELECT * FROM families WHERE sector_id = $1", [sector_id]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  async deleteFamilyById(family_id) {
    const query = "DELETE FROM families WHERE family_id = $1";
    const values = [family_id];
    return await db.query(query, values);
  },

  async productFindAll() {
    const query = `
        SELECT 
            p.product_id,
            p.product_name,
            f.family_id,
            f.family_name,
            s.sector_id,
            s.sector_name,
            p.created_by,
            p.created_at
        FROM products p
        JOIN families f ON p.family_id = f.family_id
        JOIN sectors s ON f.sector_id = s.sector_id;
    `;
    const result = await db.query(query);

    // Format the result to include created_by and created_at
    const formattedResult = result.rows.map((row) => ({
      product_id: row.product_id,
      product_name: row.product_name,
      family: {
        family_id: row.family_id,
        family_name: row.family_name,
      },
      sector: {
        sector_id: row.sector_id,
        sector_name: row.sector_name,
      },
      created_by: row.created_by, // Include created_by field
      created_at: row.created_at, // Include created_at field
    }));

    return formattedResult;
  },

  async createProduct(product) {
    const { product_id, product_name, family_id, created_by } = product;
    const result = await db.query("INSERT INTO products (product_id, product_name, family_id, created_by, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *", [product_id, product_name, family_id, created_by]);
    return result.rows[0];
  },

  async getProductById(product_id) {
    try {
      // Ambil data produk
      const productResult = await db.query(`SELECT * FROM products WHERE product_id = $1`, [product_id]);

      if (productResult.rowCount === 0) {
        return null;
      }

      const product = productResult.rows[0];

      // Ambil data keluarga berdasarkan family_id dari produk
      const familyResult = await db.query(`SELECT * FROM families WHERE family_id = $1`, [product.family_id]);

      const family = familyResult.rowCount > 0 ? familyResult.rows[0] : null;

      // Ambil data sektor berdasarkan sector_id dari keluarga
      const sectorResult = family ? await db.query(`SELECT * FROM sectors WHERE sector_id = $1`, [family.sector_id]) : { rows: [], rowCount: 0 };

      const sector = sectorResult.rowCount > 0 ? sectorResult.rows[0] : null;

      // Format data produk dengan informasi family dan sector
      const formattedProduct = {
        ...product,
        family: family
          ? {
              family_id: family.family_id,
              family_name: family.family_name,
              sector: sector
                ? {
                    sector_id: sector.sector_id,
                    sector_name: sector.sector_name,
                  }
                : null,
            }
          : null,
      };

      return formattedProduct;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  async updateProduct(product_id, updatedData) {
    const { product_name, family_id, created_by } = updatedData;

    // Query untuk memperbarui data produk
    const result = await db.query(
      `UPDATE products
         SET product_name = $1, family_id = $2, created_by = $3, created_at = NOW()
         WHERE product_id = $4
         RETURNING *`,
      [product_name, family_id, created_by, product_id]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  },
  async deleteProduct(product_id) {
    const result = await db.query(`DELETE FROM products WHERE product_id = $1 RETURNING *`, [product_id]);
    return result.rowCount > 0;
  },
};

module.exports = productModels;
