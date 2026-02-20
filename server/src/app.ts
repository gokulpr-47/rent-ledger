import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rentalRoutes from "./routes/rental.routes";
import customerRoutes from "./routes/customer.routes";
import paymentRoutes from "./routes/payment.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import productRoutes from "./routes/product.routes";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.get("/health", (_, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/rentals", rentalRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);

export default app;
