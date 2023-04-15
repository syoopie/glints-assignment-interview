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
