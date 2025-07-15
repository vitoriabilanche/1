
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2 p-4 rounded-lg shadow bg-card">
      <Sun className={`h-5 w-5 ${theme === 'light' ? 'text-yellow-500' : 'text-gray-500'}`} />
      <Switch
        id="theme-switch"
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
        aria-label="Mudar tema"
      />
      <Moon className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-500'}`} />
      <Label htmlFor="theme-switch" className="ml-2 text-sm font-medium text-card-foreground">
        Tema {theme === 'dark' ? 'Escuro' : 'Claro'}
      </Label>
    </div>
  );
};

export default ThemeToggle;
