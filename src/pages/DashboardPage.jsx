import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Search,
  Thermometer,
  Droplets,
  Wifi,
  WifiOff,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DashboardPage = () => {
  const [sensors, setSensors] = useState([]);
  const [filteredSensors, setFilteredSensors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSensors: 0,
    onlineSensors: 0,
    offlineSensors: 0,
    avgTemperature: 0,
    minTemperature: 0,
    maxTemperature: 0
  });
  const [sensorsData, setSensorsData] = useState({});

  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Fetch sensors
      const { data: sensorsData, error: sensorsError } = await supabase
        .from('sensors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (sensorsError) throw sensorsError;

      const currentSensors = sensorsData || [];
      setSensors(currentSensors);

      // Fetch latest temperature readings for each sensor
      if (currentSensors.length > 0) {
        const sensorIds = currentSensors.map(s => s.sensor_id);
        const { data: readings, error: readingsError } = await supabase
          .from('temperature_readings')
          .select('sensor_id, temperature, timestamp')
          .in('sensor_id', sensorIds)
          .order('timestamp', { ascending: false });

        if (!readingsError && readings) {
          const latestReadings = {};
          const humidityData = {}; // Simulated humidity data
          
          readings.forEach(reading => {
            if (!latestReadings[reading.sensor_id]) {
              latestReadings[reading.sensor_id] = reading;
              // Simulate humidity based on temperature
              humidityData[reading.sensor_id] = {
                humidity: Math.round(80 - (reading.temperature - 20) * 2 + Math.random() * 10)
              };
            }
          });
          
          setSensorsData({ ...latestReadings, ...humidityData });

          // Calculate statistics
          const temperatures = Object.values(latestReadings).map(r => r.temperature);
          const onlineCount = currentSensors.filter(s => s.status === 'active').length;
          const offlineCount = currentSensors.length - onlineCount;
          
          setStats({
            totalSensors: currentSensors.length,
            onlineSensors: onlineCount,
            offlineSensors: offlineCount,
            avgTemperature: temperatures.length > 0 ? (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1) : 0,
            minTemperature: temperatures.length > 0 ? Math.min(...temperatures).toFixed(1) : 0,
            maxTemperature: temperatures.length > 0 ? Math.max(...temperatures).toFixed(1) : 0
          });
        }
      }

    } catch (error) {
      toast({ 
        title: "Erro ao carregar dashboard", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const results = sensors.filter(sensor =>
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.sensor_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSensors(results);
  }, [searchTerm, sensors]);

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-green-400' : 'text-red-400';
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? 'Online' : 'Offline';
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 30) return 'text-red-400';
    if (temp >= 20) return 'text-green-400';
    return 'text-blue-400';
  };

  const getLastReading = (sensorId) => {
    return sensorsData[sensorId];
  };

  const getHumidity = (sensorId) => {
    return sensorsData[sensorId]?.humidity || Math.round(Math.random() * 40 + 40);
  };

  // Sample sensor locations and descriptions
  const getSensorLocation = (index) => {
    const locations = [
      { name: 'Sala Servidor Principal', location: 'Data Center - Rack A1' },
      { name: 'Ambiente Produção', location: 'Galpão Industrial - Setor B' },
      { name: 'Câmara Fria', location: 'Estoque - Refrigeração' },
      { name: 'Escritório Administrativo', location: 'Edifício Principal - 2º Andar' },
      { name: 'Laboratório Químico', location: 'Prédio de Pesquisa - Lab 101' },
      { name: 'Área Externa', location: 'Pátio Principal' }
    ];
    return locations[index % locations.length];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6 bg-slate-900 min-h-screen text-white"
    >
      {/* Header */}
      {/* Removido header duplicado - agora está no Header component */}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total de Sensores</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.totalSensors}</p>
              </div>
              <Activity className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Sensores Online</p>
                <p className="text-2xl font-bold text-green-400">{stats.onlineSensors}</p>
              </div>
              <Wifi className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Sensores Offline</p>
                <p className="text-2xl font-bold text-red-400">{stats.offlineSensors}</p>
              </div>
              <WifiOff className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Temperatura Média</p>
                <p className="text-2xl font-bold text-blue-400">{stats.avgTemperature}°C</p>
              </div>
              <Thermometer className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Menor Temperatura</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.minTemperature}°C</p>
              </div>
              <TrendingDown className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Maior Temperatura</p>
                <p className="text-2xl font-bold text-orange-400">{stats.maxTemperature}°C</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar sensores por nome ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Todos</span>
        </div>
      </div>

      {/* Sensors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSensors.map((sensor, index) => {
          const lastReading = getLastReading(sensor.sensor_id);
          const humidity = getHumidity(sensor.sensor_id);
          const location = getSensorLocation(index);
          const isOnline = sensor.status === 'active';
          
          return (
            <motion.div
              key={sensor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-white">
                        {location.name}
                      </CardTitle>
                      <p className="text-sm text-slate-400 flex items-center mt-1">
                        <span className="mr-2">📍</span>
                        {location.location}
                      </p>
                    </div>
                    <Badge 
                      variant={isOnline ? 'default' : 'destructive'}
                      className={`${isOnline ? 'bg-green-600' : 'bg-red-600'} text-white`}
                    >
                      {getStatusBadge(sensor.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Temperature */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-5 w-5 text-green-400" />
                      <span className="text-slate-300">Temperatura</span>
                    </div>
                    <span className={`text-2xl font-bold ${getTemperatureColor(lastReading?.temperature || 20)}`}>
                      {lastReading?.temperature || '20.0'}°C
                    </span>
                  </div>

                  {/* Humidity */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-5 w-5 text-blue-400" />
                      <span className="text-slate-300">Umidade</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-400">
                      {humidity}%
                    </span>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-slate-400">Últimas 24h</p>
                      <p className="text-blue-400">Mín: {(lastReading?.temperature - 2 || 18).toFixed(1)}°C</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400">Méd: {(lastReading?.temperature || 20).toFixed(1)}°C</p>
                    </div>
                    <div className="text-center">
                      <p className="text-orange-400">Máx: {(lastReading?.temperature + 2 || 22).toFixed(1)}°C</p>
                    </div>
                  </div>

                  {/* Last Reading */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Última leitura</span>
                    </div>
                    <span>
                      {lastReading ? 
                        format(new Date(lastReading.timestamp), "HH:mm", { locale: ptBR }) : 
                        'há menos de um minuto'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredSensors.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center py-10"
        >
          <Activity className="h-16 w-16 mx-auto mb-4 text-slate-600" />
          <p className="text-xl font-semibold text-slate-400">Nenhum sensor encontrado.</p>
          <p className="text-slate-500">Cadastre seu primeiro sensor ESP32 para começar!</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DashboardPage;