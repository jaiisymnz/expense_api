import express from "express";
import expenseRouter from "./routes/expense.mjs";
import userRouter from "./routes/user.mjs";
import dotenv from "dotenv";

dotenv.config();


const app = express();
const port = 4000;

app.use(express.json());
app.use("/expenses", expenseRouter);
app.use("/users", userRouter);

app.get("/test", (req, res) => {
  return res.json({ message: "Server is working" });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
