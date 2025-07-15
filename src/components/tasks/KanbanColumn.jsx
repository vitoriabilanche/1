
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTaskItem from './SortableTaskItem';
import { motion, AnimatePresence } from 'framer-motion';

const KanbanColumn = ({ statusOption, tasks, onEditTask, onDeleteTask, onStatusChange }) => {
  return (
    <div id={statusOption.value} className="bg-gray-100 p-3 rounded-lg flex flex-col h-full min-w-[300px]">
      <h2 className="text-lg font-semibold text-gray-700 mb-3 px-1 flex items-center">
        {statusOption.icon} {statusOption.label} ({tasks.length || 0})
      </h2>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-grow space-y-3 overflow-y-auto pr-1 min-h-[200px]">
          <AnimatePresence>
            {tasks.map(task => (
              <motion.div key={task.id} layout>
                <SortableTaskItem
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStatusChange={onStatusChange}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {tasks.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-4">Nenhuma tarefa aqui.</div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;
