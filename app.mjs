import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import expenseRouter from "./routes/expense.mjs";
import userRouter from "./routes/user.mjs";
import dotenv from "dotenv";

dotenv.config();


const app = express();
const port = 4000;

app.use(express.json());


const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Expense API",
      version: "1.0.0",
      description: "API documentation for managing expenses",
    },
  },

  apis: ["./routes/expense.mjs", "./routes/user.mjs"],
};


const swaggerDocs = swaggerJsdoc(swaggerOptions);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use("/expenses", expenseRouter);
app.use("/users", userRouter);

app.get("/test", (req, res) => {
  return res.json({ message: "Server is working" });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
