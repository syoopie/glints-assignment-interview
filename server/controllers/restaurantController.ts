import { Request, Response } from "express";
import moment from "moment";
import pool from "../db";

export const getOpenRestaurants = async (req: Request, res: Response) => {
  const { datetime } = req.query;
  try {
    const inputDateTime = moment(datetime?.toString(), "DD/MM/YYYY hh:mm A");
    const dayOfWeek = (inputDateTime.day() + 6) % 7;
    const openingTime = inputDateTime.format("HH:mm:ss");
    const { rows } = await pool.query(
      `SELECT * FROM restaurants 
       INNER JOIN restaurant_hours ON restaurants.id = restaurant_hours.restaurant_id 
       WHERE 
         day_of_week = $1 AND (
           ($2::TIME WITH TIME ZONE <= closing_time AND $2::TIME WITH TIME ZONE >= opening_time) OR
           ($2::TIME WITH TIME ZONE >= opening_time AND closing_time < opening_time AND day_of_week = ($1 + 1) % 7)
         )`,
      [dayOfWeek, openingTime]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving open restaurants");
  }
};

export const searchRestaurants = async (req: Request, res: Response) => {
  const { q } = req.query;
  try {
    const { rows } = await pool.query(
      `SELECT 
         restaurants.id as restaurant_id,
         restaurants.restaurant_name, 
         dishes.dish_name, 
         ts_rank_cd(
           to_tsvector(restaurants.restaurant_name || ' ' || dishes.dish_name), 
           plainto_tsquery($1)
         ) as relevance 
       FROM restaurants 
       LEFT JOIN dishes ON restaurants.id = dishes.restaurant_id 
       WHERE 
         restaurants.restaurant_name ILIKE '%' || $1 || '%' OR 
         dishes.dish_name ILIKE '%' || $1 || '%'
       ORDER BY relevance DESC`,
      [q]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error searching restaurants");
  }
};

export const getRankedRestaurants = async (req: Request, res: Response) => {
  const { more_or_less, x, min_price, max_price } = req.query;

  // Determine the comparison operator to use in the SQL query
  const comparisonOperator = more_or_less === "more" ? ">" : "<";

  console.log(more_or_less, x, min_price, max_price);

  try {
    const { rows } = await pool.query(
      `SELECT restaurants.restaurant_name, COUNT(dishes.id) AS dish_count
       FROM restaurants 
       INNER JOIN dishes ON restaurants.id = dishes.restaurant_id 
       WHERE dishes.price BETWEEN $1 AND $2
       GROUP BY restaurants.id
       HAVING COUNT(dishes.id) ${comparisonOperator} $3
       ORDER BY restaurant_name ASC
       LIMIT 10`,
      [min_price, max_price, x]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving restaurants");
  }
};
