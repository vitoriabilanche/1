
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Briefcase } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectForm from '@/components/projects/ProjectForm';
import DeleteProjectDialog from '@/components/projects/DeleteProjectDialog';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          tasks (
            id,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Fetch error from Supabase:", error);
        // Não lançar erro aqui se for "relation does not exist" durante a configuração inicial
        if (!error.message.includes("does not exist")) {
            throw error;
        } else {
            // Se a tabela não existe, apenas loga e continua com array vazio
            console.warn("Tabela 'projects' ou relação com 'tasks' pode não existir ainda.");
            setProjects([]);
            setFilteredProjects([]);
            setLoading(false);
            return;
        }
      }
      
      const projectsWithProgress = data.map(p => {
        const totalTasks = p.tasks?.length || 0;
        const completedTasks = p.tasks?.filter(t => t.status === 'Concluído').length || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return { ...p, progress, totalTasks, completedTasks };
      });

      setProjects(projectsWithProgress);
      setFilteredProjects(projectsWithProgress);
    } catch (error) {
      toast({ title: "Erro ao buscar projetos", description: `Detalhes: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);


  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const results = projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProjects(results);
  }, [searchTerm, projects]);

  const handleSaveProject = async (projectData) => {
    if (!user) {
      toast({ title: "Erro de Autenticação", description: "Usuário não autenticado.", variant: "destructive" });
      return;
    }

    try {
      let response;
      const dataToSave = {
        ...projectData,
        user_id: user.id, 
        updated_at: new Date().toISOString(),
      };

      if (editingProject) {
        response = await supabase.from('projects').update(dataToSave).eq('id', editingProject.id).select().single();
        toast({ title: "Sucesso", description: "Projeto atualizado!" });
      } else {
        dataToSave.created_at = new Date().toISOString(); 
        response = await supabase.from('projects').insert(dataToSave).select().single();
        toast({ title: "Sucesso", description: "Projeto criado!" });
      }

      if (response.error) {
        console.error("Error saving project:", response.error);
        throw response.error;
      }
      
      await fetchProjects(); 
      setIsFormOpen(false);
      setEditingProject(null);
    } catch (error) {
      toast({ title: "Erro ao salvar projeto", description: error.message, variant: "destructive" });
    }
  };
  
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectToDelete.id);
      if (error) throw error;

      toast({ title: "Sucesso", description: "Projeto excluído." });
      const newProjects = projects.filter(p => p.id !== projectToDelete.id);
      setProjects(newProjects);
      setFilteredProjects(newProjects);

    } catch (error) {
      toast({ title: "Erro ao excluir projeto", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleteConfirmOpen(false);
      setProjectToDelete(null);
    }
  };

  const openFormForNew = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };
  
  const openDeleteConfirm = (project) => {
    setProjectToDelete(project);
    setIsDeleteConfirmOpen(true);
  };

  if (loading && projects.length === 0) {
    return <div className="flex justify-center items-center h-full">Carregando projetos...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Meus Projetos</h1>
          <p className="text-gray-600">Gerencie seus projetos e tarefas.</p>
        </div>
        <Button onClick={openFormForNew} className="bg-primary hover:bg-primary/90 text-white">
          <PlusCircle className="mr-2 h-5 w-5" /> Novo Projeto
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar projetos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:w-1/3"
        />
      </div>

      <AnimatePresence>
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onEdit={openFormForEdit} 
                onDelete={openDeleteConfirm} 
                onNavigate={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 text-gray-500">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl font-semibold">Nenhum projeto encontrado.</p>
              <p>Crie seu primeiro projeto para começar!</p>
            </motion.div>
          )
        )}
      </AnimatePresence>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if (!isOpen) setEditingProject(null); }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
            <DialogDescription>
              {editingProject ? 'Atualize os detalhes do seu projeto.' : 'Preencha as informações para criar um novo projeto.'}
            </DialogDescription>
          </DialogHeader>
          <ProjectForm 
            project={editingProject} 
            onSave={handleSaveProject} 
            onClose={() => { setIsFormOpen(false); setEditingProject(null); }} 
          />
        </DialogContent>
      </Dialog>
      
      <DeleteProjectDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        projectToDelete={projectToDelete}
        onConfirmDelete={handleDeleteProject}
      />
    </motion.div>
  );
};

export default ProjectsPage;
