import React, { useState, useEffect } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Heart, Flame, Moon, Brain, AlertCircle, Loader } from 'lucide-react';

export default function GarminDashboard() {
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  const defaultStats = {
    steps: 5080, stepsGoal: 10000, activeCalories: 147, restingHeartRate: 48,
    maxHeartRate: 104, deepSleep: 64, lightSleep: 220, remSleep: 79, totalSleep: 363,
    sleepGoal: 480, distance: 4.23, activeTime: 111, avgStress: 28, vo2Max: 38
  };

  const weeklyData = [
    { day: 'Lun', steps: 9200 },
    { day: 'Mar', steps: 7850 },
    { day: 'Mié', steps: 11200 },
    { day: 'Jue', steps: 8950 },
    { day: 'Vie', steps: 10500 },
    { day: 'Sab', steps: 12100 },
    { day: 'Dom', steps: 5080 }
  ];

  const heartData = [
    { time: '00:00', hr: 58 },
    { time: '06:00', hr: 62 },
    { time: '12:00', hr: 75 },
    { time: '18:00', hr: 82 },
    { time: '23:59', hr: 68 }
  ];

  const sleepData = [
    { day: 'Lun', sleep: 7.2 },
    { day: 'Mar', sleep: 6.8 },
    { day: 'Mié', sleep: 8.1 },
    { day: 'Jue', sleep: 7.9 },
    { day: 'Vie', sleep: 7.5 },
    { day: 'Sab', sleep: 8.3 },
    { day: 'Dom', sleep: 6 }
  ];

  const activities = [
    { name: 'Ciclismo', value: 35, color: '#3b82f6' },
    { name: 'Correr', value: 25, color: '#ef4444' },
    { name: 'Fuerza', value: 20, color: '#f59e0b' },
    { name: 'Otros', value: 20, color: '#10b981' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const HA_TOKEN = process.env.NEXT_PUBLIC_HA_TOKEN;
      const url = "http://homeassistant.local:8123";
      const sensors = {
        steps: 'sensor.garmin_connect_steps',
        activeCalories: 'sensor.garmin_connect_active_calories',
        restingHeartRate: 'sensor.garmin_connect_resting_heart_rate',
        maxHeartRate: 'sensor.garmin_connect_max_heart_rate',
        deepSleep: 'sensor.garmin_connect_deep_sleep',
        lightSleep: 'sensor.garmin_connect_light_sleep',
        remSleep: 'sensor.garmin_connect_rem_sleep',
        totalSleep: 'sensor.garmin_connect_total_sleep_duration',
        distance: 'sensor.garmin_connect_wellness_distance',
        activeTime: 'sensor.garmin_connect_active_time',
        avgStress: 'sensor.garmin_connect_average_stress_level',
        vo2Max: 'sensor.garmin_connect_vo2_max'
      };

      try {
        const data = {};
        for (const [key, sensorId] of Object.entries(sensors)) {
          const res = await fetch(`${url}/api/states/${sensorId}`, {
            headers: { Authorization: `Bearer ${HA_TOKEN}` }
          });
          if (res.ok) {
            const state = await res.json();
            data[key] = parseFloat(state.state) || state.state;
          }
        }
        if (Object.keys(data).length > 0) {
          setTodayStats({ ...defaultStats, ...data });
        } else {
          setTodayStats(defaultStats);
          setError('Datos de prueba');
        }
      } catch (err) {
        setTodayStats(defaultStats);
        setError('Datos de prueba');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const analyzeAndRecommend = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats: todayStats })
      });
      const data = await res.json();
      setRecommendation(data.recommendation || 'Sin respuesta');
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setAnalyzing(false);
  };

  if (loading || !todayStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
        <Loader size={48} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  const stepsProgress = (todayStats.steps / todayStats.stepsGoal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <h1 className="text-4xl font-bold text-white mb-2">Entrenador Personal IA</h1>
      <p className="text-slate-400 mb-8">Análisis Garmin + Recomendaciones</p>

      {error && (
        <div className="mb-6 bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
          <p className="text-sm text-yellow-300">{error}</p>
        </div>
      )}

      <button
        onClick={analyzeAndRecommend}
        disabled={analyzing}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-lg mb-6"
      >
        {analyzing ? <Loader size={24} className="animate-spin" /> : <Brain size={24} />}
        {analyzing ? 'Analizando...' : 'Analizar Entrenamiento'}
      </button>

      {recommendation && (
        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-500 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-3">Recomendación:</h2>
          <p className="text-slate-200">{recommendation}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <Activity size={20} className="text-blue-400 mb-2" />
          <p className="text-slate-400 text-xs">Pasos</p>
          <p className="text-2xl font-bold text-white">{todayStats.steps}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <Flame size={20} className="text-orange-400 mb-2" />
          <p className="text-slate-400 text-xs">Calorías</p>
          <p className="text-2xl font-bold text-white">{Math.round(todayStats.activeCalories)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <Heart size={20} className="text-red-400 mb-2" />
          <p className="text-slate-400 text-xs">FC Reposo</p>
          <p className="text-2xl font-bold text-white">{todayStats.restingHeartRate}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <Moon size={20} className="text-indigo-400 mb-2" />
          <p className="text-slate-400 text-xs">Sueño</p>
          <p className="text-2xl font-bold text-white">{(todayStats.totalSleep / 60).toFixed(1)}h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4">Pasos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b' }} />
              <Bar dataKey="steps" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4">FC</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={heartData}>
              <defs>
                <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b' }} />
              <Area type="monotone" dataKey="hr" stroke="#ef4444" fill="url(#colorHR)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4">Sueño</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sleepData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b' }} />
              <Area type="monotone" dataKey="sleep" stroke="#6366f1" fill="#6366f1" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4">Actividades</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={activities} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                {activities.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
