import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import { DollarSign, X, Edit, ArrowDown, ArrowUp, Calendar as CalendarIcon, Repeat, Trash2 } from "lucide-react";
import axios from "axios";
import type { Expense, ExpenseFormData } from "../lib/types.ts";
import { API_URL, colorOptions } from "../lib/constants.ts"; 
import { createLocalDayDate } from "../lib/dateUtils.ts";
import SimpleButton from "../components/ui/SimpleButton.tsx";


interface UseExpenseFormProps {
    expenses: Expense[];
    selectedDate: Date;
    fetchExpensesFromServer: () => Promise<Expense[]>;
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

export function useExpenseForm({ expenses, selectedDate, fetchExpensesFromServer, setExpenses }: UseExpenseFormProps) {
    const initialFormData: ExpenseFormData = {
        id: null,
        amount: "",
        description: "",
        date: format(selectedDate, "yyyy-MM-dd"),
        type: "expense",
        color: colorOptions[0].value,
        isRecurrence: false, 
        frequency: 'monthly', 
        installments: '6', 
    };
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalFormData, setModalFormData] = useState<ExpenseFormData>(initialFormData);
    
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [expenseToDeleteId, setExpenseToDeleteId] = useState<string | null>(null);

    const updateFormData = useCallback((field: keyof ExpenseFormData, value: any) => 
        setModalFormData((prev) => ({ ...prev, [field]: value })), []);

    const createExpenseOnServer = async (payload: any) => (await axios.post(API_URL, payload)).data;
    const createRecurrenceOnServer = async (payload: any) => (await axios.post(`${API_URL}/recurrence`, payload)).data;
    const updateExpenseOnServer = async (id: string, payload: any) => (await axios.put(`${API_URL}/${id}`, payload)).data;
    const deleteExpenseOnServer = async (id: string) => await axios.delete(`${API_URL}/${id}`);

    const closeModal = useCallback(() => {
        setModalFormData({
            ...initialFormData,
            date: format(selectedDate, "yyyy-MM-dd"),
        });
        setIsModalOpen(false);
    }, [selectedDate]);

    const openModalForDate = useCallback((date: Date) => {
        setModalFormData({
            ...initialFormData,
            date: format(date, "yyyy-MM-dd"),
        });
        setIsModalOpen(true);
    }, []);

    const openModalForEdit = useCallback((expense: Expense) => {
        setModalFormData({
            ...initialFormData,
            id: expense.id,
            amount: expense.amount.toFixed(2).replace(".", ","),
            description: expense.description,
            date: format(expense.date, "yyyy-MM-dd"),
            type: expense.type,
            color: expense.color,
        });
        setIsModalOpen(true);
    }, []);

    const openConfirmModal = useCallback((id: string) => {
        setExpenseToDeleteId(id);
        setIsConfirmModalOpen(true);
        setIsModalOpen(false); 
    }, []);

    const closeConfirmModal = useCallback(() => {
        setIsConfirmModalOpen(false);
        setExpenseToDeleteId(null);
    }, []);

    const handleSaveExpense = useCallback(async () => {
        const amountFloat = parseFloat(modalFormData.amount.replace(",", "."));
        if (modalFormData.description.trim() === "" || isNaN(amountFloat) || amountFloat <= 0) {
            console.error("Erro: insira descrição e valor válidos.");
            return;
        }

        const basePayload = {
            description: modalFormData.description,
            amount: amountFloat,
            type: modalFormData.type,
            color: modalFormData.color,
            date: modalFormData.date, 
        };

        try {
            if (modalFormData.id) {
                await updateExpenseOnServer(modalFormData.id, basePayload);
            } else if (modalFormData.isRecurrence) {
                const recurrencePayload = {
                    ...basePayload,
                    frequency: modalFormData.frequency,
                    installments: parseInt(modalFormData.installments) || 0,
                };
                await createRecurrenceOnServer(recurrencePayload);
            } else {
                await createExpenseOnServer(basePayload);
            }
            
            const fresh = await fetchExpensesFromServer();
            setExpenses(fresh); 
            closeModal(); 
        } catch (err) {
            console.error("Erro ao salvar lançamento:", err);
        }
    }, [modalFormData, fetchExpensesFromServer, setExpenses, closeModal]);

    const confirmDeletion = useCallback(async () => {
        if (!expenseToDeleteId) { closeConfirmModal(); return; }
        try {
            await deleteExpenseOnServer(expenseToDeleteId);
            const fresh = await fetchExpensesFromServer();
            setExpenses(fresh); 
        } catch (err) {
            console.error("Erro ao deletar lançamento:", err);
        }
        closeConfirmModal();
    }, [expenseToDeleteId, fetchExpensesFromServer, setExpenses, closeConfirmModal]);

    const handleDeleteExpense = useCallback((id: string) => { 
        openConfirmModal(id); 
    }, [openConfirmModal]);

    const handleExportCSV = useCallback(() => {
        if (expenses.length === 0) {
            console.error("Não há lançamentos para exportar.");
            return;
        }

        const header = ["ID", "Data", "Tipo", "Valor", "Descrição", "Cor_Tag"];
        const rows: string[] = [];
        rows.push(header.join(";"));

        expenses.forEach((e) => {
            const id = e.id;
            const dateStr = format(e.date, "dd/MM/yyyy");
            const typeLabel = e.type === "income" ? "Receita" : "Despesa";
            const amountStr = e.amount.toFixed(2).replace(".", ",");
            const descSafe = e.description.replace(/"/g, '""').replace(/;/g, ",");
            const colorTag = e.color.replace(/^bg-/, "");
            rows.push([id, dateStr, typeLabel, amountStr, `"${descSafe}"`, colorTag].join(";"));
        });

        const csvContent = rows.join("\n");
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `financas_export_${format(new Date(), "ddMMyyyy")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [expenses]);


    const renderModal = () => {
        if (!isModalOpen) return null;
        const isEditing = modalFormData.id !== null;
        const modalTitle = isEditing ? `Editar Lançamento: #${modalFormData.id}` : `Novo Lançamento em ${format(createLocalDayDate(modalFormData.date), "dd/MM/yyyy")}`;

        return (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                <div className="bg-card border border-border text-foreground rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-border pb-3 mb-4 sticky top-0 bg-card z-10">
                        <h3 className="text-xl text-foreground font-bold">{modalTitle}</h3>
                        <SimpleButton onClick={closeModal} className="bg-transparent text-muted-foreground hover:text-foreground p-1 h-auto w-auto focus:ring-ring"><X className="w-5 h-5" /></SimpleButton>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-foreground mb-2 block font-medium">Tipo de Lançamento</label>
                            <div className="flex gap-3">
                                <SimpleButton type="button" onClick={() => updateFormData("type", "expense")} className={`flex-1 p-3 rounded-md border text-center ${modalFormData.type === "expense" ? "bg-red-700 border-red-700 text-white shadow-xl focus:ring-red-500" : "bg-secondary border-border text-foreground hover:bg-accent"}`}><ArrowDown className="w-4 h-4 mr-2 inline-block" /> Despesa</SimpleButton>
                                <SimpleButton type="button" onClick={() => updateFormData("type", "income")} className={`flex-1 p-3 rounded-md border text-center ${modalFormData.type === "income" ? "bg-green-700 border-green-700 text-white shadow-xl focus:ring-green-500" : "bg-secondary border-border text-foreground hover:bg-accent"}`}><ArrowUp className="w-4 h-4 mr-2 inline-block" /> Receita</SimpleButton>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="amount" className="text-foreground font-medium">Valor (R$)</label>
                            <input id="amount" type="text" value={modalFormData.amount} onChange={(e) => updateFormData("amount", e.target.value.replace(/[^0-9,.]/g, ""))} className="w-full mt-1 p-2 rounded-md bg-input border border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary" placeholder="0,00" />
                        </div>

                        <div>
                            <label htmlFor="description" className="text-foreground font-medium">Descrição/Categoria</label>
                            <input id="description" value={modalFormData.description} onChange={(e) => updateFormData("description", e.target.value)} className="w-full mt-1 p-2 rounded-md bg-input border border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Ex: Aluguel, Salário, Uber" />
                        </div>

                        <div>
                            <label className="text-foreground mb-3 block font-medium">Cor de Destaque</label>
                            <div className="flex gap-3 flex-wrap">
                                {colorOptions.map((c) => (
                                    <button key={c.value} type="button" onClick={() => updateFormData("color", c.value)} 
                                        className={`w-10 h-10 rounded-full border-2 transition-all shadow-md cursor-pointer ${c.value} ${modalFormData.color === c.value ? "border-primary ring-2 ring-offset-2 ring-offset-card" : "border-transparent opacity-60 hover:opacity-100"}`} title={c.label} />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="date-input" className="text-foreground font-medium">Data</label>
                            <div className="relative mt-1">
                                <input id="date-input" type="date" value={modalFormData.date} onChange={(e) => updateFormData("date", e.target.value)} className="w-full p-2 rounded-md bg-input border border-input text-foreground focus:border-primary focus:ring-1 focus:ring-primary pr-10" />
                                <CalendarIcon className="h-4 w-4 absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>

                        {!isEditing && modalFormData.type === "expense" && (
                            <div className="border-t border-border pt-4 mt-2">
                                <div className="flex items-center mb-3">
                                    <input 
                                        id="is-recurrence" 
                                        type="checkbox" 
                                        checked={modalFormData.isRecurrence} 
                                        onChange={(e) => {
                                            updateFormData("isRecurrence", e.target.checked);
                                            if (!e.target.checked) {
                                                updateFormData("frequency", 'monthly');
                                                updateFormData("installments", '6');
                                            }
                                        }}
                                        className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary mr-2"
                                    />
                                    <label htmlFor="is-recurrence" className="text-sm font-medium text-foreground flex items-center">
                                        <Repeat className="w-4 h-4 mr-1 text-primary"/>
                                        Parcelamento ou Recorrência
                                    </label>
                                </div>

                                {modalFormData.isRecurrence && (
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label htmlFor="frequency" className="text-muted-foreground text-sm">Frequência</label>
                                            <select 
                                                id="frequency" 
                                                value={modalFormData.frequency} 
                                                onChange={(e) => updateFormData("frequency", e.target.value)}
                                                className="w-full mt-1 p-2 rounded-md bg-input border border-input text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="monthly">Mensal</option>
                                                <option value="weekly">Semanal</option>
                                                <option value="daily">Diária</option>
                                            </select>
                                        </div>

                                        <div className="flex-1">
                                            <label htmlFor="installments" className="text-muted-foreground text-sm">Nº de Parcelas (0 para Contínuo)</label>
                                            <input 
                                                id="installments" 
                                                type="number" 
                                                value={modalFormData.installments} 
                                                onChange={(e) => updateFormData("installments", e.target.value)}
                                                className="w-full mt-1 p-2 rounded-md bg-input border border-input text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                                                placeholder="Ex: 6"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
                            <SimpleButton onClick={closeModal} className="bg-secondary border border-border text-foreground hover:bg-accent focus:ring-ring">Cancelar</SimpleButton>
                            <SimpleButton onClick={handleSaveExpense} className={`text-primary-foreground focus:ring-primary ${modalFormData.id ? "bg-purple-600 hover:bg-purple-700" : "bg-primary hover:bg-primary/90"}`}>{modalFormData.id ? (<><Edit className="w-4 h-4 mr-2 inline-block" /> Atualizar Lançamento</>) : (<><DollarSign className="w-4 h-4 mr-2 inline-block" /> Salvar Lançamento</>)}</SimpleButton>
                        </div>

                        {modalFormData.id && (<div className="flex justify-start pt-2">
                            <SimpleButton onClick={() => handleDeleteExpense(modalFormData.id!)} className="bg-destructive/10 border border-destructive/50 text-destructive hover:bg-destructive/20 focus:ring-destructive">
                                <Trash2 className="w-4 h-4 mr-2 inline-block" /> Excluir permanentemente
                            </SimpleButton>
                        </div>)}
                    </div>
                </div>
            </div>
        );
    };

    const renderConfirmationModal = () => {
        if (!isConfirmModalOpen || expenseToDeleteId === null) return null;
        const expenseToConfirm = expenses.find((e) => e.id === expenseToDeleteId);
        if (!expenseToConfirm) { closeConfirmModal(); return null; }
        const { description, amount, type, date } = expenseToConfirm;

        return (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                <div className="bg-card border border-destructive/50 text-foreground rounded-xl shadow-2xl p-6 w-full max-w-sm">
                    <div className="flex items-center text-destructive mb-4">
                        <X className="w-6 h-6 mr-2 bg-destructive/10 rounded-full p-1" />
                        <h3 className="text-xl font-bold">Confirmação de Exclusão</h3>
                    </div>

                    <p className="mb-4 text-muted-foreground">Você tem certeza que deseja <strong>excluir</strong> o seguinte lançamento? Esta ação não pode ser desfeita.</p>

                    <div className="p-3 bg-accent rounded-lg mb-6 border border-border">
                        <p className="font-semibold text-lg truncate mb-1">{description}</p>
                        <p className={`text-sm font-medium ${type === "income" ? "text-green-500" : "text-red-500"}`}>{type === "income" ? "RECEITA" : "DESPESA"}: R${amount.toFixed(2).replace(".", ",")}</p>
                        <p className="text-xs text-muted-foreground mt-1">Data: {format(date, "dd/MM/yyyy")}</p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <SimpleButton onClick={closeConfirmModal} className="bg-secondary text-foreground hover:bg-accent focus:ring-ring">Cancelar</SimpleButton>
                        <SimpleButton onClick={confirmDeletion} className="bg-destructive text-destructive-foreground hover:bg-red-700 focus:ring-destructive">Sim, Excluir</SimpleButton>
                    </div>
                </div>
            </div>
        );
    };

    return {
        isModalOpen,
        isConfirmModalOpen,
        modalFormData,
        openModalForDate,
        openModalForEdit,
        handleDeleteExpense,
        handleExportCSV,
        renderModal,
        renderConfirmationModal,
    };
}