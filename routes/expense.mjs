import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const expenseRouter = Router();

expenseRouter.post("/", async (req, res) => {
  const { user_id, category_id, title, amount, date_of_expense, note } =
    req.body;

  if (!user_id || !category_id || !title || !amount || !date_of_expense) {
    return res.status(400).json({
      message: "Could not create expense due to missing required fields",
    });
  }

  try {
    await connectionPool.query(
      `INSERT INTO expense (user_id, category_id, title, amount, date_of_expense, note) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user_id, category_id, title, amount, date_of_expense, note]
    );

    return res.status(201).json({ message: "Expense created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

expenseRouter.get("/", async (req, res) => {
  const { user_id } = req.body;
  const { category, startdate, enddate } = req.query;
  let result;

  let query = `SELECT * FROM expense WHERE user_id = $1`;
  let params = [user_id];

  if (category) {
    query += ` AND category_id = $${params.length + 1}`;
    params.push(category);
  }

  if (startdate) {
    query += ` AND date_of_expense >= $${params.length + 1}`;
    params.push(startdate);
  }

  if (enddate) {
    query += ` AND date_of_expense <= $${params.length + 1}`;
    params.push(enddate);
  }

  try {
    result = await connectionPool.query(query, params);
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
  if (result.rowCount === 0) {
    return res.status(200).json({
      message: "Fetcing data successfully, no expense found in this period",
    });
  }
  return res
    .status(200)
    .json({ message: "Fetcing data successfully", data: result.rows });
});

expenseRouter.delete("/", async (req, res) => {
  const { user_id, expense_id } = req.body;

  try {
    const result = await connectionPool.query(
      `DELETE FROM expense WHERE user_id = $1 AND expense_id = $2`,
      [user_id, expense_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Expense not found." });
    }
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
  return res.status(200).json({ message: "Deleted expense successfully" });
});

expenseRouter.put("/", async (req, res) => {
  const {
    expense_id,
    user_id,
    category_id,
    title,
    amount,
    date_of_expense,
    note,
  } = req.body;

  if (
    !expense_id ||
    !user_id ||
    !category_id ||
    !title ||
    !amount ||
    !date_of_expense
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const result = await connectionPool.query(
      `UPDATE expense
       SET category_id = $2, title = $3, amount = $4, date_of_expense = $5, note = $6
       WHERE user_id = $1 AND expense_id = $7`,
      [user_id, category_id, title, amount, date_of_expense, note, expense_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.status(200).json({ message: "Expense updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

expenseRouter.get("/report", async (req, res) => {
  const { user_id } = req.body;
  const { startdate, enddate } = req.query;
  let result;

  let query = `SELECT category_id,SUM(amount) AS total_expense  FROM expense WHERE user_id = $1`;
  let params = [user_id];

  if (startdate) {
    query += ` AND date_of_expense >= $${params.length + 1}`;
    params.push(startdate);
  }

  if (enddate) {
    query += ` AND date_of_expense <= $${params.length + 1}`;
    params.push(enddate);
  }
  query += ` GROUP BY category_id`;
  try {
    console.log(query, params);

    result = await connectionPool.query(query, params);
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
  if (result.rowCount === 0) {
    return res.status(200).json({
      message: "Fetcing data successfully, no expense found in this period",
    });
  }
  return res
    .status(200)
    .json({ message: "Fetcing data successfully", data: result.rows });
});

export default expenseRouter;
