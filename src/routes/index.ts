import express, { Router } from "express";
import path from "path";
import clientRoutes from "./clients";
import addressesRoutes from "./addresses";
import productRoutes from "./products";

const router = Router();
router.use(express.json());

router.use("/clients", clientRoutes);
router.use("/addresses", addressesRoutes);
router.use("/products", productRoutes);

export default router;