
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { taskStatusOptions, taskPriorityOptions } from './taskUtils';

const TaskForm = ({ task, projectId, onSave, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'A Fazer');
  const [priority, setPriority] = useState(task?.priority || 'Média');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [assignedToName, setAssignedToName] = useState(task?.assigned_to_name || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Erro", description: "O nome da tarefa é obrigatório.", variant: "destructive" });
      return;
    }

    const taskData = {
      project_id: projectId,
      user_id: user.id,
      name,
      description,
      status,
      priority,
      due_date: dueDate || null,
      assigned_to_name: assignedToName.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (!task) { 
      taskData.created_at = new Date().toISOString();
    }
    
    if (status === 'Concluído' && (!task || task.status !== 'Concluído')) {
      taskData.completed_at = new Date().toISOString();
    } else if (status !== 'Concluído') {
      taskData.completed_at = null;
    }

    await onSave(taskData, task?.id);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="taskName">Nome da Tarefa</Label>
        <Input id="taskName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Desenvolver API de usuários" required />
      </div>
      <div>
        <Label htmlFor="taskDescription">Descrição</Label>
        <Textarea id="taskDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes da tarefa..." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="taskStatus">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="taskStatus">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {taskStatusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="taskPriority">Prioridade</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="taskPriority">
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              {taskPriorityOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="taskDueDate">Data de Entrega</Label>
          <Input id="taskDueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="taskAssignedTo">Responsável (Nome)</Label>
          <Input id="taskAssignedTo" value={assignedToName} onChange={(e) => setAssignedToName(e.target.value)} placeholder="Nome do responsável" />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">{task ? 'Salvar Tarefa' : 'Criar Tarefa'}</Button>
      </DialogFooter>
    </form>
  );
};

export default TaskForm;
