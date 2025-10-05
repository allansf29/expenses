import express from "express";

export default function expensesRoutes(prisma) {
  const router = express.Router();

  // Criar lançamento
  router.post("/", async (req, res) => {
    try {
      const { description, amount, type, color, date } = req.body;
      if (!description || !amount || !type || !date) {
        return res.status(400).json({ error: "Campos obrigatórios ausentes." });
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        return res.status(400).json({ error: "O campo 'amount' deve ser numérico." });
      }

      const newExpense = await prisma.expense.create({
        data: {
          description,
          amount: parsedAmount,
          type,
          color: color || "bg-gray-500",
          date: new Date(date),
        },
      });

      res.status(201).json(newExpense);
    } catch (error) {
      console.error("Erro ao criar lançamento:", error.message);
      res.status(500).json({ error: "Erro interno ao criar lançamento" });
    }
  });

  // Listar todos
  router.get("/", async (req, res) => {
    try {
      const expenses = await prisma.expense.findMany({
        orderBy: { date: "desc" },
      });
      res.json(expenses);
    } catch (error) {
      console.error("Erro ao listar lançamentos:", error.message);
      res.status(500).json({ error: "Erro interno ao listar lançamentos" });
    }
  });

  // Buscar por ID
  router.get("/:id", async (req, res) => {
    try {
      const expense = await prisma.expense.findUnique({
        where: { id: req.params.id },
      });
      if (!expense) return res.status(404).json({ error: "Lançamento não encontrado" });
      res.json(expense);
    } catch (error) {
      console.error("Erro ao buscar lançamento:", error.message);
      res.status(500).json({ error: "Erro interno ao buscar lançamento" });
    }
  });

  // Atualizar
  router.put("/:id", async (req, res) => {
    try {
      const { description, amount, type, color, date } = req.body;
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        return res.status(400).json({ error: "O campo 'amount' deve ser numérico." });
      }

      const updatedExpense = await prisma.expense.update({
        where: { id: req.params.id },
        data: { description, amount: parsedAmount, type, color, date: new Date(date) },
      });

      res.json(updatedExpense);
    } catch (error) {
      console.error("Erro ao atualizar lançamento:", error.message);
      res.status(500).json({ error: "Erro interno ao atualizar lançamento" });
    }
  });

  // Deletar
  router.delete("/:id", async (req, res) => {
    try {
      await prisma.expense.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar lançamento:", error.message);
      res.status(500).json({ error: "Erro interno ao deletar lançamento" });
    }
  });

  return router;
}
