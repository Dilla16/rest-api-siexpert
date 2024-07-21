const productModels = require("../models/productModels");

const productControllers = {
  async getAllSectors(req, res) {
    try {
      const sectors = await productModels.sectorFindAll();
      res.status(200).json(sectors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createSector(req, res) {
    try {
      const sector = await productModels.createSectors(req.body);
      res.status(201).json(sector);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllFamilies(req, res) {
    try {
      const families = await productModels.familyFindAll();
      res.status(200).json(families);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createFamily(req, res) {
    try {
      const family = await productModels.createFamilies(req.body);
      res.status(201).json(family);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllProducts(req, res) {
    try {
      // Fetch all products
      const products = await productModels.productFindAll();

      // Extract unique family IDs and sector IDs from products
      const familyIds = [...new Set(products.map((product) => product.family_id))];
      const sectorIds = [...new Set(products.map((product) => product.sector_id))];

      // Fetch families by family IDs
      const families = await productsModels.findFamiliesByIds(familyIds);

      // Fetch sectors by sector IDs
      const sectors = await productsModels.findSectorsByIds(sectorIds);

      // Map family and sector data by their IDs for quick lookup
      const familyMap = families.reduce((acc, family) => {
        acc[family.id] = family;
        return acc;
      }, {});

      const sectorMap = sectors.reduce((acc, sector) => {
        acc[sector.id] = sector;
        return acc;
      }, {});

      // Add family and sector details to products
      const enrichedProducts = products.map((product) => ({
        ...product,
        family_name: familyMap[product.family_id]?.name || "Unknown",
        sector_name: sectorMap[product.sector_id]?.name || "Unknown",
      }));

      res.status(200).json(enrichedProducts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createProduct(req, res) {
    try {
      const product = await productModels.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = productControllers;
