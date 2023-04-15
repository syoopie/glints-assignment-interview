import express from "express";
import { getTransactions } from "../controllers/transactionController";

const router = express.Router();

router.get("/:userId", getTransactions);

export default router;
