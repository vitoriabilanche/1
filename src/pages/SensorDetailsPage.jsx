import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Thermometer, 
  Wifi, 
  WifiOff, 
  Edit3, 
  Trash2,
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TemperatureChart from '@/components/temperature-chart';
import TimeFilter from '@/components/time-filter';
import TemperatureForm from '@/components/temperature-form';
import { filterDataByTimeRange, calculateTemperatureStats } from '@/utils/temperature-data';

const SensorDetailsPage = () => {
  const { sensorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [sensor, setSensor] = useState(null);
  const [readings, setReadings] = useState([]);
  const [filteredReadings, setFilteredReadings] = useState([]);
  const [timeRange, setTimeRange] = useState('dia');
  const [stats, setStats] = useState({ average: 'N/A', min: 'N/A', max: 'N/A', count: 0 });
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [isAddingTemperature, setIsAddingTemperature] = useState(false);

  const fetchSensorDetails = useCallback(async () => {
    if (!user || !sensorId) return;
    setLoading(true);
    
    try {
      // Fetch sensor info
      const { data: sensorData, error: sensorError } = await supabase
        .from('sensors')
        .select('*')
        .eq('id', sensorId)
        .eq('user_id', user.id)
        .single();

      if (sensorError || !sensorData) {
        throw sensorError || new Error("Sensor não encontrado ou acesso negado.");
      }
      
      setSensor(sensorData);

      // Fetch temperature readings
      const { data: readingsData, error: readingsError } = await supabase
        .from('temperature_readings')
        .select('temperature, timestamp')
        .eq('sensor_id', sensorData.sensor_id)
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true });

      if (readingsError) throw readingsError;

      const formattedReadings = (readingsData || []).map(reading => ({
        ...reading,
        timestamp: new Date(reading.timestamp).getTime()
      }));

      setReadings(formattedReadings);

      // Generate alerts for temperatures outside normal range (15-30°C)
      const temperatureAlerts = formattedReadings
        .filter(reading => reading.temperature < 15 || reading.temperature > 30)
        .slice(-10) // Last 10 alerts
        .map(reading => ({
          id: `temp_${reading.timestamp}`,
          type: reading.temperature > 30 ? 'high' : 'low',
          temperature: reading.temperature,
          timestamp: reading.timestamp,
          message: reading.temperature > 30 
            ? `Temperatura alta: ${reading.temperature}°C` 
            : `Temperatura baixa: ${reading.temperature}°C`
        }));

      setAlerts(temperatureAlerts);

    } catch (error) {
      toast({ 
        title: "Erro ao buscar detalhes do sensor", 
        description: error.message, 
        variant: "destructive" 
      });
      navigate('/sensors');
    } finally {
      setLoading(false);
    }
  }, [user, sensorId, toast, navigate]);

  useEffect(() => {
    fetchSensorDetails();
  }, [fetchSensorDetails]);

  useEffect(() => {
    const filtered = filterDataByTimeRange(readings, timeRange);
    setFilteredReadings(filtered);
    const newStats = calculateTemperatureStats(filtered);
    setStats(newStats);
  }, [readings, timeRange]);

  const handleAddTemperature = async (tempData) => {
    if (!user || !sensor) return;
    setIsAddingTemperature(true);
    
    try {
      const timestampISO = new Date(tempData.timestamp).toISOString();
      
      const insertData = { 
        user_id: user.id, 
        sensor_id: sensor.sensor_id,
        temperature: tempData.temperature,
        timestamp: timestampISO
      };
      
      const { data, error } = await supabase
        .from('temperature_readings')
        .insert([insertData])
        .select('temperature, timestamp');

      if (error) throw error;

      if (data && data.length > 0) {
        const addedRecord = {
          ...data[0],
          timestamp: new Date(data[0].timestamp).getTime()
        };
        setReadings(prevData => [...prevData, addedRecord]);
        toast({
          title: "Sucesso",
          description: "Temperatura adicionada com sucesso!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao adicionar temperatura",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAddingTemperature(false);
    }
  };
  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-500' : 'bg-gray-400';
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 35) return 'text-red-600';
    if (temp >= 25) return 'text-orange-500';
    if (temp >= 15) return 'text-green-600';
    return 'text-blue-600';
  };

  const getTrendIcon = (current, previous) => {
    if (!previous) return <Minus className="h-4 w-4 text-gray-400" />;
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-blue-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getAlertIcon = (type) => {
    return type === 'high' ? 
      <AlertTriangle className="h-4 w-4 text-red-500" /> : 
      <AlertTriangle className="h-4 w-4 text-blue-500" />;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando detalhes do sensor...</div>;
  }

  if (!sensor) {
    return <div className="flex justify-center items-center h-screen">Sensor não encontrado.</div>;
  }

  const latestReading = readings[readings.length - 1];
  const previousReading = readings[readings.length - 2];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/sensors')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Sensores
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(`/sensors/${sensor.id}/edit`)}>
            <Edit3 className="mr-2 h-4 w-4" /> Editar
          </Button>
        </div>
      </div>

      {/* Sensor Info Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <Thermometer className="mr-3 h-8 w-8 text-primary" />
                {sensor.name}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                ID: {sensor.sensor_id}
              </CardDescription>
              {sensor.description && (
                <p className="text-gray-600 mt-2">{sensor.description}</p>
              )}
            </div>
            <Badge 
              variant={sensor.status === 'active' ? 'default' : 'secondary'}
              className={`${getStatusColor(sensor.status)} text-white`}
            >
              {sensor.status === 'active' ? (
                <><Wifi className="mr-1 h-3 w-3" /> Ativo</>
              ) : (
                <><WifiOff className="mr-1 h-3 w-3" /> Inativo</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Criado em</p>
              <p className="text-lg font-semibold">
                {format(new Date(sensor.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total de Leituras</p>
              <p className="text-lg font-semibold">{readings.length}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Última Leitura</p>
              {latestReading ? (
                <div>
                  <p className={`text-2xl font-bold ${getTemperatureColor(latestReading.temperature)}`}>
                    {latestReading.temperature}°C
                  </p>
                  <div className="flex items-center justify-center mt-1">
                    {getTrendIcon(latestReading.temperature, previousReading?.temperature)}
                    <span className="text-xs text-gray-500 ml-1">
                      {format(new Date(latestReading.timestamp), "HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma leitura</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Temperatura Média</p>
            <p className="text-xl font-bold text-primary">{stats.average}°C</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Temperatura Máxima</p>
            <p className="text-xl font-bold text-red-600">{stats.max}°C</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Temperatura Mínima</p>
            <p className="text-xl font-bold text-blue-600">{stats.min}°C</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Leituras no Período</p>
            <p className="text-xl font-bold text-gray-700">{stats.count}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Chart and Alerts */}
      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chart">Dashboard do Sensor</TabsTrigger>
          <TabsTrigger value="alerts">Alertas ({alerts.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg h-full">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle>Histórico de Temperatura</CardTitle>
                    <div className="w-full sm:w-auto">
                      <TimeFilter value={timeRange} onChange={setTimeRange} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredReadings.length > 0 ? (
                    <TemperatureChart data={filteredReadings} timeFormat={timeRange} />
                  ) : (
                    <div className="h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Control Panel */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Adicionar Leitura</CardTitle>
                  <CardDescription>
                    Adicione uma nova leitura de temperatura para este sensor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TemperatureForm 
                    onAddTemperature={handleAddTemperature}
                    disabled={isAddingTemperature}
                  />
                  <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                    <p className="font-semibold mb-2">Configuração ESP32:</p>
                    <div className="bg-muted p-2 rounded text-xs">
                      <p>Sensor ID: <code className="bg-background px-1 rounded">{sensor.sensor_id}</code></p>
                    </div>
                </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="alerts" className="mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Alertas de Temperatura</CardTitle>
              <CardDescription>
                Temperaturas fora da faixa normal (15°C - 30°C)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getAlertIcon(alert.type)}
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="mr-1 h-3 w-3" />
                            {format(new Date(alert.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                      <Badge variant={alert.type === 'high' ? 'destructive' : 'secondary'}>
                        {alert.type === 'high' ? 'Alta' : 'Baixa'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">Nenhum alerta registrado</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Alertas são gerados quando a temperatura sai da faixa de 15°C a 30°C
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default SensorDetailsPage;