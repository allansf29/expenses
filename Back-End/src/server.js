import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import expensesRoutes from "./routes/expensesRoutes.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/expenses", expensesRoutes(prisma));

// Teste da API
app.get("/", (req, res) => {
  res.send("🚀 API Finanças está rodando!");
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error("Erro interno:", err.message);
  res.status(500).json({ error: "Erro interno do servidor" });
});

// Inicializa o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
