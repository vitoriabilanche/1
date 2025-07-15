
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit3, Trash2, GripVertical } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { taskStatusOptions } from './taskUtils'; // Import options

const SortableTaskItem = ({ task, onEdit, onDelete, onStatusChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    boxShadow: isDragging ? '0 10px 20px rgba(0,0,0,0.1)' : undefined,
  };
  const currentStatusOption = taskStatusOptions.find(opt => opt.value === task.status);

  const formatDateSafe = (dateString) => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'dd/MM/yy', { locale: ptBR }) : dateString;
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-card p-4 rounded-lg border mb-3 touch-none select-none relative">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <button {...attributes} {...listeners} className="cursor-grab mr-2 text-gray-400 hover:text-gray-600 p-1">
            <GripVertical className="h-5 w-5" />
          </button>
          <h3 className="font-semibold text-gray-800">{task.name}</h3>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-primary" onClick={() => onEdit(task)}>
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-destructive" onClick={() => onDelete(task.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {task.description && <p className="text-sm text-gray-600 mt-1 ml-8">{task.description}</p>}
      <div className="mt-3 ml-8 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 items-center">
        <span>Prioridade: <span className="font-medium text-indigo-600">{task.priority}</span></span>
        {task.due_date && <span>Prazo: {formatDateSafe(task.due_date)}</span>}
        {task.assigned_to_name && <span>Responsável: {task.assigned_to_name}</span>}
      </div>
       <div className="absolute bottom-2 right-2">
         <Select value={task.status} onValueChange={(newStatus) => onStatusChange(task.id, newStatus)}>
            <SelectTrigger className="h-8 text-xs px-2 py-1 w-auto bg-transparent border-none shadow-none focus:ring-0">
              <div className="flex items-center">
                {currentStatusOption?.icon}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {taskStatusOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center">{opt.icon} {opt.label}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
       </div>
    </div>
  );
};

export default SortableTaskItem;
