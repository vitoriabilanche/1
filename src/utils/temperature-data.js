
// Keep functions that don't directly interact with storage/API
// Functions related to localStorage or direct data mutation are removed 
// or will be handled by the useTemperatureData hook using Supabase.

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para filtrar dados por período de tempo (remains the same)
export const filterDataByTimeRange = (data, timeRange) => {
  if (!data || data.length === 0) return [];
  if (timeRange === 'todos') return data;

  const now = new Date().getTime();
  let timeLimit;

  switch (timeRange) {
    case 'hora':
      timeLimit = now - 60 * 60 * 1000; // 1 hora
      break;
    case 'dia':
      timeLimit = now - 24 * 60 * 60 * 1000; // 1 dia
      break;
    case 'semana':
      timeLimit = now - 7 * 24 * 60 * 60 * 1000; // 1 semana
      break;
    case 'mês':
      timeLimit = now - 30 * 24 * 60 * 60 * 1000; // 30 dias (aproximado)
      break;
    default:
      return data;
  }
  // Filter based on local timestamp (already converted in the hook)
  return data.filter(item => item.timestamp >= timeLimit);
};

// Função para calcular estatísticas dos dados de temperatura (remains the same)
export const calculateTemperatureStats = (data) => {
  if (!data || data.length === 0) {
    return { average: 'N/A', min: 'N/A', max: 'N/A', count: 0 };
  }

  const temperatures = data.map(item => item.temperature);
  const sum = temperatures.reduce((acc, temp) => acc + temp, 0);
  const average = sum / temperatures.length;
  const min = Math.min(...temperatures);
  const max = Math.max(...temperatures);

  return {
    average: average.toFixed(1),
    min: min.toFixed(1),
    max: max.toFixed(1),
    count: data.length
  };
};

// Função para gerar dados de exemplo (remains the same, generates local timestamps)
export const generateSampleData = () => {
  const now = new Date().getTime();
  const sampleData = [];
  const daysToGenerate = 7; // Generate for last 7 days for less overwhelming sample
  
  for (let i = daysToGenerate * 24; i >= 0; i--) { // Iterate hourly for 7 days
    const timestamp = now - i * 60 * 60 * 1000; // Timestamp decreases going back in time
    const date = new Date(timestamp);
    const hourOfDay = date.getHours();
    
    // Simulate daily temperature fluctuation (cooler at night, warmer mid-day)
    const baseTemp = 18; // Base temperature
    const dailyVariation = Math.sin(((hourOfDay - 6 + 24) % 24) * Math.PI / 12) * 8; // Peak around 2 PM (14:00)
    
    // Add some random noise
    const randomVariation = (Math.random() - 0.5) * 3; 
    
    const temperature = baseTemp + dailyVariation + randomVariation;
    
    sampleData.push({
      timestamp, // Local timestamp (milliseconds since epoch)
      temperature: parseFloat(temperature.toFixed(1))
    });
  }
  // Sort data chronologically just in case loop order isn't perfect
  return sampleData.sort((a, b) => a.timestamp - b.timestamp); 
};

// Formatting function for chart tooltips/axes if needed
export const formatTimestamp = (timestamp, formatType = 'hora') => {
   const date = new Date(timestamp);
   switch (formatType) {
     case 'dia':
     case 'semana':
     case 'mês':
       return format(date, 'dd/MM', { locale: ptBR });
     case 'hora':
     default:
       return format(date, 'HH:mm', { locale: ptBR });
   }
};
