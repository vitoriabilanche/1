import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';

const SensorForm = ({ sensor, onSave, onClose }) => {
  const [sensorId, setSensorId] = useState(sensor?.sensor_id || '');
  const [name, setName] = useState(sensor?.name || '');
  const [description, setDescription] = useState(sensor?.description || '');
  const [status, setStatus] = useState(sensor?.status || 'active');
  const { toast } = useToast();

  const generateRandomSensorId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ESP32_';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSensorId(result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sensorId.trim()) {
      toast({ 
        title: "Erro", 
        description: "O ID do sensor é obrigatório.", 
        variant: "destructive" 
      });
      return;
    }

    if (!name.trim()) {
      toast({ 
        title: "Erro", 
        description: "O nome do sensor é obrigatório.", 
        variant: "destructive" 
      });
      return;
    }

    await onSave({ 
      sensor_id: sensorId.trim(),
      name: name.trim(), 
      description: description.trim() || null, 
      status 
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="sensorId">ID do Sensor (ESP32)</Label>
        <div className="flex space-x-2">
          <Input 
            id="sensorId" 
            value={sensorId} 
            onChange={(e) => setSensorId(e.target.value)} 
            placeholder="Ex: ESP32_A1B2C3D4" 
            required 
            disabled={!!sensor} // Disable editing for existing sensors
            className="flex-1"
          />
          {!sensor && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={generateRandomSensorId}
              className="whitespace-nowrap"
            >
              Gerar ID
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {sensor ? 'O ID não pode ser alterado após o cadastro.' : 'Use um identificador único para seu ESP32.'}
        </p>
      </div>

      <div>
        <Label htmlFor="sensorName">Nome do Sensor</Label>
        <Input 
          id="sensorName" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Ex: Sensor Escritório" 
          required 
        />
      </div>

      <div>
        <Label htmlFor="sensorDescription">Descrição (Opcional)</Label>
        <Textarea 
          id="sensorDescription" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Ex: Sensor localizado no escritório principal, próximo à janela..." 
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="sensorStatus">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="sensorStatus">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {sensor ? 'Salvar Alterações' : 'Cadastrar Sensor'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SensorForm;