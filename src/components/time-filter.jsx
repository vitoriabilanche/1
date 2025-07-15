
import React from "react";
import { motion } from "framer-motion";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const TimeFilter = ({ value, onChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full"
    >
      <div className="space-y-2">
        <Label htmlFor="time-filter">Período de Tempo</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="time-filter" className="w-full">
            <SelectValue placeholder="Selecione um período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hora">Última Hora</SelectItem>
            <SelectItem value="dia">Último Dia</SelectItem>
            <SelectItem value="semana">Última Semana</SelectItem>
            <SelectItem value="mês">Último Mês</SelectItem>
            <SelectItem value="todos">Todos os Dados</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
};

export default TimeFilter;
