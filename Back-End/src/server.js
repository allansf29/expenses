import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

import authRoutes from "./routes/authRoutes.js";
import expensesRoutes from "./routes/expensesRoutes.js";
import goalsRoutes from "./routes/goalsRouter.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Rotas: Chamada mista para garantir que os módulos sejam carregados corretamente
app.use("/api/auth", authRoutes); // Carrega o router diretamente
app.use("/api/expenses", expensesRoutes(prisma)); // Chama como função, passando o prisma
app.use("/api/goals", goalsRoutes(prisma)); // Chama como função, passando o prisma

app.get("/", (req, res) => {
  res.send("🚀 API Finanças rodando!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erro Interno do Servidor", message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));