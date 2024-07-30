const express = require("express");
const UserController = require("../controllers/userControllers");
const productControllers = require("../controllers/productControllers");
const returControllers = require("../controllers/returControllers");
const analyzeControllers = require("../controllers/analyzeControllers");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/login", UserController.login);

//users
router.get("/profile", UserController.getProfile);
router.get("/users", UserController.getAll);
router.get("/users/:sesa", authMiddleware, UserController.getUserBySesa);
router.post("/users", UserController.create);
router.delete("/users/:sesa", UserController.deleteBySesa);
router.put("/users/:sesa", UserController.update);

// sectors
router.get("/sectors", productControllers.getAllSectors);
router.get("/sectors/:sector_id", productControllers.getSectorById);
router.post("/sectors", productControllers.createSector);
router.delete("/sectors/:sector_id", productControllers.deleteSector);

// families
router.get("/families", productControllers.getAllFamilies);
router.get("/families/:sector_id", productControllers.getFamiliesBySector);
router.post("/families", productControllers.createFamily);
router.get("/families/:family_id", productControllers.getFamilyById);
router.delete("/families/:family_id", productControllers.deleteFamily);
router.put("/families/:family_id", productControllers.editFamily);

//products
router.get("/products", productControllers.getAllProducts);
router.get("/products/:product_id", productControllers.getProductById);
router.post("/products", authMiddleware, productControllers.createProduct);
router.put("/products/:product_id", productControllers.updateProduct);
router.get("/products/family/:family_id", productControllers.getProductsByFamily);
router.delete("/products/:product_id", productControllers.deleteProduct);

//return
router.get("/returns", returControllers.getAllReturns);
router.post("/returns", returControllers.createReturn);
router.get("/returns/:id", returControllers.getReturnById);
router.put("/returns/:id", returControllers.updateReturnById);
router.delete("/returns/:id", returControllers.deleteReturnById);

// //analyze
router.get("/analysis", analyzeControllers.getAllAnalysis);
router.get("/analysis/:id", analyzeControllers.getAnalysisById);
router.put("/analysis/:id", analyzeControllers.updateAnalysisById);
router.delete("/analysis/:id", analyzeControllers.deleteAnalysisById);

// // status analysis
// router.post("/retur/analysis/assign", analyzeControllers.assignAnalysis);
// router.post("/retur/analysis/save", analyzeControllers.saveAnalysis);
// router.post("/retur/analysis/submitted", analyzeControllers.submitAnalysis);
// router.post("/retur/analysis/decision", analyzeControllers.decisionAnalysis);

module.exports = router;
