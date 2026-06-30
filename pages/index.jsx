import React, { useState, useEffect } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Heart, Flame, Moon, TrendingUp, AlertCircle, Loader } from 'lucide-react';

export default function GarminDashboard() {
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultStats = {
    steps: 5080, stepsGoal: 10000, activeCalories: 147, restingHeartRate: 48,
    maxHeartRate: 104, deepSleep: 64, lightSleep: 220, remSleep: 79, totalSleep: 363,
    sleepGoal: 480, distance: 4.23, activeTime: 111, avgStress: 28, vo2Max: 38
  };

  const weeklyData = [
    { day: 'Lun', steps: 9200, calories: 2300 },
    { day: 'Mar', steps: 7850, calories: 2100 },
    { day: 'Mié', steps: 11200, calories: 2600 },
    { day: 'Jue', steps: 8950, calories: 2250 },
    { day: 'Vie', steps: 10500, calories: 2450 },
    { day: 'Sab', steps: 12100, calories: 2700 },
    { day: 'Dom', steps: 5080, calories: 2145 }
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
    { day: 'Dom', sleep: 6.0 }
  ];

  const activitiesData = [
    { name: 'Ciclismo', value: 35, color: '#3b82f6' },
    { name: 'Correr', value: 25, color: '#ef4444' },
    { name: 'Fuerza', value: 20, color: '#f59e0b' },
    { name: 'Otros', value: 20, color: '#10b981' }
  ];

  useEffect(() => {
    setTodayStats(defaultStats);
    setLoading(false);
  }, []);

  if (loading || !todayStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
        <Loader size={48} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  const stepsProgress = (todayStats.steps / todayStats.stepsGoal) * 100;
  const sleepProgress = (todayStats.totalSleep / todayStats.sleepGoal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <h1 className="text-4xl font-bold text-white mb-2">Entrenador Personal IA</h1>
      <p className="text-slate-400 mb-8">Análisis Garmin + Recomendaciones inteligentes</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700">
          <div className="flex items-start gap-3 mb-3">
            <Activity size={20} className="text-blue-400" />
            <span className="text-xs font-semibold text-slate-400">{Math.round(stepsProgress)}%</span>
          </div>
          <p className="text-slate-400 text-xs uppercase font-bold mb-2">Pasos</p>
          <p className="text-2xl font-bold text-white mb-3">{todayStats.steps}</p>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(stepsProgress, 100)}%` }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700">
          <div className="flex items-start gap-3 mb-3">
            <Flame size={20} className="text-orange-400" />
          </div>
          <p className="text-slate-400 text-xs uppercase font-bold mb-2">Calorías Activas</p>
          <p className="text-2xl font-bold text-white">{Math.round(todayStats.activeCalories)}</p>
          <p className="text-xs text-slate-500 mt-3">kcal</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700">
          <div className="flex items-start gap-3 mb-3">
            <Heart size={20} className="text-red-400" />
          </div>
          <p className="text-slate-400 text-xs uppercase font-bold mb-2">FC en Reposo</p>
          <p className="text-2xl font-bold text-white">{todayStats.restingHeartRate}</p>
          <p className="text-xs text-slate-500 mt-3">bpm</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700">
          <div className="flex items-start gap-3 mb-3">
            <Moon size={20} className="text-indigo-400" />
            <span className="text-xs font-semibold text-slate-400">{Math.round(sleepProgress)}%</span>
          </div>
          <p className="text-slate-400 text-xs uppercase font-bold mb-2">Sueño</p>
          <p className="text-2xl font-bold text-white">{(todayStats.totalSleep / 60).toFixed(1)}</p>
          <p className="text-xs text-slate-500 mt-3">hrs</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-2">FC Máxima</p>
          <p className="text-xl font-bold text-red-400">{todayStats.maxHeartRate}</p>
          <p className="text-xs text-slate-500 mt-1">bpm</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-2">VO₂ Máximo</p>
          <p className="text-xl font-bold text-cyan-400">{todayStats.vo2Max}</p>
          <p className="text-xs text-slate-500 mt-1">ml/kg/min</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Distancia</p>
          <p className="text-xl font-bold text-emerald-400">{todayStats.distance.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">km</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Nivel Estrés</p>
          <p className="text-xl font-bold text-yellow-400">{todayStats.avgStress}</p>
          <p className="text-xs text-slate-500 mt-1">0-100</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={20} className="text-blue-400" />
            Pasos de la Semana
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Bar dataKey="steps" fill="#3b82f6" name="Pasos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Heart size={20} className="text-red-400" />
            FC durante el Día
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={heartData}>
              <defs>
                <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[50, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="hr" stroke="#ef4444" fillOpacity={1} fill="url(#colorHR)" name="BPM" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Moon size={20} className="text-indigo-400" />
            Calidad de Sueño
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sleepData}>
              <defs>
                <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="sleep" stroke="#6366f1" fillOpacity={1} fill="url(#colorSleep)" name="Horas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-400" />
            Distribución de Actividades
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={activitiesData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {activitiesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
