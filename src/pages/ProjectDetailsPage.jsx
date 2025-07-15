
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';

import TaskForm from '@/components/tasks/TaskForm';
import KanbanColumn from '@/components/tasks/KanbanColumn';
import { taskStatusOptions } from '@/components/tasks/taskUtils';
import DeleteTaskDialog from '@/components/tasks/DeleteTaskDialog';


const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState(
    taskStatusOptions.reduce((acc, statusOpt) => {
      acc[statusOpt.value] = [];
      return acc;
    }, {})
  );
  
  const [loading, setLoading] = useState(true);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const fetchProjectDetails = useCallback(async () => {
    if (!user || !projectId) return;
    setLoading(true);
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError || !projectData) throw projectError || new Error("Projeto não encontrado ou acesso negado.");
      setProject(projectData);

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true }); 
      
      if (tasksError) throw tasksError;
      const currentTasks = tasksData || [];
      setTasks(currentTasks);
      
      const newColumns = taskStatusOptions.reduce((acc, statusOpt) => {
        acc[statusOpt.value] = currentTasks.filter(task => task.status === statusOpt.value);
        return acc;
      }, {});
      setColumns(newColumns);

    } catch (error) {
      toast({ title: "Erro ao buscar detalhes do projeto", description: error.message, variant: "destructive" });
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [user, projectId, toast, navigate]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleSaveTask = async (taskData, taskId) => {
    try {
      let response;
      if (taskId) { 
        response = await supabase.from('tasks').update(taskData).eq('id', taskId).select().single();
        toast({ title: "Sucesso", description: "Tarefa atualizada!" });
      } else { 
        response = await supabase.from('tasks').insert(taskData).select().single();
        toast({ title: "Sucesso", description: "Tarefa criada!" });
      }
      if (response.error) throw response.error;
      
      await fetchProjectDetails(); // Re-fetch to ensure data consistency

      setIsTaskFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      toast({ title: "Erro ao salvar tarefa", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskToDelete);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Tarefa excluída." });
      
      await fetchProjectDetails(); // Re-fetch

    } catch (error) {
      toast({ title: "Erro ao excluir tarefa", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleteConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

  const openTaskFormForNew = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const openTaskFormForEdit = (task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const openDeleteConfirm = (taskId) => {
    setTaskToDelete(taskId);
    setIsDeleteConfirmOpen(true);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
  
    if (!over) return; // Dropped outside a valid target
  
    const activeId = active.id;
    const overId = over.id; // This could be a column ID or a task ID
  
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;
  
    const oldStatus = activeTask.status;
    let newStatus = oldStatus;
  
    // Determine if dropped on a column or a task in a column
    if (taskStatusOptions.some(opt => opt.value === overId)) { // Dropped on a column
      newStatus = overId;
    } else { // Dropped on a task, infer column from that task
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      } else {
        // If over.id is not a column and not a task, it might be a more complex scenario
        // or an invalid drop. For now, we assume it's a column if not a task.
        // This part might need refinement based on exact dnd-kit behavior with your setup.
        const columnId = over.data.current?.sortable?.containerId;
        if (columnId && taskStatusOptions.some(opt => opt.value === columnId)) {
            newStatus = columnId;
        } else {
            return; // Invalid drop target
        }
      }
    }
  
    if (oldStatus === newStatus && activeId === overId) return; // No change or dropped on itself
  
    // Optimistic UI Update
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(t => 
        t.id === activeId ? { ...t, status: newStatus, completed_at: newStatus === 'Concluído' ? new Date().toISOString() : null } : t
      );
      const newCols = taskStatusOptions.reduce((acc, statusOpt) => {
        acc[statusOpt.value] = updatedTasks.filter(task => task.status === statusOpt.value);
        return acc;
      }, {});
      setColumns(newCols);
      return updatedTasks;
    });
  
    // Update task status in Supabase
    try {
      const updateData = { 
        status: newStatus, 
        updated_at: new Date().toISOString(),
        completed_at: newStatus === 'Concluído' ? new Date().toISOString() : null 
      };
      if (newStatus !== 'Concluído') { // Ensure completed_at is nulled if not completed
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', activeId);
      if (error) throw error;
      toast({ title: "Status da Tarefa Atualizado", description: `Tarefa movida para ${newStatus}.` });
    } catch (error) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
      fetchProjectDetails(); // Revert UI change on error
    }
  };
  

  const handleTaskStatusChange = async (taskId, newStatus) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) return;

    const oldStatus = taskToUpdate.status;
    
    // Optimistic UI update
    setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(t => 
            t.id === taskId ? { ...t, status: newStatus, completed_at: newStatus === 'Concluído' ? new Date().toISOString() : null } : t
        );
        const newCols = taskStatusOptions.reduce((acc, statusOpt) => {
            acc[statusOpt.value] = updatedTasks.filter(task => task.status === statusOpt.value);
            return acc;
        }, {});
        setColumns(newCols);
        return updatedTasks;
    });

    try {
        const updateData = { 
            status: newStatus, 
            updated_at: new Date().toISOString(),
            completed_at: newStatus === 'Concluído' ? new Date().toISOString() : null
        };
        if (newStatus !== 'Concluído') {
            updateData.completed_at = null;
        }

        const { error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', taskId);
        if (error) throw error;
        toast({ title: "Status da Tarefa Atualizado", description: `Tarefa movida para ${newStatus}.` });
    } catch (error) {
        toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
        fetchProjectDetails(); // Revert
    }
  };


  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando detalhes do projeto...</div>;
  }

  if (!project) {
    return <div className="flex justify-center items-center h-screen">Projeto não encontrado.</div>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-6 space-y-6 h-full flex flex-col"
      >
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/projects')} className="mb-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Projetos
          </Button>
          <Button onClick={openTaskFormForNew} className="bg-primary hover:bg-primary/90 text-white">
            <PlusCircle className="mr-2 h-5 w-5" /> Nova Tarefa
          </Button>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">{project.name}</CardTitle>
            <CardDescription className="text-gray-600">{project.description || "Sem descrição detalhada para este projeto."}</CardDescription>
             <div className="text-sm text-gray-500 mt-2">
                Status: <span className="font-semibold text-primary">{project.status}</span> | 
                Início: <span className="font-semibold">{project.start_date ? format(parseISO(project.start_date), 'dd/MM/yy') : 'N/A'}</span> | 
                Fim: <span className="font-semibold">{project.end_date ? format(parseISO(project.end_date), 'dd/MM/yy') : 'N/A'}</span>
             </div>
          </CardHeader>
        </Card>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {taskStatusOptions.map(statusOption => (
            <KanbanColumn
              key={statusOption.value}
              statusOption={statusOption}
              tasks={columns[statusOption.value] || []}
              onEditTask={openTaskFormForEdit}
              onDeleteTask={openDeleteConfirm}
              onStatusChange={handleTaskStatusChange}
            />
          ))}
        </div>

        <Dialog open={isTaskFormOpen} onOpenChange={(isOpen) => { setIsTaskFormOpen(isOpen); if (!isOpen) setEditingTask(null); }}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
            </DialogHeader>
            <TaskForm 
              task={editingTask} 
              projectId={projectId}
              onSave={handleSaveTask} 
              onClose={() => { setIsTaskFormOpen(false); setEditingTask(null); }} 
            />
          </DialogContent>
        </Dialog>

        <DeleteTaskDialog
            isOpen={isDeleteConfirmOpen}
            onOpenChange={setIsDeleteConfirmOpen}
            onConfirmDelete={handleDeleteTask}
        />
      </motion.div>
    </DndContext>
  );
};

export default ProjectDetailsPage;
