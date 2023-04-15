import { Request, Response } from "express";
import pool from "../db";

export const getOpenRestaurants = async (req: Request, res: Response) => {
  const { datetime } = req.query;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM restaurants 
       INNER JOIN restaurant_hours ON restaurants.id = restaurant_hours.restaurant_id 
       WHERE $1::TIMESTAMP WITH TIME ZONE BETWEEN opening_time AND closing_time`,
      [datetime]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving open restaurants");
  }
};

export const getRankedRestaurants = async (req: Request, res: Response) => {};

export const searchRestaurants = async (req: Request, res: Response) => {};
