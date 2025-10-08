import React from "react";
import {
  Wallet,
  BarChart3,
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar as CalendarIcon,
  Zap,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

// 💡 IMPORTAR O HOOK DE DADOS
import { useFinanceData } from "../hooks/useFinanceData.tsx"; // Ajuste o caminho conforme sua estrutura real

// --- COMPONENTES AUXILIARES ---

// Card de Resumo (Stats Card)
const SummaryCard: React.FC<{
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}> = ({ title, value, icon: Icon, color }) => (
  <div className="p-4 bg-gray-800 rounded-xl shadow-lg border border-gray-700 flex items-center justify-between transition-transform duration-200 hover:scale-[1.02]">
    <div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
    <Icon className={`w-8 h-8 ${color}`} />
  </div>
);

// Card de Navegação (Feature Card)
const FeatureCard: React.FC<{
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}> = ({ href, title, description, icon: Icon, color }) => (
  <a
    href={href}
    target="_self"
    className="w-full p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
  >
    <div
      className={`p-3 w-fit rounded-lg mb-4 ${color.replace(
        "text-",
        "bg-"
      )}/20 group-hover:scale-110 transition-transform duration-300`}
    >
      <Icon className={`w-8 h-8 ${color}`} />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </a>
);

// --- 1. CONTEÚDO DA HOME (AGORA COM DADOS REAIS) ---
const DashboardHomeContent: React.FC = () => {
  // 💡 CHAMA O HOOK PARA OBTER OS DADOS AGREGADOS
  const { monthlySummary } = useFinanceData();

  // Função para formatar o valor como moeda brasileira (R$ X.XXX,XX)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const navModules = [
    {
      href: "/calendar",
      name: "Lançamentos & Calendário",
      description: "Clique para ir diretamente para a sua página /calendar.",
      icon: CalendarIcon,
      color: "text-blue-400",
    },
    {
      href: "/analysis",
      name: "Análise de Gastos",
      description: "Veja gráficos e tendências rapidamente.",
      icon: BarChart3,
      color: "text-yellow-400",
    },
    {
      href: "/metas",
      name: "Metas e Objetivos",
      description: "Acompanhe seu progresso de poupança.",
      icon: Target,
      color: "text-pink-400",
    },
    {
      href: "/configs",
      name: "Configurações",
      description: "Gerencie categorias e contas.",
      icon: Zap,
      color: "text-orange-400",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-160px)] space-y-10">
      {/* 1. Cards de Resumo (AGORA USANDO monthlySummary) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title={`Saldo do Mês (${monthlySummary.monthName})`}
          value={formatCurrency(monthlySummary.balance)}
          icon={Wallet}
          // Cor baseada no saldo: verde se positivo, vermelho se negativo
          color={monthlySummary.balance >= 0 ? "text-green-400" : "text-red-400"}
        />
        <SummaryCard
          title="Receitas (Mês)"
          value={formatCurrency(monthlySummary.totalIncome)}
          icon={TrendingUp}
          color="text-green-400"
        />
        <SummaryCard
          title="Despesas (Mês)"
          value={formatCurrency(monthlySummary.totalExpense)}
          icon={TrendingDown}
          color="text-red-400"
        />
      </div>

      <h3 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">
        Acesso Rápido
      </h3>

      {/* 2. Cards de Navegação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {navModules.map((module) => (
          <FeatureCard
            key={module.href}
            href={module.href}
            title={module.name}
            description={module.description}
            icon={module.icon}
            color={module.color}
          />
        ))}
      </div>
    </div>
  );
};

// --- 2. COMPONENTE PRINCIPAL ---
export default function Dashboard(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-950 font-['Inter']">
      <Sidebar />
      <main className="lg:ml-64 overflow-y-auto p-4 sm:p-8">
        {/* Header */}
        <header className="pb-4 mb-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Painel Principal
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Seja bem-vindo(a) ao resumo de suas finanças!
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-white bg-blue-600 rounded-full p-1" />
        </header>

        {/* Conteúdo */}
        <div className="bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-800 shadow-2xl min-h-[calc(100vh-160px)]">
          <DashboardHomeContent />
        </div>
      </main>
    </div>
  );
}