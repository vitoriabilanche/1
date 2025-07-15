
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Edit2, Trash2, CalendarDays, AlertTriangle, CheckCircle2, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/DatePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

const priorityOptions = [
  { value: 'urgent', label: 'Urgente', icon: <AlertTriangle className="h-4 w-4 text-red-500 mr-2" /> },
  { value: 'not_urgent', label: 'Não Urgente', icon: <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> },
];

const importanceOptions = [
  { value: 'important', label: 'Importante', icon: <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" /> },
  { value: 'not_important', label: 'Não Importante', icon: <CheckCircle2 className="h-4 w-4 text-blue-500 mr-2" /> },
];

const TaskForm = ({ task, onSave, onCancel }) => {
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.due_date ? parseISO(task.due_date) : null);
  const [priority, setPriority] = useState(task?.priority || 'not_urgent');
  const [importance, setImportance] = useState(task?.importance || 'not_important');
  const { theme } = useTheme();
  const inputBg = theme === 'light' ? 'bg-white' : 'bg-slate-700';
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-gray-100';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description) return;
    onSave({
      id: task?.id,
      description,
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
      priority,
      importance,
      is_completed: task?.is_completed || false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description" className={cn("block text-sm font-medium mb-1", textColor)}>Descrição da Tarefa</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Preparar relatório mensal"
          required
          className={cn("w-full", inputBg, textColor)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="dueDate" className={cn("block text-sm font-medium mb-1", textColor)}>Data de Entrega</Label>
          <DatePicker date={dueDate} setDate={setDueDate} buttonClassName={cn(inputBg, textColor)} placeholder="Opcional"/>
        </div>
        <div>
          <Label htmlFor="priority" className={cn("block text-sm font-medium mb-1", textColor)}>Prioridade</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className={cn("w-full", inputBg, textColor)}>
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center">{opt.icon} {opt.label}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="importance" className={cn("block text-sm font-medium mb-1", textColor)}>Importância</Label>
          <Select value={importance} onValueChange={setImportance}>
            <SelectTrigger className={cn("w-full", inputBg, textColor)}>
              <SelectValue placeholder="Selecione a importância" />
            </SelectTrigger>
            <SelectContent>
              {importanceOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center">{opt.icon} {opt.label}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} className={cn(theme === 'dark' ? "border-slate-600 hover:bg-slate-700" : "")}>Cancelar</Button>
        <Button type="submit">Salvar Tarefa</Button>
      </DialogFooter>
    </form>
  );
};

const PlanningPage = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-slate-800';
  const textColor = theme === 'light' ? 'text-gray-700' : 'text-gray-100';
  const descriptionColor = theme === 'light' ? 'text-gray-500' : 'text-gray-400';
  const borderColor = theme === 'light' ? 'border-gray-200' : 'border-slate-700';

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      toast({ title: "Erro ao buscar tarefas", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSaveTask = async (taskData) => {
    try {
      const taskPayload = { ...taskData, user_id: user.id };
      let response;
      if (taskData.id) { // Editing existing task
        response = await supabase.from('tasks').update(taskPayload).eq('id', taskData.id).select();
      } else { // Creating new task
        response = await supabase.from('tasks').insert(taskPayload).select();
      }
      
      const { data, error } = response;
      if (error) throw error;
      
      toast({ title: `Tarefa ${taskData.id ? 'atualizada' : 'adicionada'} com sucesso!`, description: data[0].description });
      fetchTasks(); // Refresh list
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      toast({ title: "Erro ao salvar tarefa", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      toast({ title: "Tarefa excluída com sucesso!" });
      fetchTasks();
    } catch (error) {
      toast({ title: "Erro ao excluir tarefa", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !task.is_completed })
        .eq('id', task.id);
      if (error) throw error;
      toast({ title: `Tarefa marcada como ${!task.is_completed ? 'concluída' : 'pendente'}.` });
      fetchTasks();
    } catch (error) {
      toast({ title: "Erro ao atualizar status da tarefa", description: error.message, variant: "destructive" });
    }
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const openNewForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };
  
  const getPriorityStyles = (priority) => {
    if (priority === 'urgent') return 'border-l-4 border-red-500';
    return 'border-l-4 border-green-500';
  };

  const getImportanceStyles = (importance) => {
    if (importance === 'important') return 'font-semibold';
    return '';
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.is_completed;
    if (filter === 'completed') return task.is_completed;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className={cn("text-3xl font-bold", textColor)}>Planejamento de Tarefas</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewForm}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Tarefa</Button>
          </DialogTrigger>
          <DialogContent className={cn("sm:max-w-[625px]", cardBg)}>
            <DialogHeader>
              <DialogTitle className={textColor}>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
              <DialogDescription className={descriptionColor}>
                {editingTask ? 'Atualize os detalhes da sua tarefa.' : 'Adicione uma nova tarefa à sua lista.'}
              </DialogDescription>
            </DialogHeader>
            <TaskForm 
              task={editingTask} 
              onSave={handleSaveTask} 
              onCancel={() => { setIsFormOpen(false); setEditingTask(null); }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className={cn(cardBg, "shadow-lg")}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className={textColor}>Minhas Tarefas</CardTitle>
          <div className="flex items-center space-x-2">
            <ListFilter className={cn("h-5 w-5", descriptionColor)} />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className={cn("w-[180px]", theme === 'dark' ? 'bg-slate-700 border-slate-600' : '')}>
                <SelectValue placeholder="Filtrar tarefas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p className={descriptionColor}>Carregando tarefas...</p>}
          {!isLoading && filteredTasks.length === 0 && (
            <p className={cn("text-center py-8", descriptionColor)}>Nenhuma tarefa encontrada. Que tal adicionar uma?</p>
          )}
          {!isLoading && filteredTasks.length > 0 && (
            <ul className="space-y-3">
              {filteredTasks.map(task => (
                <li key={task.id} className={cn("p-4 rounded-md flex items-start justify-between transition-all hover:shadow-md", cardBg, borderColor, getPriorityStyles(task.priority), task.is_completed ? 'opacity-60' : '')}>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.is_completed}
                      onCheckedChange={() => handleToggleComplete(task)}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor={`task-${task.id}`} className={cn("font-medium cursor-pointer", textColor, getImportanceStyles(task.importance), task.is_completed ? 'line-through' : '')}>
                        {task.description}
                      </Label>
                      <div className={cn("text-xs mt-1 space-x-2", descriptionColor)}>
                        {task.due_date && (
                          <span className="flex items-center">
                            <CalendarDays className="h-3 w-3 mr-1" />
                            {format(parseISO(task.due_date), "dd/MM/yyyy")}
                          </span>
                        )}
                        <span className="flex items-center">
                          {priorityOptions.find(p => p.value === task.priority)?.icon}
                          {priorityOptions.find(p => p.value === task.priority)?.label}
                        </span>
                         <span className="flex items-center">
                          {importanceOptions.find(p => p.value === task.importance)?.icon}
                          {importanceOptions.find(p => p.value === task.importance)?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditForm(task)} className={cn(theme === 'dark' ? "hover:bg-slate-700" : "")}>
                      <Edit2 className={cn("h-4 w-4", descriptionColor)} />
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn(theme === 'dark' ? "hover:bg-slate-700" : "")}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className={cardBg}>
                            <DialogHeader>
                                <DialogTitle className={textColor}>Confirmar Exclusão</DialogTitle>
                                <DialogDescription className={descriptionColor}>
                                    Tem certeza que deseja excluir a tarefa "{task.description}"? Esta ação não pode ser desfeita.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" className={cn(theme === 'dark' ? "border-slate-600 hover:bg-slate-700" : "")}>Cancelar</Button>
                                </DialogClose>
                                <Button variant="destructive" onClick={() => handleDeleteTask(task.id)}>Excluir</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlanningPage;
