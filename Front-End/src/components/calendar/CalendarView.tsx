import React from "react";
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, X, ChevronLeft, ChevronRight } from "lucide-react"; // Importando Chevrons
import type { Expense } from "../../lib/types";
import SimpleButton from "../../components/ui/SimpleButton";

interface CalendarViewProps {
    currentMonth: Date;
    selectedDate: Date;
    expenses: Expense[];
    // Funções de navegação do useFinanceData
    prevMonth: () => void;
    nextMonth: () => void;
    // Funções do ExpenseCalendar
    setSelectedDate: (date: Date) => void;
    handleDeleteExpense: (id: string) => void;
    openModalForDate: (date: Date) => void;
    openModalForEdit: (expense: Expense) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
    currentMonth,
    selectedDate,
    expenses,
    setSelectedDate,
    prevMonth,
    nextMonth,
    handleDeleteExpense,
    openModalForDate,
    openModalForEdit,
}) => {
    
    const renderHeader = () => (
        <div className="flex items-center justify-between mb-2 pb-4 border-b border-border text-foreground">
            <div className="flex items-center gap-2">
                <SimpleButton 
                    className="h-8 w-8 text-muted-foreground hover:bg-accent bg-transparent hover:text-foreground p-0 focus:ring-ring" 
                    onClick={prevMonth}
                >
                    <ChevronLeft className="w-5 h-5" />
                </SimpleButton>
                <h2 className="text-xl font-medium w-48 text-left capitalize">{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</h2>
                <SimpleButton 
                    className="h-8 w-8 text-muted-foreground hover:bg-accent bg-transparent hover:text-foreground p-0 focus:ring-ring" 
                    onClick={nextMonth}
                >
                    <ChevronRight className="w-5 h-5" /> 
                </SimpleButton>
            </div>
            <SimpleButton onClick={() => openModalForDate(selectedDate)} className="bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-ring">
                <DollarSign className="w-4 h-4 mr-2 inline-block" /> Novo Lançamento
            </SimpleButton>
        </div>
    );

    // renderDays: Nomes dos dias da semana
    const renderDays = () => {
        const days: React.ReactElement[] = [];
        const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        for (let i = 0; i < 7; i++) {
            // Usando `text-muted-foreground` e `border-border`
            days.push(
                <div key={i} className="flex-1 text-center font-bold text-muted-foreground py-3 uppercase text-xs">{dayNames[i]}</div>
            );
        }
        return <div className="flex w-full border-b border-border">{days}</div>;
    };

    // renderCells: Células do calendário
    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const rows: React.ReactElement[] = [];
        let days: React.ReactElement[] = [];
        let day = startDate;
        let rowKey = 0;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = new Date(day);
                const formattedDate = format(cloneDay, "d");

                const dayExpenses = expenses.filter((e) => isSameDay(e.date, cloneDay)); 
                const isCurrentMonth = isSameMonth(cloneDay, monthStart);
                const isToday = isSameDay(cloneDay, new Date());
                const isSelected = isSameDay(cloneDay, selectedDate);

                days.push(
                    <div
                        key={cloneDay.toISOString()}
                        onClick={() => setSelectedDate(cloneDay)}
                        onDoubleClick={() => openModalForDate(cloneDay)}
                        className={`
                            flex-1 min-w-0 flex flex-col items-start p-2 h-32 transition-all duration-100 
                            cursor-pointer relative overflow-hidden
                            
                            ${!isCurrentMonth ? "bg-muted/30 text-muted-foreground" : "bg-card text-foreground"} 
                            
                            ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "border-border"}
                            
                            ${isSelected && !isToday ? "bg-accent/60" : "hover:bg-accent"}
                            
                            border-r border-b
                        `}
                        style={{ minHeight: "120px" }}
                    >
                        {/* NÚMERO DO DIA: Adaptação ao tema */}
                        <div className={`text-lg font-medium mb-1 ${!isCurrentMonth ? "text-muted-foreground" : "text-foreground"}`}>{formattedDate}</div>

                        {/* LANÇAMENTOS */}
                        <div className="flex flex-col gap-1 w-full mt-1">
                            {dayExpenses.slice(0, 3).map((event) => (
                                <div
                                    key={event.id}
                                    onClick={(e) => { e.stopPropagation(); openModalForEdit(event); }}
                                    className={`text-[11px] text-white px-1 py-[2px] rounded-sm truncate w-full shadow-md flex justify-between items-center ${event.color} transition-opacity opacity-90 group relative hover:opacity-100 cursor-pointer`}
                                    title={`${event.description} | ${event.type === "income" ? "Receita" : "Despesa"}: R$${event.amount.toFixed(2).replace(".", ",")}`}
                                >
                                    <span className="truncate">{event.description}</span>
                                    <div className="flex items-center">
                                        <span className="font-semibold ml-2 flex-shrink-0">{event.type === "income" ? "+" : "-"}R$ {event.amount.toFixed(2).replace(".", ",")}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteExpense(event.id); }}
                                            className="ml-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity p-0 h-4 w-4 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center"
                                            title="Excluir Lançamento"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Lançamentos extras */}
                        {dayExpenses.length > 3 && <span className="text-xs text-muted-foreground mt-1 cursor-pointer hover:text-primary">+{dayExpenses.length - 3} mais</span>}
                    </div>
                );

                day = addDays(day, 1);
            }

            rows.push(<div key={`row-${rowKey++}`} className="flex w-full">{days}</div>);
            days = [];
        }

        return <div className="mt-0 border-l border-t border-border">{rows}</div>;
    };

    return (
        <div className="bg-card p-4 rounded-xl shadow-lg border border-border">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
};

export default CalendarView;