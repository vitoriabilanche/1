import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  Search, 
  Thermometer, 
  Wifi, 
  WifiOff, 
  Eye, 
  Edit3, 
  Trash2,
  Activity,
  Clock,
  AlertTriangle
} from 'lucide-react';
import SensorForm from '@/components/sensors/SensorForm';
import DeleteSensorDialog from '@/components/sensors/DeleteSensorDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SensorsPage = () => {
  const [sensors, setSensors] = useState([]);
  const [filteredSensors, setFilteredSensors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState(null);
  const [sensorToDelete, setSensorToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [sensorsData, setSensorsData] = useState({});

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchSensors = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sensors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSensors(data || []);
      
      // Fetch latest temperature readings for each sensor
      if (data && data.length > 0) {
        const sensorIds = data.map(s => s.sensor_id);
        const { data: readings, error: readingsError } = await supabase
          .from('temperature_readings')
          .select('sensor_id, temperature, timestamp')
          .in('sensor_id', sensorIds)
          .order('timestamp', { ascending: false });

        if (!readingsError && readings) {
          const latestReadings = {};
          readings.forEach(reading => {
            if (!latestReadings[reading.sensor_id]) {
              latestReadings[reading.sensor_id] = reading;
            }
          });
          setSensorsData(latestReadings);
        }
      }

    } catch (error) {
      toast({ 
        title: "Erro ao buscar sensores", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchSensors();
  }, [fetchSensors]);

  useEffect(() => {
    const results = sensors.filter(sensor =>
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.sensor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sensor.description && sensor.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSensors(results);
  }, [searchTerm, sensors]);

  const handleSaveSensor = async (sensorData) => {
    try {
      let response;
      const dataToSave = {
        ...sensorData,
        user_id: user.id,
      };

      if (editingSensor) {
        response = await supabase
          .from('sensors')
          .update(dataToSave)
          .eq('id', editingSensor.id)
          .select()
          .single();
        toast({ title: "Sucesso", description: "Sensor atualizado!" });
      } else {
        response = await supabase
          .from('sensors')
          .insert(dataToSave)
          .select()
          .single();
        toast({ title: "Sucesso", description: "Sensor cadastrado!" });
      }

      if (response.error) throw response.error;
      
      await fetchSensors();
      setIsFormOpen(false);
      setEditingSensor(null);
    } catch (error) {
      toast({ 
        title: "Erro ao salvar sensor", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteSensor = async () => {
    if (!sensorToDelete) return;
    try {
      // First delete all temperature readings for this sensor
      await supabase
        .from('temperature_readings')
        .delete()
        .eq('sensor_id', sensorToDelete.sensor_id);

      // Then delete the sensor
      const { error } = await supabase
        .from('sensors')
        .delete()
        .eq('id', sensorToDelete.id);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Sensor excluído." });
      await fetchSensors();
    } catch (error) {
      toast({ 
        title: "Erro ao excluir sensor", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsDeleteConfirmOpen(false);
      setSensorToDelete(null);
    }
  };

  const openFormForNew = () => {
    setEditingSensor(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (sensor) => {
    setEditingSensor(sensor);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (sensor) => {
    setSensorToDelete(sensor);
    setIsDeleteConfirmOpen(true);
  };

  const getLastReading = (sensorId) => {
    return sensorsData[sensorId];
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

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando sensores...</div>;
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
          <h1 className="text-3xl font-bold text-gray-800">Meus Sensores</h1>
          <p className="text-gray-600">Gerencie seus sensores de temperatura ESP32.</p>
        </div>
        <Button onClick={openFormForNew} className="bg-primary hover:bg-primary/90 text-white">
          <PlusCircle className="mr-2 h-5 w-5" /> Novo Sensor
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar sensores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:w-1/3"
        />
      </div>

      <AnimatePresence>
        {filteredSensors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSensors.map((sensor) => {
              const lastReading = getLastReading(sensor.sensor_id);
              return (
                <motion.div
                  key={sensor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                >
                  <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                            <Thermometer className="mr-2 h-5 w-5 text-primary" />
                            {sensor.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-500 mt-1">
                            ID: {sensor.sensor_id}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
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
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {sensor.description && (
                        <p className="text-sm text-gray-600">{sensor.description}</p>
                      )}
                      
                      {lastReading ? (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Última leitura:</span>
                            <span className={`text-2xl font-bold ${getTemperatureColor(lastReading.temperature)}`}>
                              {lastReading.temperature}°C
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="mr-1 h-3 w-3" />
                            {format(new Date(lastReading.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Nenhuma leitura disponível</p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        <p>Criado em: {format(new Date(sensor.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/sensors/${sensor.id}`)}
                          className="flex-1"
                        >
                          <Eye className="mr-1 h-4 w-4" /> Ver Detalhes
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openFormForEdit(sensor)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openDeleteConfirm(sensor)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          !loading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-10 text-gray-500"
            >
              <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl font-semibold">Nenhum sensor encontrado.</p>
              <p>Cadastre seu primeiro sensor ESP32 para começar!</p>
            </motion.div>
          )
        )}
      </AnimatePresence>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { 
        setIsFormOpen(isOpen); 
        if (!isOpen) setEditingSensor(null); 
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingSensor ? 'Editar Sensor' : 'Novo Sensor'}</DialogTitle>
            <DialogDescription>
              {editingSensor ? 'Atualize as informações do seu sensor.' : 'Cadastre um novo sensor ESP32.'}
            </DialogDescription>
          </DialogHeader>
          <SensorForm 
            sensor={editingSensor} 
            onSave={handleSaveSensor} 
            onClose={() => { setIsFormOpen(false); setEditingSensor(null); }} 
          />
        </DialogContent>
      </Dialog>
      
      <DeleteSensorDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        sensorToDelete={sensorToDelete}
        onConfirmDelete={handleDeleteSensor}
      />
    </motion.div>
  );
};

export default SensorsPage;