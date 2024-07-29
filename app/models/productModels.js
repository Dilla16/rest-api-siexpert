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
    if (!ids.length) return []; // Return empty array if no IDs are provided

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
    const query = "SELECT * FROM products";
    const result = await db.query(query);
    return result.rows;
  },

  async createProduct(product) {
    const { product_name, family_id, created_by } = product;
    const result = await db.query("INSERT INTO products (product_name, family_id, created_by, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *", [product_name, family_id, created_by]);
    return result.rows[0];
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
};

module.exports = productModels;
