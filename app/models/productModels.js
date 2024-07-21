const db = require("../../database");

const productModels = {
  async sectorFindAll() {
    const result = await db.query("SELECT * FROM sectors");
    return result.rows;
  },

  async createSectors(sector) {
    const { sector_name, created_by } = sector;
    const result = await db.query("INSERT INTO sectors (sector_name, created_by, created_at) VALUES ($1, $2, NOW()) RETURNING *", [sector_name, created_by]);
    return result.rows[0];
  },

  async familyFindAll() {
    const result = await db.query("SELECT * FROM families");
    return result.rows;
  },

  async createFamilies(family) {
    const { family_name, sector_id, created_by } = family;
    const result = await db.query("INSERT INTO families (family_name, sector_id, created_by, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *", [family_name, sector_id, created_by]);
    return result.rows[0];
  },

  async productFindAll() {
    try {
      const [rows] = await db.query("SELECT * FROM products");
      return rows;
    } catch (error) {
      throw new Error("Error fetching products: " + error.message);
    }
  },

  async createProduct(product) {
    const { reference_name, sector_id, family_id, created_by } = product;
    const result = await db.query("INSERT INTO products (reference_name, sector_id, family_id, created_by, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *", [reference_name, sector_id, family_id, created_by]);
    return result.rows[0];
  },

  async findFamiliesByIds(ids) {
    if (!ids.length) return []; // Return empty array if no IDs are provided

    try {
      const [rows] = await db.query("SELECT * FROM families WHERE id IN (?)", [ids]);
      return rows;
    } catch (error) {
      throw new Error("Error fetching families: " + error.message);
    }
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
};

module.exports = productModels;
