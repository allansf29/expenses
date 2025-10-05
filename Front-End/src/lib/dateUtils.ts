import { parseISO } from "date-fns";

/**
 * CORREÇÃO DEFINITIVA (BUG DE DATA): Cria um objeto Date forçando a interpretação
 * como uma data local ao meio-dia, o que anula o efeito do fuso horário
 * na mudança do dia.
 * @param dateString string que pode ser "yyyy-MM-dd" ou "yyyy-MM-ddT..."
 * @returns Date
 */
export const createLocalDayDate = (dateString: string): Date => {
  // Pega apenas os primeiros 10 caracteres (YYYY-MM-DD)
  const dateOnly = dateString.substring(0, 10);
  
  // Concatena com T12:00:00 (Meio-dia)
  return parseISO(`${dateOnly}T12:00:00`); 
};