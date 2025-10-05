import express from "express";

export default function expensesRoutes(prisma) {
  const router = express.Router();

  // ROTA POST: Cria um novo lançamento (POST /api/expenses)
  router.post("/", async (req, res) => {
    try {
      const { description, amount, type, color, date } = req.body;
      
      // Validação: Verifica se campos obrigatórios estão presentes.
      if (!description || !amount || !type || !date) {
        return res.status(400).json({ error: "Campos obrigatórios ausentes." });
      }

      // Conversão/Validação: Garante que 'amount' é um número (Float no schema).
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
          return res.status(400).json({ error: "O campo 'amount' deve ser um número válido." });
      }

      const newExpense = await prisma.expense.create({
        data: {
          description,
          amount: parsedAmount, 
          type,
          color: color || "bg-gray-500", // Default color se não for fornecida
          date: new Date(date),
        },
      });

      // Retorna 201 Created conforme padrão REST.
      res.status(201).json(newExpense); 
    } catch (error) {
      // Log detalhado para depuração no servidor.
      console.error("Erro ao criar lançamento:", error.message);
      res.status(500).json({ error: "Erro interno ao criar lançamento" });
    }
  });

  // ROTA GET: Lista todos os lançamentos (GET /api/expenses)
  router.get("/", async (req, res) => {
    try {
      const expenses = await prisma.expense.findMany({
        orderBy: { date: "desc" }, // Ordena por data mais recente
      });
      res.json(expenses);
    } catch (error) {
      console.error("Erro ao buscar lançamentos:", error.message);
      res.status(500).json({ error: "Erro interno ao buscar lançamentos" });
    }
  });

  // ROTA GET por ID: Busca um lançamento específico (GET /api/expenses/:id)
  router.get("/:id", async (req, res) => {
    try {
      // O ID é uma String no MongoDB/Prisma (@db.ObjectId).
      const expense = await prisma.expense.findUnique({
        where: { id: req.params.id },
      });
      if (!expense) return res.status(404).json({ error: "Lançamento não encontrado" });
      res.json(expense);
    } catch (error) {
      console.error("Erro ao buscar lançamento por ID:", error.message);
      res.status(500).json({ error: "Erro interno ao buscar lançamento" });
    }
  });

  // ROTA PUT: Atualiza um lançamento (PUT /api/expenses/:id)
  router.put("/:id", async (req, res) => {
    try {
      const { description, amount, type, color, date } = req.body;
      
      // Converte e valida o 'amount' novamente antes de atualizar.
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
          return res.status(400).json({ error: "O campo 'amount' deve ser um número válido." });
      }

      const updated = await prisma.expense.update({
        where: { id: req.params.id }, // Busca o registro pelo ID (String)
        data: {
          description,
          amount: parsedAmount,
          type,
          color,
          date: new Date(date),
        },
      });

      res.json(updated);
    } catch (error) {
      console.error("Erro ao atualizar lançamento:", error.message);
      res.status(500).json({ error: "Erro interno ao atualizar lançamento" });
    }
  });

  // ROTA DELETE: Deleta um lançamento (DELETE /api/expenses/:id)
  router.delete("/:id", async (req, res) => {
    try {
      await prisma.expense.delete({ where: { id: req.params.id } });
      // Retorna 204 No Content para exclusão bem-sucedida.
      res.status(204).send(); 
    } catch (error) {
      console.error("Erro ao deletar lançamento:", error.message);
      res.status(500).json({ error: "Erro interno ao deletar lançamento" });
    }
  });

  return router;
}