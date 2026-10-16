import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd/MM/yyyy", { locale: fr });
};
