
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Thermometer } from "lucide-react";

const TemperatureForm = ({ onAddTemperature, disabled = false }) => {
  const [temperature, setTemperature] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!temperature || isNaN(parseFloat(temperature))) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma temperatura válida.",
        variant: "destructive",
      });
      return;
    }

    const newTemperatureData = {
      temperature: parseFloat(temperature),
      timestamp: new Date().getTime(),
    };

    onAddTemperature(newTemperatureData);
    setTemperature("");
    
    toast({
      title: "Sucesso",
      description: "Temperatura adicionada com sucesso!",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperatura (°C)</Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Thermometer className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="Ex: 25.5"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="pl-10"
                disabled={disabled}
              />
            </div>
            <Button type="submit" disabled={disabled}>
              {disabled ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Adicione manualmente uma leitura de temperatura para este sensor.
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default TemperatureForm;
