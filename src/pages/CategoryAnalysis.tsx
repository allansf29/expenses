import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
// Adicionadas as dependências Brain e Loader2 para a funcionalidade Gemini
import { DollarSign, BarChart3, TrendingDown, Calendar, ArrowUp, ArrowDown, Brain, Loader2 } from 'lucide-react';

// --- UTILS COMPARTILHADAS (Definição de Tipos e Data) ---

// Tipo base para Transação (Interface TypeScript)
interface Expense {
    id: number;
    date: Date;
    amount: number;
    description: string;
    type: 'expense' | 'income';
    color: string;
}

// Tipo para dados de categoria (Interface TypeScript)
interface CategoryData {
    name: string;
    value: number;
    percentage: string;
    color: string;
    // CORREÇÃO: Adicionando assinatura de índice para compatibilidade com o Recharts
    [key: string]: any; 
}

// Cores para os gráficos (Tailwind Safe Palette)
const COLORS = [
    '#EF4444', // Red (Despesa principal)
    '#F59E0B', // Amber
    '#3B82F6', // Blue
    '#10B981', // Green (Receita)
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#6B7280', // Gray
];

// Função auxiliar para criar a data corrigida
const createCorrectedDate = (dateString: string): Date => {
    const parts = dateString.split('-').map(p => parseInt(p, 10));
    return new Date(parts[0], parts[1] - 1, parts[2], 12);
}

// DADOS INICIAIS (Compartilhados por todas as abas)
const initialExpenses: Expense[] = [
    { id: 1, date: createCorrectedDate("2025-10-01"), amount: 1500.0, description: "Aluguel", type: 'expense', color: "bg-red-700" },
    { id: 2, date: createCorrectedDate("2025-10-05"), amount: 5500.0, description: "Salário Mensal", type: 'income', color: "bg-green-600" },
    { id: 3, date: createCorrectedDate("2025-10-05"), amount: 350.0, description: "Supermercado", type: 'expense', color: "bg-yellow-600" },
    { id: 4, date: createCorrectedDate("2025-10-10"), amount: 150.0, description: "Lazer", type: 'expense', color: "bg-blue-600" },
    { id: 5, date: createCorrectedDate("2025-10-15"), amount: 200.0, description: "Transporte", type: 'expense', color: "bg-pink-600" },
    { id: 6, date: createCorrectedDate("2025-10-20"), amount: 800.0, description: "Investimento", type: 'expense', color: "bg-green-600" },
    { id: 7, date: createCorrectedDate("2025-10-25"), amount: 150.0, description: "Supermercado", type: 'expense', color: "bg-yellow-600" },
    { id: 8, date: createCorrectedDate("2025-10-28"), amount: 50.0, description: "Lazer", type: 'expense', color: "bg-blue-600" },
    { id: 9, date: createCorrectedDate("2025-10-30"), amount: 100.0, description: "Saúde", type: 'expense', color: "bg-purple-600" },
];

const formatCurrency = (amount: number) => 
    `R$${amount.toFixed(2).replace('.', ',')}`;

// --- FUNÇÃO API GEMINI PARA ANÁLISE FINANCEIRA ---

const generateFinancialAdvice = async (dataForLLM: CategoryData[], totalSpent: number): Promise<string> => {
    const apiKey = ""; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const formattedData = JSON.stringify(dataForLLM.map(d => ({ 
        categoria: d.name, 
        valor: d.value, 
        percentual: d.percentage 
    })));
    
    const userQuery = `Atue como um consultor financeiro profissional. Analise a seguinte lista de despesas agregadas por categoria. O gasto total é ${formatCurrency(totalSpent)}. Forneça uma análise de gastos concisa e uma dica de ação imediata para melhorar a saúde financeira. O resumo deve ter no máximo 50 palavras e usar a vírgula como separador decimal nos valores.
    
    Dados: ${formattedData}`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: {
            parts: [{ text: "Você é um consultor financeiro que oferece análises e dicas concisas (máximo 50 palavras) baseadas em dados de despesas. Sua resposta deve ser direta e em português." }]
        },
    };

    let result = '';
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429) { // Too Many Requests
                    retries++;
                    const delay = Math.pow(2, retries) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue; // Tenta novamente
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const jsonResponse = await response.json();
            const text = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text || 'Erro ao gerar análise.';
            result = text;
            break; 

        } catch (error) {
            console.error("API call failed after max retries:", error);
            result = 'Desculpe, a análise da IA falhou. Tente novamente mais tarde.';
            break;
        }
    }
    return result;
};


// --- COMPONENTE FILHO 1: Análise de Categorias (Atualizado com Gemini) ---

const processExpensesByCategory = (allTransactions: Expense[]): CategoryData[] => {
    // Mantém a lógica de processamento de dados para o gráfico
    const expenses = allTransactions.filter(t => t.type === 'expense');
    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

    if (totalSpent === 0) return [];

    const categoryMap = new Map<string, number>();
    expenses.forEach(t => {
        const currentAmount = categoryMap.get(t.description) || 0;
        categoryMap.set(t.description, currentAmount + t.amount);
    });

    let index = 0;
    const data: CategoryData[] = Array.from(categoryMap.entries()).map(([name, value]) => {
        const percentage = ((value / totalSpent) * 100).toFixed(1);
        const color = COLORS[index % COLORS.length];
        index++;
        
        return { name, value, percentage: `${percentage}%`, color };
    }).sort((a, b) => b.value - a.value);

    return data;
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-3 bg-gray-700 border border-gray-600 text-white rounded-lg shadow-xl text-sm">
                <p className="font-bold mb-1 text-base">{data.name}</p>
                <p className="text-gray-300">Valor: {formatCurrency(data.value)}</p>
                <p className="text-blue-300">Participação: {data.percentage}</p>
            </div>
        );
    }
    return null;
};

// Utiliza o tipo React.FC com a interface Expense[]
const AnalysisPage: React.FC<{ expenses: Expense[] }> = ({ expenses }) => {
    const [analysisResult, setAnalysisResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const categoryData = useMemo(() => {
        return processExpensesByCategory(expenses);
    }, [expenses]);

    const totalSpent = categoryData.reduce((sum, item) => sum + item.value, 0);

    const handleGenerateAdvice = async () => {
        if (totalSpent === 0) return;
        setIsLoading(true);
        setAnalysisResult('');
        try {
            const result = await generateFinancialAdvice(categoryData, totalSpent);
            setAnalysisResult(result);
        } catch (error) {
            setAnalysisResult('Erro ao obter a análise. Verifique o console.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="p-4 sm:p-6 bg-gray-900 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-200 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-yellow-500"/> Análise de Categorias
            </h2>

            {totalSpent > 0 ? (
                <>
                    {/* Cartão de Resumo e Botão Gemini */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <div className="bg-gray-800 p-4 rounded-xl shadow-xl text-white flex-1 w-full flex items-center justify-between">
                            <span className="text-lg font-medium text-gray-400">Total Gasto Analisado</span>
                            <span className="text-2xl font-bold text-red-400">
                                {formatCurrency(totalSpent)}
                            </span>
                        </div>
                        
                        <button 
                            onClick={handleGenerateAdvice} 
                            disabled={isLoading}
                            className={`flex items-center justify-center w-full md:w-auto px-6 py-3 font-bold rounded-lg transition-all shadow-lg
                                ${isLoading 
                                    ? 'bg-purple-800 text-purple-300 cursor-not-allowed' 
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                    Gerando Análise...
                                </>
                            ) : (
                                <>
                                    <Brain className="w-4 h-4 mr-2"/>
                                    Obter Dica Financeira ✨
                                </>
                            )}
                        </button>
                    </div>

                    {/* Resultado da Análise Gemini */}
                    {analysisResult && (
                        <div className="bg-purple-900/50 border border-purple-700 p-4 rounded-lg mb-6 shadow-inner text-white">
                            <h4 className="font-bold text-purple-300 mb-2 flex items-center">
                                <Brain className="w-4 h-4 mr-2"/> Consultor Financeiro Gemini
                            </h4>
                            <p className="text-sm text-gray-200">{analysisResult}</p>
                        </div>
                    )}


                    {/* GRÁFICOS E TABELA */}
                    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
                        
                        <div className="lg:col-span-1 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg flex flex-col items-center h-[380px]">
                            <h3 className='text-lg font-semibold text-gray-200 mb-2'>Distribuição (%)</h3>
                            <div className="w-full h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            labelLine={false}
                                            paddingAngle={5}
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '11px', color: '#9CA3AF' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                            <h3 className='text-lg font-semibold text-gray-200 mb-4 border-b border-gray-700 w-full pb-2'>
                                Maiores Gastos
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700 text-white">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs text-gray-300">Categoria</th>
                                            <th className="px-4 py-2 text-right text-xs text-gray-300">Valor (R$)</th>
                                            <th className="px-4 py-2 text-right text-xs text-gray-300">%</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {categoryData.slice(0, 5).map((item) => (
                                            <tr key={item.name} className='hover:bg-gray-700 transition-colors'>
                                                <td className="px-4 py-3 text-sm font-medium flex items-center">
                                                    <span className={`w-3 h-3 rounded-full mr-2`} style={{backgroundColor: item.color}}></span>
                                                    {item.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right">
                                                    {formatCurrency(item.value)}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-blue-400 text-right">
                                                    {item.percentage}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center p-12 bg-gray-800 rounded-lg mt-8 text-gray-400">
                    Nenhuma despesa para analisar. Por favor, lance gastos na aba Calendário.
                </div>
            )}
        </div>
    );
}

// --- COMPONENTE FILHO 2: Calendário Simplificado (Placeholder com Lógica de Lançamento) ---

// Utiliza o tipo React.FC com a interface Expense[]
const CalendarPage: React.FC<{ expenses: Expense[], addExpense: (expense: Expense) => void }> = ({ expenses, addExpense }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleQuickAdd = () => {
        // Garantindo que a conversão use ponto como separador decimal para lógica interna
        const amountFloat = parseFloat(amount.replace(",", ".")); 
        if (!description || isNaN(amountFloat) || amountFloat <= 0) {
            console.error("Dados inválidos.");
            return;
        }

        const newExpense: Expense = {
            id: Date.now(),
            date: new Date(),
            amount: amountFloat,
            description: description.trim(),
            type: 'expense',
            color: COLORS[0], // Padrão Despesa Vermelha
        };
        addExpense(newExpense);
        setAmount('');
        setDescription('');
        console.log("Despesa adicionada:", newExpense);
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-900 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-200 mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500"/> Lançamento Rápido (Calendário)
            </h2>
            <p className="text-gray-400 mb-6">
                Aqui estaria o componente completo de calendário e modal. Abaixo, um exemplo de como adicionar um lançamento que afeta a aba de Análise.
            </p>

            <div className='bg-gray-800 p-4 rounded-lg flex flex-col gap-4'>
                <h3 className='text-lg font-semibold text-white'>Adicionar Nova Despesa</h3>
                <input
                    type="text"
                    placeholder="Descrição (Ex: Pizza)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                    type="text"
                    placeholder="Valor (Ex: 45,50)"
                    value={amount}
                    // Permite que o usuário use vírgula ou ponto, mas armazena como ponto
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9,.]/g, ''))}
                    className="p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                    onClick={handleQuickAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors"
                >
                    <ArrowDown className="w-4 h-4 mr-2 inline-block"/> Adicionar Despesa
                </button>
            </div>
            
            <div className='mt-6 text-gray-400'>
                <p>Total de Lançamentos na Lista: <span className='font-bold text-white'>{expenses.length}</span></p>
            </div>
        </div>
    );
}

// --- COMPONENTE PAI: Gerencia o Estado e a Navegação ---

export default function FinanceDashboard(): React.ReactElement {
    // Utiliza o tipo Expense[] para garantir a tipagem correta do estado
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
    const [activeTab, setActiveTab] = useState<'calendar' | 'analysis'>('calendar');

    // Função que será passada para o Calendário para adicionar novos dados
    const handleAddExpense = (newExpense: Expense) => {
        setExpenses(prev => [...prev, newExpense]);
    };

    const tabClasses = (tab: 'calendar' | 'analysis') => 
        `px-4 py-2 font-semibold transition-colors rounded-t-lg focus:outline-none 
         ${activeTab === tab 
            ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-500' 
            : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800/80'
         }`;

    const totalBalance = useMemo(() => {
        const income = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
        const expense = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
        return income - expense;
    }, [expenses]);
    
    const balanceColor = totalBalance >= 0 ? 'text-green-400' : 'text-red-400';

    return (
        <div className="bg-gray-950 min-h-screen p-2 sm:p-4 md:p-8 font-['Inter']">
            <div className="p-4 sm:p-6 w-full shadow-2xl rounded-xl bg-gray-900 border border-gray-800 max-w-7xl mx-auto">
                
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 mb-4 border-b border-gray-800">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 md:mb-0">
                        <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-white inline-block bg-blue-600 rounded-full p-1"/>
                        Meu Gerenciador Financeiro
                    </h1>
                    <div className='flex items-center text-sm bg-gray-800 p-3 rounded-xl border border-gray-700'>
                        <span className='text-gray-400 mr-2 font-medium'>Saldo Acumulado:</span>
                        <span className={`text-xl font-bold ${balanceColor}`}>
                            {formatCurrency(totalBalance)}
                        </span>
                    </div>
                </header>

                {/* ABAS DE NAVEGAÇÃO */}
                <div className="flex border-b border-gray-700 mb-6">
                    <button onClick={() => setActiveTab('calendar')} className={tabClasses('calendar')}>
                        <Calendar className="w-4 h-4 mr-2 inline-block"/> Lançamentos e Calendário
                    </button>
                    <button onClick={() => setActiveTab('analysis')} className={tabClasses('analysis')}>
                        <BarChart3 className="w-4 h-4 mr-2 inline-block"/> Análise de Gastos
                    </button>
                </div>

                {/* CONTEÚDO DA ABA ATIVA */}
                <div className='bg-gray-800 rounded-xl p-4'>
                    {activeTab === 'calendar' ? (
                        <CalendarPage expenses={expenses} addExpense={handleAddExpense} />
                    ) : (
                        <AnalysisPage expenses={expenses} />
                    )}
                </div>

            </div>
        </div>
    );
}
