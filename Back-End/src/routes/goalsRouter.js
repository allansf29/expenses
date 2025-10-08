import express from "express";

export default function goalsRoutes(prisma) {
  const router = express.Router();

  // Função auxiliar para incluir contribuições
  const goalInclude = {
    contributions: {
      orderBy: { date: "desc" },
    },
  };

  // GET: Listar todas as metas (com histórico de contribuições)
  router.get("/", async (req, res) => {
    try {
      const goals = await prisma.goal.findMany({
        include: goalInclude,
        orderBy: { createdAt: "desc" },
      });
      res.json(goals);
    } catch (error) {
      console.error("Erro ao listar metas:", error.message);
      res.status(500).json({ error: "Erro interno ao listar metas" });
    }
  });

  // POST: Criar nova meta
  router.post("/", async (req, res) => {
    try {
      const { name, targetAmount, targetDate } = req.body;
      // ... (Resto da lógica de POST igual) ...
      const parsedTargetAmount = parseFloat(targetAmount);
      
      const newGoal = await prisma.goal.create({
        data: {
          name,
          targetAmount: parsedTargetAmount,
          currentAmount: 0,
          targetDate: new Date(targetDate),
          isCompleted: false,
        },
        include: goalInclude, // Inclui a relação vazia para manter a consistência
      });

      res.status(201).json(newGoal);
    } catch (error) {
      console.error("Erro ao criar meta:", error.message);
      res.status(500).json({ error: "Erro interno ao criar meta" });
    }
  });

  // PUT: Editar (Atualizar) Meta Completa (Nome, Alvo, Data)
  router.put("/:id", async (req, res) => {
    try {
      const { name, targetAmount, targetDate } = req.body;
      const parsedTargetAmount = parseFloat(targetAmount);

      const updatedGoal = await prisma.goal.update({
        where: { id: req.params.id },
        data: {
          name,
          targetAmount: parsedTargetAmount,
          targetDate: new Date(targetDate),
        },
        include: goalInclude,
      });

      res.json(updatedGoal);
    } catch (error) {
      console.error("Erro ao editar meta:", error.message);
      res.status(500).json({ error: "Erro interno ao editar meta" });
    }
  });

  // POST (NOVO): Registrar uma Contribuição para uma Meta (Endpoint separado)
  router.post("/:id/contribute", async (req, res) => {
    try {
      const { amount } = req.body;
      const contributionAmount = parseFloat(amount);

      if (!contributionAmount || contributionAmount <= 0) {
        return res.status(400).json({ error: "Valor de contribuição inválido." });
      }

      // 1. Criar o registro de contribuição
      await prisma.goalContribution.create({
        data: {
          goalId: req.params.id,
          amount: contributionAmount,
        },
      });

      // 2. Atualizar o currentAmount total da Meta
      const currentGoal = await prisma.goal.findUnique({
        where: { id: req.params.id },
      });

      if (!currentGoal) {
        return res.status(404).json({ error: "Meta não encontrada." });
      }

      const newCurrentAmount = currentGoal.currentAmount + contributionAmount;
      const isCompleted = newCurrentAmount >= currentGoal.targetAmount;

      const updatedGoal = await prisma.goal.update({
        where: { id: req.params.id },
        data: {
          currentAmount: newCurrentAmount,
          isCompleted: isCompleted,
        },
        include: goalInclude,
      });

      res.json(updatedGoal);
    } catch (error) {
      console.error("Erro ao registrar contribuição:", error.message);
      res.status(500).json({ error: "Erro interno ao registrar contribuição" });
    }
  });

  router.delete("/:goalId/contribute/:contributionId", async (req, res) => {
    try {
        const { goalId, contributionId } = req.params;

        // 1. Encontrar a contribuição para saber o valor a ser subtraído
        const contributionToDelete = await prisma.goalContribution.findUnique({
            where: { id: contributionId },
        });

        if (!contributionToDelete) {
            return res.status(404).json({ error: "Contribuição não encontrada." });
        }
        
        // 2. Excluir o registro da contribuição
        await prisma.goalContribution.delete({
            where: { id: contributionId },
        });

        // 3. Atualizar o currentAmount total da Meta
        const currentGoal = await prisma.goal.findUnique({ where: { id: goalId } });
        
        if (!currentGoal) {
             return res.status(404).json({ error: "Meta relacionada não encontrada." });
        }

        const newCurrentAmount = currentGoal.currentAmount - contributionToDelete.amount;
        const isCompleted = newCurrentAmount >= currentGoal.targetAmount;

        const updatedGoal = await prisma.goal.update({
            where: { id: goalId },
            data: {
                currentAmount: Math.max(0, newCurrentAmount), // Garante que não fique negativo
                isCompleted: isCompleted,
            },
            include: goalInclude, // Reutiliza o include para retornar o estado completo da meta
        });

        res.json(updatedGoal); // Retorna a meta atualizada
    } catch (error) {
        console.error("Erro ao deletar contribuição:", error.message);
        res.status(500).json({ error: "Erro interno ao deletar contribuição" });
    }
});


  // DELETE: Deletar meta
  router.delete("/:id", async (req, res) => {
    try {
      // Deletar as contribuições primeiro (por segurança)
      await prisma.goalContribution.deleteMany({
        where: { goalId: req.params.id },
      });
      // Deletar a meta
      await prisma.goal.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar meta:", error.message);
      res.status(500).json({ error: "Erro interno ao deletar meta" });
    }
  });

  return router;
}