import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import restaurantRoutes from "./routes/restaurantRoutes";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/restaurants", restaurantRoutes);
app.use("/users", userRoutes);
app.use("/transactions", transactionRoutes);

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
