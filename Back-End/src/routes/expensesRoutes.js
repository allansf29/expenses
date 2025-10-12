import express from "express";
import { add, parseISO } from "date-fns";

function calculateNextDate(startDate, frequency) {
    switch (frequency) {
        case 'daily':
            return add(startDate, { days: 1 });
        case 'weekly':
            return add(startDate, { weeks: 1 });
        case 'monthly':
            return add(startDate, { months: 1 });
        default:
            return null;
    }
}

export default function expensesRoutes(prisma) {
    const router = express.Router();

    router.post("/recurrence", async (req, res) => {
        try {
            const { 
                description, 
                amount, 
                type, 
                color, 
                date,
                frequency, 
                installments 
            } = req.body;

            if (!description || !amount || !type || !date || !frequency || installments === undefined || installments === null) {
                return res.status(400).json({ error: "Campos obrigatórios de recorrência ausentes." });
            }

            const parsedAmount = parseFloat(amount);
            const numInstallments = parseInt(installments);
            
            if (isNaN(parsedAmount) || isNaN(numInstallments)) {
                return res.status(400).json({ error: "Valor ou número de parcelas inválido." });
            }

            let currentDate = parseISO(date);
            const expensesToCreate = [];
            const isContinuous = numInstallments === 0;
            const limit = isContinuous ? 120 : numInstallments;

            for (let i = 0; i < limit; i++) {
                if (i > 0) {
                    const nextDate = calculateNextDate(currentDate, frequency);
                    if (!nextDate) break; 
                    currentDate = nextDate;
                }

                expensesToCreate.push({
                    description: `${description} (${isContinuous ? 'Contínuo' : `${i + 1}/${numInstallments}`})`,
                    amount: parsedAmount,
                    type,
                    color: color || "bg-gray-500",
                    date: currentDate,
                    isRecurrence: true,
                    frequency,
                    installments: numInstallments,
                });

                if (!isContinuous && i + 1 >= numInstallments) break; 
            }

            if (expensesToCreate.length === 0) {
                return res.status(400).json({ error: "Não foi possível calcular lançamentos com a frequência e parcelas fornecidas." });
            }

            const result = await prisma.expense.createMany({
                data: expensesToCreate,
            });

            res.status(201).json({ 
                count: result.count, 
                message: `Sucesso: ${result.count} lançamentos recorrentes criados.`,
            });
        } catch (error) {
            console.error("Erro ao criar lançamentos recorrentes:", error.message);
            if (error.code === 'P2000' || error.code === 'P2002') { 
                return res.status(400).json({ error: "Erro de validação do banco de dados.", details: error.message });
            }
            res.status(500).json({ error: "Erro interno ao criar recorrência" });
        }
    });

    router.post("/", async (req, res) => {
        try {
            const { description, amount, type, color, date, isRecurrence, frequency, installments } = req.body;
            
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
                    isRecurrence: isRecurrence || false,
                    frequency: frequency || null, 
                    installments: installments ? parseInt(installments) : null,
                },
            });

            res.status(201).json(newExpense);
        } catch (error) {
            console.error("Erro ao criar lançamento (único):", error.message);
            res.status(500).json({ error: "Erro interno ao criar lançamento" });
        }
    });

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

    router.put("/:id", async (req, res) => {
        try {
            const { description, amount, type, color, date, isRecurrence, frequency, installments } = req.body;
            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount)) {
                return res.status(400).json({ error: "O campo 'amount' deve ser numérico." });
            }

            const updatedExpense = await prisma.expense.update({
                where: { id: req.params.id },
                data: { 
                    description, 
                    amount: parsedAmount, 
                    type, 
                    color, 
                    date: new Date(date),
                    isRecurrence: isRecurrence || false, 
                    frequency: frequency || null,
                    installments: installments ? parseInt(installments) : null,
                },
            });

            res.json(updatedExpense);
        } catch (error) {
            console.error("Erro ao atualizar lançamento:", error.message);
            res.status(500).json({ error: "Erro interno ao atualizar lançamento" });
        }
    });

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