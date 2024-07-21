const productModels = require("../models/productModels");

exports.getAllSectors = async (req, res) => {
  try {
    const sectors = await productModels.sectorFindAll();
    res.status(200).json(sectors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSector = async (req, res) => {
  try {
    const sector = await productModels.createSectors(req.body);
    res.status(201).json(sector);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllFamilies = async (req, res) => {
  try {
    const families = await productModels.familyFindAll();
    res.status(200).json(families);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createFamily = async (req, res) => {
  try {
    const family = await productModels.createFamilies(req.body);
    res.status(201).json(family);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productModels.productFindAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await productModels.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
