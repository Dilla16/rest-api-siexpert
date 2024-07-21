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
router.post("/users", UserController.create);
router.delete("/users/:sesa", UserController.deleteBySesa);
router.put("/users/:sesa", authMiddleware, UserController.update);

//products
router.get("/sectors", productControllers.getAllSectors);
router.post("/sectors", productControllers.createSector);
router.get("/families", productControllers.getAllFamilies);
router.post("/families", productControllers.createFamily);
router.get("/products", productControllers.getAllProducts);
router.post("/products", productControllers.createProduct);

//return
router.get("/returns", returControllers.getAllReturns);
router.post("/returns", returControllers.createReturn);
router.get("/returns/:id", returControllers.getReturnById);
router.put("/returns/:id", returControllers.updateReturnById);
router.delete("/returns/:id", returControllers.deleteReturnById);

//analyze
router.get("/analyses", analyzeControllers.getAllAnalyses);
router.get("/analyses/:id", analyzeControllers.getAnalysisById);
// router.post("/analyses", analyzeControllers.createAnalysis);
router.put("/analyses/:id", analyzeControllers.updateAnalysisById);
router.delete("/analyses/:id", analyzeControllers.deleteAnalysisById);

module.exports = router;
