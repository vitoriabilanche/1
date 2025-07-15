
import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { motion } from "framer-motion";
import { formatTimestamp } from '@/utils/temperature-data'; // Import formatter

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Use formatTimestamp for consistent display
    const formattedLabel = formatTimestamp(label, 'hora'); // Assuming label is timestamp
    return (
      <div className="bg-white p-3 rounded-md shadow-lg border border-gray-200">
        <p className="font-medium text-gray-900">{formattedLabel}</p>
        <p className="text-primary font-semibold">{`Temperatura: ${payload[0].value}°C`}</p>
      </div>
    );
  }
  return null;
};

const TemperatureChart = ({ data, timeFormat = "hora" }) => {
  // Use the utility function for formatting axis ticks
  const formatXAxis = (timestamp) => formatTimestamp(timestamp, timeFormat);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[400px] p-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatXAxis} 
            stroke="#888888"
            type="number" // Important: Specify type as number for time series
            domain={['dataMin', 'dataMax']} // Ensure domain covers data range
            scale="time" // Use time scale
          />
          <YAxis 
            label={{ 
              value: 'Temperatura (°C)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#888888' }
            }} 
            stroke="#888888"
            domain={['auto', 'auto']} // Auto-scale Y axis
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={false} // Simpler look without dots
            activeDot={{ r: 6, strokeWidth: 1 }}
            name="Temperatura"
            isAnimationActive={true} // Enable animation
            animationDuration={500} // Adjust animation speed
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default TemperatureChart;
