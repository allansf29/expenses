import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileDown,
    Target,
    Lightbulb,
    DollarSign as DollarIcon // Alias para o ícone no cabeçalho
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Sidebar from "@/components/Sidebar"; // Re-importando o Sidebar
import { useFinanceData } from "../hooks/useFinanceData";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { useGoals } from "../hooks/useGoals";

export default function InsightsPage() {
    const { monthlySummary, expenses } = useFinanceData();
    const { handleExportCSV } = useExpenseForm({
        expenses,
        selectedDate: new Date(),
        fetchExpensesFromServer: async () => [],
        setExpenses: () => { },
    });
    const { goals } = useGoals();

    const getFinancialTip = () => {
        const { totalIncome, totalExpense, balance } = monthlySummary;

        if (balance < 0)
            return "⚠️ Seu saldo está negativo! **Priorize!** Reveja suas despesas e evite novas compras até equilibrar.";
        if (totalExpense > totalIncome * 0.8)
            return "🚨 **Alto Gasto!** Você usou mais de 80% da sua renda. Tente reduzir gastos não essenciais neste mês.";
        if (balance > totalIncome * 0.3)
            return "💰 **Excelente Poupança!** Você está poupando mais de 30% da sua renda. Que tal investir parte desse saldo?";
        return "📊 **Siga em frente!** Continue acompanhando seus gastos e metas para evoluir financeiramente!";
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(amount);
    };

    return (
        <div className="min-h-screen font-['Inter'] relative">
            <Sidebar /> 
            <main className="lg:ml-64 overflow-y-auto p-4 sm:p-8 relative z-10">
                <header className="pb-4 mb-8 border-b border-border flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black text-foreground leading-tight">
                            💡 Estratégia e Insights
                        </h1>
                        <p className="text-base text-muted-foreground mt-1">
                            Seja bem-vindo(a) ao seu resumo estratégico de finanças.
                        </p>
                    </div>
                    <div className="bg-gradient-to-r from-primary to-secondary rounded-full p-2 shadow-lg shadow-primary/30">
                        <DollarIcon className="w-8 h-8 text-primary-foreground" />
                    </div>
                </header>
                <div className="bg-background/80 backdrop-blur-sm p-4 sm:p-8 rounded-2xl border border-border shadow-2xl min-h-[calc(100vh-180px)]">
                    
                    <div className="flex justify-end gap-3 mb-8">
                        <Button 
                            onClick={() => handleExportCSV("month")} 
                            className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        >
                            <FileDown className="w-4 h-4" /> Exportar Mês
                        </Button>
                        <Button 
                            onClick={() => handleExportCSV("all")} 
                            className="flex items-center gap-2"
                        >
                            <FileDown className="w-4 h-4" /> Exportar Tudo
                        </Button>
                    </div>

                    {/* Resumo do Mês */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        
                        <Card className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Receitas ({monthlySummary.monthName || "Mês"})</CardTitle>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">
                                    {formatCurrency(monthlySummary.totalIncome || 0)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Despesas ({monthlySummary.monthName || "Mês"})</CardTitle>
                                <TrendingDown className="w-5 h-5 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-500">
                                    {formatCurrency(monthlySummary.totalExpense || 0)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                                <DollarSign className={`w-5 h-5 ${monthlySummary.balance >= 0 ? "text-green-500" : "text-red-500"}`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${monthlySummary.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {formatCurrency(monthlySummary.balance || 0)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Dica Estratégica */}
                    <Card className="bg-yellow-50/20 border-yellow-500/50 shadow-md mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-lg font-bold text-yellow-500">
                                <Lightbulb className="w-6 h-6" />
                                Dica Estratégica
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-yellow-100 text-base">{getFinancialTip()}</p>
                        </CardContent>
                    </Card>

                    {/* Metas e Status Geral */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Target className="w-5 h-5 text-indigo-500" />
                                    Progresso das Metas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {goals.length === 0 && (
                                    <p className="text-muted-foreground italic">Nenhuma meta cadastrada ainda. **Defina uma meta!**</p>
                                )}

                                {goals.map((goal) => {
                                    const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                                    return (
                                        <div key={goal.id} className="space-y-1">
                                            <div className="flex justify-between items-end">
                                                <p className="font-semibold text-base">{goal.name}</p>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                                                </span>
                                            </div>
                                            <Progress 
                                                value={progress} 
                                                className="h-2 [&>div]:bg-indigo-500"
                                            />
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                        
                        <Card className="lg:col-span-1 flex flex-col justify-center">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    {monthlySummary.balance >= 0 ? (
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <TrendingDown className="w-5 h-5 text-red-500" />
                                    )}
                                    Status Geral
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {monthlySummary.balance >= 0 ? (
                                    <p className="text-green-400 font-medium leading-relaxed">
                                        **Excelente!** Mês fechando no positivo. Mantenha o foco em investir a diferença.
                                    </p>
                                ) : (
                                    <p className="text-red-400 font-medium leading-relaxed">
                                        **Atenção!** Seu saldo está negativo. Concentre-se em controlar gastos para reverter o saldo.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div> 
            </main>
        </div>
    );
}