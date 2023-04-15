import express, { Router } from "express";
import { purchaseDish } from "../controllers/userController";

const router: Router = express.Router();

router.post("/:userId/purchase/:dishId", purchaseDish);

export default router;
