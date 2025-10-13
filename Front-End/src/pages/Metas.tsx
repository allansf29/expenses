import React, { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { Target, TrendingUp, Calendar, X, Loader2, Edit, List, ArrowDownCircle, Clock, Trash2 } from 'lucide-react';

import Sidebar from './../components/Sidebar'; 
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; 
import SimpleButton from './../components/ui/SimpleButton'; 

import { useGoals } from '../hooks/useGoals';
import type { Goal, GoalFormData } from '../lib/types';


// =================================================================
// Funções Auxiliares
// =================================================================

const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatInputCurrency = (value: string) => {
    return value.replace(/[^0-9,.]/g, "").replace(",", ".");
}

const classNames = (...args: Array<string | false | null | undefined>) =>
    args.filter(Boolean).join(" ");


// =================================================================
// Componente Auxiliar: Formulário de Adicionar Meta (GoalForm)
// =================================================================

interface GoalFormProps {
    onCreateGoal: (data: GoalFormData) => Promise<Goal>; 
    onSuccess: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ onCreateGoal, onSuccess }) => {
    const [formData, setFormData] = useState<GoalFormData>({
        name: '',
        targetAmount: '',
        targetDate: new Date(),
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "targetDate") {
             setFormData(prev => ({ ...prev, [name]: new Date(value) }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const amountFloat = parseFloat(formatInputCurrency(String(formData.targetAmount)));

        if (!formData.name || isNaN(amountFloat) || amountFloat <= 0) {
            alert("Por favor, preencha o nome e um valor alvo válido.");
            return;
        }

        const dataToSave: GoalFormData = {
            name: formData.name,
            targetAmount: amountFloat,
            targetDate: formData.targetDate, 
        };
        
        setIsSaving(true);
        try {
            await onCreateGoal(dataToSave);
            setFormData({ 
                name: '', 
                targetAmount: '', 
                targetDate: new Date(),
            });
            onSuccess();
        } catch (error) {
            alert("Erro ao salvar a meta.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const formattedDate = formData.targetDate instanceof Date && !isNaN(formData.targetDate.getTime()) 
        ? format(formData.targetDate, 'yyyy-MM-dd') 
        : format(new Date(), 'yyyy-MM-dd');

    const formattedAmount = String(formData.targetAmount).replace('.', ',');


    return (
        <Card className="bg-card border border-border shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center text-foreground">
                    <Target className="w-5 h-5 mr-2 text-primary" /> Adicionar Nova Meta
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className='md:col-span-1'>
                        <label htmlFor="name" className="text-muted-foreground font-medium block mb-1">Nome da Meta</label>
                        <input 
                            id="name" name="name" type="text" value={formData.name} onChange={handleChange} 
                            className="w-full p-2 rounded-md bg-input border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 placeholder:text-muted-foreground/60 transition-all" 
                            placeholder="Ex: Viagem, Carro, Aposentadoria" required 
                        />
                    </div>
                    <div>
                        <label htmlFor="targetAmount" className="text-muted-foreground font-medium block mb-1">Valor Alvo (R$)</label>
                        <input 
                            id="targetAmount" name="targetAmount" type="text" value={formattedAmount} onChange={handleChange} 
                            className="w-full p-2 rounded-md bg-input border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 placeholder:text-muted-foreground/60 transition-all" 
                            placeholder="10.000,00" required 
                        />
                    </div>
                    <div>
                        <label htmlFor="targetDate" className="text-muted-foreground font-medium block mb-1">Data Alvo</label>
                        <input 
                            id="targetDate" name="targetDate" type="date" value={formattedDate} onChange={handleChange} 
                            className="w-full p-2 rounded-md bg-input border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all" 
                            required 
                        />
                    </div>
                    <div className='md:col-span-3 pt-2 flex justify-end'>
                        <SimpleButton 
                            type="submit" disabled={isSaving} 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary disabled:opacity-50 transition-colors rounded-lg shadow-md"
                        >
                            {isSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>) : (<><Target className="w-4 h-4 mr-2" /> Salvar Meta</>)}
                        </SimpleButton>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};


// =================================================================
// Componente Auxiliar: Modal de Visualização de Histórico (HistoryModal)
// =================================================================

interface HistoryModalProps {
    goal: Goal;
    onClose: () => void;
    onDeleteContribution: (goalId: string, contributionId: string) => Promise<Goal>; 
}

const HistoryModal: React.FC<HistoryModalProps> = ({ goal, onClose, onDeleteContribution }) => {
    
    const handleDelete = async (contributionId: string, amount: number) => {
        if (!window.confirm(`Tem certeza que deseja excluir esta contribuição de ${formatCurrency(amount)}? O valor será subtraído da meta.`)) {
            return;
        }
        try {
            await onDeleteContribution(goal.id, contributionId);
        } catch (e) {
            alert('Falha ao deletar a contribuição.');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h3 className="text-xl font-bold text-foreground flex items-center">
                        <List className="w-5 h-5 mr-2 text-primary" /> Histórico de Contribuições: {goal.name}
                    </h3>
                    <SimpleButton onClick={onClose} className="p-1 bg-transparent hover:bg-secondary text-muted-foreground rounded-full">
                        <X className="w-5 h-5" />
                    </SimpleButton>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                    {goal.contributions.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">Nenhuma contribuição registrada ainda.</p>
                    ) : (
                        <ul className="space-y-3">
                            {goal.contributions.map((contribution) => (
                                <li key={contribution.id} className="flex justify-between items-center bg-secondary/30 p-3 rounded-lg border-l-4 border-green-500 transition-shadow hover:shadow-md">
                                    <div className="flex items-center">
                                        <ArrowDownCircle className="w-5 h-5 mr-3 text-green-500" />
                                        <div>
                                            <p className="font-semibold text-lg text-foreground">{formatCurrency(contribution.amount)}</p>
                                            <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {contribution.date instanceof Date ? format(contribution.date, 'dd/MM/yyyy HH:mm') : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <SimpleButton 
                                        onClick={() => handleDelete(contribution.id, contribution.amount)} 
                                        className="bg-destructive/10 text-destructive hover:bg-destructive/20 p-2 h-auto w-auto focus:ring-destructive rounded-full"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </SimpleButton>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};


// =================================================================
// Componente Auxiliar: Modal de Edição de Meta (EditModal)
// =================================================================

interface EditModalProps {
    goal: Goal;
    onClose: () => void;
    onEditGoal: (goalId: string, data: GoalFormData) => Promise<Goal>;
}

const EditModal: React.FC<EditModalProps> = ({ goal, onClose, onEditGoal }) => {
    const [formData, setFormData] = useState<GoalFormData>({
        name: goal.name,
        targetAmount: String(goal.targetAmount).replace('.', ','), 
        targetDate: goal.targetDate instanceof Date ? goal.targetDate : new Date(goal.targetDate),
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "targetDate") {
            setFormData(prev => ({ ...prev, [name]: new Date(value) }));
        } else if (name === "targetAmount") {
             setFormData(prev => ({ ...prev, [name]: value }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const amountFloat = parseFloat(formatInputCurrency(String(formData.targetAmount)));

        if (!formData.name || isNaN(amountFloat) || amountFloat <= 0) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        const dataToSave: GoalFormData = {
            name: formData.name,
            targetAmount: amountFloat,
            targetDate: formData.targetDate, 
        };
        
        setIsSaving(true);
        try {
            await onEditGoal(goal.id, dataToSave);
            onClose(); 
        } catch (error) {
            alert("Erro ao editar a meta.");
        } finally {
            setIsSaving(false);
        }
    };

    const formattedDate = format(formData.targetDate, 'yyyy-MM-dd');
    const formattedAmount = String(formData.targetAmount).replace('.', ',');


    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h3 className="text-xl font-bold text-foreground flex items-center">
                        <Edit className="w-5 h-5 mr-2 text-yellow-500" /> Editar Meta: {goal.name}
                    </h3>
                    <SimpleButton onClick={onClose} className="p-1 bg-transparent hover:bg-secondary text-muted-foreground rounded-full">
                        <X className="w-5 h-5" />
                    </SimpleButton>
                </div>
                <div className="p-4">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="edit-name" className="text-muted-foreground font-medium block mb-1">Nome da Meta</label>
                            <input 
                                id="edit-name" name="name" type="text" value={formData.name} onChange={handleChange} 
                                className="w-full p-2 rounded-md bg-input border border-border text-foreground focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500/50 transition-all" 
                                required 
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-targetAmount" className="text-muted-foreground font-medium block mb-1">Valor Alvo (R$)</label>
                            <input 
                                id="edit-targetAmount" name="targetAmount" type="text" value={formattedAmount} onChange={handleChange} 
                                className="w-full p-2 rounded-md bg-input border border-border text-foreground focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500/50 transition-all" 
                                required 
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-targetDate" className="text-muted-foreground font-medium block mb-1">Data Alvo</label>
                            <input 
                                id="edit-targetDate" name="targetDate" type="date" value={formattedDate} onChange={handleChange} 
                                className="w-full p-2 rounded-md bg-input border border-border text-foreground focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500/50 transition-all" 
                                required 
                            />
                        </div>
                        <div className='pt-2 flex justify-end'>
                            <SimpleButton 
                                type="submit" disabled={isSaving} 
                                className="bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500 disabled:opacity-50 transition-colors rounded-lg shadow-md"
                            >
                                {isSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>) : (<><Edit className="w-4 h-4 mr-2" /> Salvar Alterações</>)}
                            </SimpleButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


// =================================================================
// Componente Auxiliar: GoalsList
// =================================================================

const GoalsList: React.FC = () => {
    const { goals, registerContribution, deleteGoal, editGoal, deleteContribution, fetchGoals } = useGoals();
    
    const [contributionInputs, setContributionInputs] = useState<Record<string, string>>({});
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [viewingHistoryGoal, setViewingHistoryGoal] = useState<Goal | null>(null);

    // Garante que o histórico do modal seja atualizado após a exclusão de contribuição
    useEffect(() => {
        if (viewingHistoryGoal) {
            const updatedGoal = goals.find(g => g.id === viewingHistoryGoal.id);
            if (updatedGoal) {
                setViewingHistoryGoal(updatedGoal);
            }
        }
    }, [goals, viewingHistoryGoal]); 

    const handleContribute = useCallback(async (goalId: string) => {
        const inputAmount = contributionInputs[goalId] || '0';
        
        const contributionAmount = parseFloat(formatInputCurrency(inputAmount));
        if (isNaN(contributionAmount) || contributionAmount <= 0) {
            alert("Insira um valor de contribuição válido.");
            return;
        }
        
        try {
            await registerContribution(goalId, contributionAmount);
            setContributionInputs(prev => ({ ...prev, [goalId]: '' }));
        } catch (e) {
            alert('Falha ao registrar a contribuição.');
        }
    }, [contributionInputs, registerContribution]);
    
    const handleDelete = useCallback(async (goalId: string, goalName: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir a meta "${goalName}" e todo o seu histórico de contribuições?`)) return;
        try {
            await deleteGoal(goalId);
            fetchGoals(); 
        } catch (e) {
            alert('Falha ao deletar a meta.');
        }
    }, [deleteGoal, fetchGoals]);

    return (
        <div className="grid grid-cols-1 gap-6">
            {goals.length === 0 ? (
                <p className="text-muted-foreground pt-10 text-center">Nenhuma meta adicionada ainda. Comece a planejar!</p>
            ) : (
                goals.map(goal => {
                    const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                    const daysRemaining = goal.targetDate instanceof Date ? Math.max(0, Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;
                    
                    return (
                        <Card 
                            key={goal.id} 
                            className={classNames(
                                "bg-card border shadow-lg transition-all duration-300",
                                progress >= 100 ? 'border-green-500 shadow-green-500/20' : 'border-border hover:border-primary/50'
                            )}
                        >
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className={classNames("text-2xl font-bold", progress >= 100 ? 'text-green-500' : 'text-foreground')}>
                                    {goal.name} {progress >= 100 && '🚀'}
                                </CardTitle>
                                <div className='flex space-x-2'>
                                    <SimpleButton onClick={() => setViewingHistoryGoal(goal)} className="p-2 h-auto w-auto rounded-full bg-secondary hover:bg-secondary/80 text-primary/80 focus:ring-primary/50">
                                        <List className="w-4 h-4" />
                                    </SimpleButton>
                                    <SimpleButton onClick={() => setEditingGoal(goal)} className="p-2 h-auto w-auto rounded-full bg-secondary hover:bg-secondary/80 text-yellow-500 focus:ring-yellow-500/50">
                                        <Edit className="w-4 h-4" />
                                    </SimpleButton>
                                    <SimpleButton onClick={() => handleDelete(goal.id, goal.name)} className="p-2 h-auto w-auto rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive focus:ring-destructive/50">
                                        <Trash2 className="w-4 h-4" />
                                    </SimpleButton>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-4 text-sm border-b border-border pb-4">
                                    <div className='border-l pl-3 border-secondary'><p className="text-muted-foreground">Alvo Total</p><p className="font-bold text-xl text-primary">{formatCurrency(goal.targetAmount)}</p></div>
                                    <div className='border-l pl-3 border-secondary'><p className="text-muted-foreground">Economizado</p><p className="font-bold text-xl text-green-500">{formatCurrency(goal.currentAmount)}</p></div>
                                    <div className='border-l pl-3 border-secondary'><p className="text-muted-foreground">Faltante</p><p className="font-bold text-xl text-red-500">{formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}</p></div>
                                    <div className='border-l pl-3 border-secondary'>
                                        <p className="text-muted-foreground">Data Alvo</p>
                                        <p className="font-semibold text-base flex items-center text-foreground mt-1">
                                            <Calendar className="w-4 h-4 mr-1 text-primary"/> {daysRemaining} dias
                                        </p>
                                        <p className='text-xs text-muted-foreground'>
                                            {goal.targetDate instanceof Date ? format(goal.targetDate, 'dd/MM/yyyy') : ''}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Barra de Progresso */}
                                <div className="w-full bg-secondary rounded-full h-3 mb-2 relative">
                                    <div 
                                        className={classNames(
                                            "h-3 rounded-full transition-all duration-700 shadow-md",
                                            progress >= 100 ? 'bg-green-500 shadow-green-500/50' : 'bg-primary shadow-primary/50'
                                        )}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-right text-base font-bold text-foreground">{progress.toFixed(1)}% Concluído</p>

                                {/* Área de Contribuição */}
                                {progress < 100 && (
                                    <div className='flex mt-4 pt-4 border-t border-border space-x-3'>
                                        <input 
                                            type="text" 
                                            placeholder="Valor da Contribuição (R$)"
                                            value={contributionInputs[goal.id] || ''}
                                            onChange={(e) => setContributionInputs(prev => ({ 
                                                ...prev, 
                                                [goal.id]: e.target.value.replace(/[^0-9,.]/g, "") 
                                            }))}
                                            className="flex-grow p-2 rounded-md bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                                        />
                                        <SimpleButton onClick={() => handleContribute(goal.id)} className="bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 rounded-lg shadow-md">
                                            <TrendingUp className="w-4 h-4 mr-2" /> Contribuir
                                        </SimpleButton>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })
            )}
            
            {editingGoal && (
                <EditModal 
                    goal={editingGoal} 
                    onClose={() => setEditingGoal(null)} 
                    onEditGoal={editGoal}
                />
            )}
            
            {viewingHistoryGoal && (
                <HistoryModal
                    goal={viewingHistoryGoal}
                    onClose={() => setViewingHistoryGoal(null)}
                    onDeleteContribution={deleteContribution} 
                />
            )}
        </div>
    );
};


// =================================================================
// Componente Principal: MetasPage
// =================================================================

export default function MetasPage() {
    const { createGoal, fetchGoals, isLoading, error } = useGoals();
    
    return (
        // Remove bg fixo para respeitar o tema global
        <div className="min-h-screen font-['Inter']">
            <Sidebar /> 
            <main className="lg:ml-64 overflow-y-auto p-4 sm:p-8">
                <h1 className="text-3xl font-extrabold text-foreground mb-2">Minhas Metas de Poupança</h1>
                <p className="text-muted-foreground mb-6 border-b border-border pb-4">
                    Planeje seus objetivos de longo prazo e acompanhe seu progresso em tempo real.
                </p>

                <div className="space-y-8">
                    <GoalForm onCreateGoal={createGoal} onSuccess={fetchGoals} />

                    {isLoading && (
                        <div className='flex items-center justify-center p-10 text-foreground'>
                            <Loader2 className="w-6 h-6 mr-2 animate-spin text-primary" />
                            Carregando metas...
                        </div>
                    )}
                    
                    {error && (
                        <div className='p-4 bg-destructive/10 border border-destructive/50 text-destructive rounded-lg'>
                            <p className='font-bold'>Erro ao Carregar Dados:</p>
                            <p className='text-sm'>{error}</p>
                        </div>
                    )}
                    
                    {!isLoading && !error && (
                        <>
                            <h2 className="text-2xl font-bold text-foreground pt-4 border-t border-border">Progresso das Metas</h2>
                            <GoalsList />
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}