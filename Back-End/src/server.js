import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import expensesRoutes from "./routes/expensesRoutes.js"; 
import goalsRoutes from "./routes/goalsRouter.js"; 

dotenv.config();

const app = express();
const prisma = new PrismaClient(); 

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/expenses", expensesRoutes(prisma));
// NOVO: Conecta a rota de metas
app.use("/api/goals", goalsRoutes(prisma)); 

// Tratamento de erros e inicialização...
app.get("/", (req, res) => {
  res.send("🚀 API Finanças está rodando!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erro Interno do Servidor", message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});