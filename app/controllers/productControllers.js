const productModels = require("../models/productModels");

const productControllers = {
  /// SECTORS
  async getAllSectors(req, res) {
    try {
      const sectors = await productModels.sectorFindAll();
      res.status(200).json(sectors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSectorById(req, res) {
    try {
      const { sector_id } = req.params;
      const sectors = await productModels.getSectorById(sector_id);
      if (!sectors) {
        return res.status(404).json({ message: "Sector not found" });
      }
      res.json(sectors);
    } catch (error) {
      console.error("Error fetching sector:", error);
      res.status(500).json({ message: "Internal Server Error" });
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

  async deleteSector(req, res) {
    const { sector_id } = req.params;

    if (!sector_id) {
      return res.status(400).json({ error: "sector is required" });
    }

    try {
      const result = await productModels.deleteSectorById(sector_id);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Sector not found." });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error.message || error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  ///FAMILIES
  async getAllFamilies(req, res) {
    try {
      const families = await productModels.familyFindAll();
      res.status(200).json(families);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getFamilyById(req, res) {
    try {
      const { family_id } = req.params;
      const family = await productModels.getFamilyById(family_id);
      if (!family) {
        return res.status(404).json({ message: "Family not found" });
      }
      res.json(family);
    } catch (error) {
      console.error("Error fetching family:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async getFamiliesBySector(req, res) {
    const { sector_id } = req.params;

    if (!sector_id) {
      return res.status(400).json({ error: "Sector ID is required" });
    }

    try {
      const families = await productModels.getFamiliesBySector(sector_id);
      res.json(families);
    } catch (error) {
      console.error("Error fetching families:", error);
      res.status(500).json({ error: "Internal server error" });
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

  async editFamily(req, res) {
    const { family_id } = req.params;
    const familyData = req.body;

    try {
      const updatedFamily = await productModels.updateFamily(family_id, familyData);
      if (updatedFamily) {
        res.status(200).json(updatedFamily);
      } else {
        res.status(404).json({ error: "Family not found" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deleteFamily(req, res) {
    const { family_id } = req.params;

    if (!family_id) {
      return res.status(400).json({ error: "Family ID is required" });
    }

    try {
      const result = await productModels.deleteFamilyById(family_id);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Family not found." });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting family:", error.message || error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  /// PRODUCTS
  async getAllProducts(req, res) {
    try {
      const products = await productModels.productFindAll();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getProductById(req, res) {
    const { product_id } = req.params;

    try {
      const product = await productModels.getProductById(product_id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error in getProductById controller:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async getProductsByFamily(req, res) {
    const { family_id } = req.params;

    try {
      const products = await productModels.getProductsByFamily(family_id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by family:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async createProduct(req, res) {
    try {
      const { product_id, product_name, family_id } = req.body;
      const created_by = req.user.sesa;

      const productData = {
        product_id,
        product_name,
        family_id,
        created_by,
      };

      const product = await productModels.createProduct(productData);

      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async updateProduct(req, res) {
    try {
      const { product_id } = req.params;
      const updatedData = req.body;

      if (!updatedData.product_name || !updatedData.family_id || !updatedData.created_by) {
        return res.status(400).json({ error: "Product name, family ID, and created by fields are required" });
      }

      const updatedProduct = await productModels.updateProduct(product_id, updatedData);
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  async deleteProduct(req, res) {
    try {
      const { product_id } = req.params; // Ambil ID produk dari URL params

      const wasDeleted = await productModels.deleteProduct(product_id);
      if (!wasDeleted) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = productControllers;
