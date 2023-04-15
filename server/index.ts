import express from "express";
import { Pool } from "pg";

const pool = new Pool({
  user: "sunyupei",
  host: "localhost",
  database: "food_delivery",
  password: "password",
  port: 5432,
});

const app = express();
app.use(express.json());

// List all restaurants that are open at a certain datetime
app.get("/restaurants/open/:datetime", async (req, res) => {
  const datetime = req.params.datetime;
  try {
    const { rows } = await pool.query(`
      SELECT restaurants.*
      FROM restaurants
      JOIN restaurant_hours ON restaurants.id = restaurant_hours.restaurant_id
      WHERE EXTRACT(DOW FROM '${datetime}'::timestamp) = restaurant_hours.day_of_week
        AND '${datetime}'::time BETWEEN restaurant_hours.opening_time AND restaurant_hours.closing_time
    `);
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// List top y restaurants that have more or less than x number of dishes within a price range, ranked alphabetically.
app.get("/restaurants/top", async (req, res) => {
  const { lessThan, moreThan, priceFrom, priceTo, sortBy } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT restaurants.*, COUNT(dishes.*) AS dish_count
      FROM restaurants
      JOIN dishes ON restaurants.id = dishes.restaurant_id
      WHERE price BETWEEN ${priceFrom} AND ${priceTo}
      GROUP BY restaurants.id
      HAVING COUNT(dishes.*) ${lessThan ? "<" : ">"} ${
      lessThan || moreThan || 0
    }
      ORDER BY ${sortBy || "restaurant_name"}
    `);
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Search for restaurants or dishes by name, ranked by relevance to search term
app.get("/search/:term", async (req, res) => {
  const term = req.params.term;
  try {
    const { rows } = await pool.query(`
      SELECT restaurants.*, ts_rank_cd(to_tsvector('english', restaurant_name), plainto_tsquery('english', '${term}')) AS restaurant_rank,
        dishes.*, ts_rank_cd(to_tsvector('english', dish_name), plainto_tsquery('english', '${term}')) AS dish_rank
      FROM restaurants
      JOIN dishes ON restaurants.id = dishes.restaurant_id
      WHERE to_tsvector('english', restaurant_name) @@ plainto_tsquery('english', '${term}')
        OR to_tsvector('english', dish_name) @@ plainto_tsquery('english', '${term}')
      ORDER BY GREATEST(ts_rank_cd(to_tsvector('english', restaurant_name), plainto_tsquery('english', '${term}')),
        ts_rank_cd(to_tsvector('english', dish_name), plainto_tsquery('english', '${term}'))) DESC
    `);
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
