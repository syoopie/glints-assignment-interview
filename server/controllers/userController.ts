import { Request, Response } from "express";
import pool from "../db";

export const purchaseDish = async (req: Request, res: Response) => {
  const { dishId, quantity, userId } = req.body;

  try {
    await pool.query("BEGIN"); // Start transaction

    // Get dish information and lock the row to prevent race conditions
    const { rows } = await pool.query(
      "SELECT * FROM dishes WHERE id = $1 FOR UPDATE",
      [dishId]
    );
    const dish = rows[0];

    // Get user information
    const { rows: userRows } = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );
    const user = userRows[0];

    // Check if user has enough balance
    const totalPrice = dish.price * quantity;
    if (user.balance < totalPrice) {
      throw new Error("Insufficient balance");
    }

    // Update user balance
    const updatedBalance = user.balance - totalPrice;
    await pool.query("UPDATE users SET balance = $1 WHERE id = $2", [
      updatedBalance,
      userId,
    ]);

    // Create new order
    await pool.query(
      "INSERT INTO orders (user_id, dish_id, quantity, total_price) VALUES ($1, $2, $3, $4)",
      [userId, dishId, quantity, totalPrice]
    );

    // Update restaurant sales
    const updatedSales = dish.sales + quantity;
    await pool.query("UPDATE dishes SET sales = $1 WHERE id = $2", [
      updatedSales,
      dishId,
    ]);

    await pool.query("COMMIT"); // Commit transaction

    res.json({ message: "Purchase successful" });
  } catch (error) {
    await pool.query("ROLLBACK"); // Rollback transaction on error
    console.error(error);
    res.status(500).send("Error processing purchase");
  }
};
