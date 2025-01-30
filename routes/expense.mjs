import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const expenseRouter = Router();
/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     description: Create a new expense record
 *     tags:
 *       - Expense Management 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               date_of_expense:
 *                 type: string
 *                 format: date
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal Server Error
 */
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


/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Get all expenses for a user
 *     description: Retrieve all expenses for a user, with optional filters by category and date range
 *     tags:
 *       - Expense Management 
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startdate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: enddate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal Server Error
 */
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


/**
 * @swagger
 * /expenses:
 *   delete:
 *     summary: Delete an expense
 *     description: Delete an expense record by user_id and expense_id
 *     tags:
 *       - Expense Management 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               expense_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Internal Server Error
 */
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


/**
 * @swagger
 * /expenses:
 *   put:
 *     summary: Update an expense
 *     description: Update an existing expense record by expense_id and user_id
 *     tags:
 *       - Expense Management 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expense_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               date_of_expense:
 *                 type: string
 *                 format: date
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Internal Server Error
 */
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


/**
 * @swagger
 * /expenses/report:
 *   get:
 *     summary: Get expense report by category
 *     description: Get total expenses grouped by category with optional date range filter
 *     tags:
 *       - Expense Management 
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startdate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: enddate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Report fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category_id:
 *                         type: integer
 *                       total_expense:
 *                         type: number
 *       500:
 *         description: Internal Server Error
 */
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
