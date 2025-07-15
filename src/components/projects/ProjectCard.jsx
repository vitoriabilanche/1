
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit3, Trash2, Briefcase, CalendarDays, CheckCircle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ProjectCard = ({ project, onEdit, onDelete, onNavigate }) => {
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return dateString; 
    }
  };

  return (
    <motion.div variants={cardVariants} initial="initial" animate="animate" exit="exit" layout>
      <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-semibold text-gray-700">{project.name}</CardTitle>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary" onClick={() => onEdit(project)}>
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-destructive" onClick={() => onDelete(project)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-sm text-gray-500 h-12 overflow-hidden text-ellipsis">
            {project.description || "Sem descrição."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-500">Progresso</span>
              <span className="text-xs font-semibold text-primary">{project.progress || 0}%</span>
            </div>
            <Progress value={project.progress || 0} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center"><Briefcase className="h-3.5 w-3.5 mr-1.5 text-gray-400"/>Tarefas: {project.totalTasks || 0}</div>
            <div className="flex items-center"><CheckCircle className="h-3.5 w-3.5 mr-1.5 text-gray-400"/>Concluídas: {project.completedTasks || 0}</div>
            <div className="flex items-center"><CalendarDays className="h-3.5 w-3.5 mr-1.5 text-gray-400"/>Início: {formatDate(project.start_date)}</div>
            <div className="flex items-center"><CalendarDays className="h-3.5 w-3.5 mr-1.5 text-gray-400"/>Fim: {formatDate(project.end_date)}</div>
          </div>
            <p className="text-xs text-gray-500 mt-2"><RotateCcw className="inline h-3 w-3 mr-1" /> Atualizado: {format(parseISO(project.updated_at), "dd/MM/yy HH:mm", { locale: ptBR })}</p>
            <p className="text-xs text-gray-500 mt-1">Status: <span className={cn("font-medium", 
                project.status === "Concluído" ? "text-green-600" : 
                project.status === "Em Andamento" ? "text-blue-600" :
                project.status === "Cancelado" ? "text-red-600" :
                "text-primary"
            )}>{project.status}</span></p>
        </CardContent>
        <CardFooter>
          <Button onClick={onNavigate} className="w-full bg-primary/90 hover:bg-primary text-white">
            Ver Detalhes
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;
