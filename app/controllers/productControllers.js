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
      const products = await productModels.productFindAll();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getProductById(req, res) {
    const { id } = req.params;
    try {
      const productData = await productModels.getProductById(id);
      if (productData) {
        // Format the data to match the required structure
        const formattedProduct = {
          product_id: productData.product_id,
          product_name: productData.product_name || null,
          families: {
            family_id: productData.family_id || null,
            family_name: productData.family_name || null,
            sectors: {
              sector_id: productData.sector_id || null,
              sector_name: productData.sector_name || null,
            },
          },
        };
        res.status(200).json({ products: formattedProduct });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      console.error("Error in getProductById:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
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
