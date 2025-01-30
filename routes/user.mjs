import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userRouter = Router();

userRouter.post("/register", async (req, res) => {
  const { email, password, firstname, lastname } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const query = `
    INSERT INTO users (email, password, firstname, lastname)
    VALUES ($1, $2, $3, $4)
    RETURNING user_id, email, firstname, lastname;
  `;
  try {
    await connectionPool.query(query, [
      email,
      hashedPassword,
      firstname,
      lastname,
    ]);
    return res.status(200).json({
      message: "User has been created successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Could not login user due to missing field" });
  }
  const query = "SELECT * FROM users WHERE email = $1";
  try {
    const result = await connectionPool.query(query, [email]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "900000",
      }
    );

    return res.status(200).json({ message: "Login successfully", token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default userRouter;
