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
    const { reference_name, sector_id, family_id, created_by } = product;
    const result = await db.query("INSERT INTO products (reference_name, sector_id, family_id, created_by, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *", [reference_name, sector_id, family_id, created_by]);
    return result.rows[0];
  },
};

module.exports = productModels;
