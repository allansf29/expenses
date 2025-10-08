import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { Goal, GoalFormData } from '../lib/types';

const GOALS_ENDPOINT = '/goals'; // endpoint específico de metas

export const useGoals = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Converte a data e as contribuições do formato string (do JSON) para Date
    const mapGoalData = (data: any) => ({
        ...data,
        targetDate: new Date(data.targetDate),
        contributions: data.contributions.map((c: any) => ({ ...c, date: new Date(c.date) })),
    });

    // Função que busca todas as metas
    const fetchGoals = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Usa a api e apenas o endpoint específico
            const response = await api.get(GOALS_ENDPOINT); 
            
            setGoals(response.data.map(mapGoalData));
        } catch (err) {
            console.error('Error fetching goals:', err);
            setError("Erro ao carregar as metas. Verifique se o servidor Back-end está rodando na porta 5000.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    // Criação de Meta - ATUALIZADO (O Front-end chamará fetchGoals após o sucesso)
    const createGoal = async (data: GoalFormData): Promise<Goal> => {
        try {
            const response = await api.post(GOALS_ENDPOINT, data);
            const newGoal = mapGoalData(response.data);         
            return newGoal; // Apenas retorna a nova meta
        } catch (err) {
            console.error('Error creating goal:', err);
            throw new Error('Falha ao criar a meta.');
        }
    };
    
    const editGoal = async (goalId: string, data: GoalFormData): Promise<Goal> => {
        try {
            const response = await api.put(`${GOALS_ENDPOINT}/${goalId}`, data);
            const updatedGoal = mapGoalData(response.data);
            setGoals(prevGoals => 
                prevGoals.map(goal => goal.id === goalId ? updatedGoal : goal)
            );
            return updatedGoal;
        } catch (err) {
            console.error('Error editing goal:', err);
            throw new Error('Falha ao editar a meta.');
        }
    };

    const deleteGoal = async (goalId: string): Promise<void> => {
        try {
            await api.delete(`${GOALS_ENDPOINT}/${goalId}`);          
        } catch (err) {
            console.error('Error deleting goal:', err);
            throw new Error('Falha ao deletar a meta.');
        }
    };


    // Registro de Contribuição
    const registerContribution = async (goalId: string, amount: number): Promise<Goal> => {
        try {
            const response = await api.post(`${GOALS_ENDPOINT}/${goalId}/contribute`, { amount });
            const updatedGoal = mapGoalData(response.data);

            setGoals(prevGoals => 
                prevGoals.map(goal => goal.id === goalId ? updatedGoal : goal)
            );
            return updatedGoal;
        } catch (err) {
            console.error('Error registering contribution:', err);
            throw new Error('Falha ao registrar a contribuição.');
        }
    };

    // Exclusão de Contribuição
    const deleteContribution = async (goalId: string, contributionId: string): Promise<Goal> => {
        try {
            // Usa DELETE no endpoint específico que remove a contribuição e atualiza a meta
            const response = await api.delete(`${GOALS_ENDPOINT}/${goalId}/contribute/${contributionId}`); 
            
            // O Back-end retorna a Goal atualizada, mapeamos e atualizamos o estado
            const updatedGoal = mapGoalData(response.data);

            setGoals(prevGoals => 
                prevGoals.map(goal => goal.id === goalId ? updatedGoal : goal)
            );
            return updatedGoal;
        } catch (err) {
            console.error('Error deleting contribution:', err);
            throw new Error('Falha ao deletar a contribuição.');
        }
    };

    return {
        goals,
        isLoading,
        error,
        fetchGoals, // ESSENCIAL: Deve ser chamado após createGoal e deleteGoal
        createGoal,
        editGoal,
        deleteGoal,
        registerContribution,
        deleteContribution,
    };
};