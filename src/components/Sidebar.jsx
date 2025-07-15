import React from 'react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="w-64 bg-slate-800 shadow-lg flex flex-col border-r border-slate-700"
    >
      <div className="h-20 flex items-center justify-center border-b border-slate-700">
         <div className="flex items-center space-x-2">
           <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
             <span className="text-white font-bold text-sm">M</span>
           </div>
           <div>
             <div className="text-xl font-bold text-white">MARK ONE</div>
             <div className="text-xs text-slate-400">Dashboard de Sensores</div>
           </div>
         </div>
      </div>
      
      {/* Área vazia para manter o layout, mas sem navegação */}
      <div className="flex-1 px-4 py-6">
        {/* Pode adicionar informações adicionais aqui se necessário */}
      </div>
      
      <div className="p-4 border-t border-slate-700 mt-auto">
        <p className="text-xs text-slate-400 text-center">© {new Date().getFullYear()} MARK ONE</p>
      </div>
    </motion.div>
  );
};

export default Sidebar;