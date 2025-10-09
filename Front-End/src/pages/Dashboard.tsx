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

import { useFinanceData } from "../hooks/useFinanceData.tsx"; 

// --- COMPONENTES AUXILIARES ---

// Usando bg-card e text-card-foreground do shadcn para respeitar o tema
const SummaryCard: React.FC<{
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}> = ({ title, value, icon: Icon, color }) => (
  // Fundo com cor do card, borda e hover de destaque
  <div className="p-5 bg-card/70 backdrop-blur-sm rounded-xl border border-border/50 shadow-md flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary relative overflow-hidden group">
    <div className={`absolute inset-0 opacity-5 ${color.replace('text-', 'bg-')}`}></div>
    
    <div>
      <p className="text-sm font-light text-muted-foreground">{title}</p>
      <p className={`text-3xl font-extrabold mt-1 ${color}`}>{value}</p>
    </div>
    <div className={`p-2 rounded-full ring-2 ring-offset-2 ring-background ${color.replace('text-', 'ring-')}`}>
      <Icon className={`w-7 h-7 ${color}`} />
    </div>
  </div>
);

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
    // Fundo do card, hover com gradiente mais escuro/claro
    className="w-full p-6 bg-card rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] group relative overflow-hidden border border-border hover:border-primary/50"
  >
    {/* Efeito de overlay no hover mais discreto */}
    <div className="absolute inset-0 bg-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

    <div className="relative">
      <div
        className={`p-3 w-fit rounded-full mb-4 ${color.replace(
          "text-",
          "bg-"
        )}/10 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <h3 className="text-xl font-extrabold text-card-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </a>
);

// --- 1. CONTEÚDO DA HOME ---
const DashboardHomeContent: React.FC = () => {
  const { monthlySummary } = useFinanceData();

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
      color: "text-indigo-500", // Cores ligeiramente ajustadas para melhor contraste
    },
    {
      href: "/analysis",
      name: "Análise de Gastos",
      description: "Veja gráficos e tendências rapidamente.",
      icon: BarChart3,
      color: "text-amber-500",
    },
    {
      href: "/metas",
      name: "Metas e Objetivos",
      description: "Acompanhe seu progresso de poupança.",
      icon: Target,
      color: "text-fuchsia-500",
    },
    {
      href: "/configs",
      name: "Configurações",
      description: "Gerencie categorias e contas.",
      icon: Zap,
      color: "text-sky-500",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title={`Saldo do Mês (${monthlySummary.monthName})`}
          value={formatCurrency(monthlySummary.balance)}
          icon={Wallet}
          // Usando cores padrão do Tailwind que se destacam
          color={
            monthlySummary.balance >= 0
              ? "text-green-500" 
              : "text-red-500" 
          }
        />
        <SummaryCard
          title="Receitas (Mês)"
          value={formatCurrency(monthlySummary.totalIncome)}
          icon={TrendingUp}
          color="text-green-500"
        />
        <SummaryCard
          title="Despesas (Mês)"
          value={formatCurrency(monthlySummary.totalExpense)}
          icon={TrendingDown}
          color="text-red-500"
        />
      </div>

      <h3 className="text-2xl font-extrabold text-foreground pt-4 pb-2">
        Acesso Rápido
      </h3>

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
    // Usa apenas min-h-screen e font, permitindo que o <body> gerencie o bg-background
    <div className="min-h-screen font-['Inter'] relative">
      <Sidebar />
      <main className="lg:ml-64 overflow-y-auto p-4 sm:p-8 relative z-10">
        <header className="pb-4 mb-8 border-b border-border flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-foreground leading-tight">
              Painel Principal
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Seja bem-vindo(a) ao resumo de suas finanças!
            </p>
          </div>
          {/* Usando gradiente com primary e secondary do shadcn */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-full p-2 shadow-lg shadow-primary/30">
            <DollarSign className="w-8 h-8 text-primary-foreground" />
          </div>
        </header>

        {/* Container principal usa bg-background/80 e borda padrão */}
        <div className="bg-background/80 backdrop-blur-sm p-4 sm:p-8 rounded-2xl border border-border shadow-2xl min-h-[calc(100vh-180px)]">
          <DashboardHomeContent />
        </div>
      </main>
    </div>
  );
}