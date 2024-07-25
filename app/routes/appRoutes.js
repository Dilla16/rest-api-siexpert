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
router.get("/users/:sesa", UserController.getUserBySesa);
router.post("/users", UserController.create);
router.delete("/users/:sesa", UserController.deleteBySesa);
router.put("/users/:sesa", UserController.update);

// sectors
router.get("/sectors", productControllers.getAllSectors);
router.post("/sectors", productControllers.createSector);

// families
router.get("/families", productControllers.getAllFamilies);
router.post("/families", productControllers.createFamily);

//products
router.get("/products", productControllers.getAllProducts);
router.get("/product/:id", productControllers.getProductById);
router.post("/products", productControllers.createProduct);

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
