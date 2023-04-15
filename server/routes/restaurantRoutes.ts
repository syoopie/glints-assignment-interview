import express from "express";
import {
  getOpenRestaurants,
  getRankedRestaurants,
  searchRestaurants,
} from "../controllers/restaurantController";

const router = express.Router();

router.get("/open", getOpenRestaurants);
router.get("/ranked", getRankedRestaurants);
router.get("/search", searchRestaurants);

export default router;
