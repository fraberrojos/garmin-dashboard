import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import { Activity, Heart, Flame, Moon, TrendingUp, Zap, Target, Brain, AlertCircle, Loader, Send, MessageCircle } from 'lucide-react';

export default function GarminDashboard() {
  const HA_TOKEN = process.env.NEXT_PUBLIC_HA_TOKEN;
  const HA_LOCAL_URL = "http://homeassistant.local:8123";
  const HA_REMOTE_URL = "https://lospichus.duckdns.org";

  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [haUrl, setHaUrl] = useState(HA_LOCAL_URL);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const defaultStats = {
    steps: 5080,
    stepsGoal: 10000,
    activeCalories: 147,
    totalCalories: 1470,
    caloriesGoal: 2500,
    restingHeartRate: 48,
    maxHeartRate: 104,
    minHeartRate: 46,
    deepSleep: 64,
    lightSleep: 220,
    remSleep: 79,
    totalSleep: 363,
    sleepGoal: 480,
    distance: 4.23,
    activeTime: 111,
    avgStress: 28,
    vo2Max: 38.0,
    trainingStatus: 'Recuperación'
  };

  const weeklyStepsData = [
    { day: 'Lun', steps: 9200, calories: 2300, activeMin: 50 },
    { day: 'Mar', steps: 7850, calories: 2100, activeMin: 35 },
    { day: 'Mié', steps: 11200, calories: 2600, activeMin: 65 },
    { day: 'Jue', steps: 8950, calories: 2250, activeMin: 45 },
    { day: 'Vie', steps: 10500, calories: 2450, activeMin: 55 },
    { day: 'Sab', steps: 12100, calories: 2700, activeMin: 75 },
    { day: 'Dom', steps: 5080, calories: 2145, activeMin: 45 }
  ];

  const heartRateData = [
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
    const fetchGarminData = async () => {
      setLoading(true);
      setError(null);

      const sensors = {
        steps: 'sensor.garmin_connect_steps',
        activeCalories: 'sensor.garmin_connect_active_calories',
        totalCalories: 'sensor.garmin_connect_wellness_calories',
        restingHeartRate: 'sensor.garmin_connect_resting_heart_rate',
        maxHeartRate: 'sensor.garmin_connect_max_heart_rate',
        minHeartRate: 'sensor.garmin_connect_min_heart_rate',
        deepSleep: 'sensor.garmin_connect_deep_sleep',
        lightSleep: 'sensor.garmin_connect_light_sleep',
        remSleep: 'sensor.garmin_connect_rem_sleep',
        totalSleep: 'sensor.garmin_connect_total_sleep_duration',
        distance: 'sensor.garmin_connect_wellness_distance',
        activeTime: 'sensor.garmin_connect_active_time',
        avgStress: 'sensor.garmin_connect_average_stress_level',
        vo2Max: 'sensor.garmin_connect_vo2_max'
      };

      const fetchFromHA = async (url) => {
        try {
          const data = {};
          for (const [key, sensorId] of Object.entries(sensors)) {
            const response = await fetch(`${url}/api/states/${sensorId}`, {
              headers: { Authorization: `Bearer ${HA_TOKEN}` }
            });
            if (response.ok) {
              const state = await response.json();
              data[key] = parseFloat(state.state) || state.state;
            }
          }
          return data;
        } catch (err) {
          return null;
        }
      };

      let data = await fetchFromHA(HA_LOCAL_URL);
      
      if (!data || Object.keys(data).length === 0) {
        data = await fetchFromHA(HA_REMOTE_URL);
        if (data && Object.keys(data).length > 0) {
          setHaUrl(HA_REMOTE_URL);
        } else {
          data = defaultStats;
          setError('No se pudo conectar a Home Assistant. Usando datos de prueba.');
        }
      } else {
        setHaUrl(HA_LOCAL_URL);
      }

      if (data.distance && data.distance > 100) {
        data.distance = data.distance / 1000;
      }

      setTodayStats({
        ...defaultStats,
        ...data
      });
      setLoading(false);
    };

    fetchGarminData();
    const interval = setInterval(fetchGarminData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const analyzeAndRecommend = async () => {
    if (!todayStats) {
      setError('No hay datos disponibles');
      return;
    }

    setAnalyzing(true);
    setRecommendation(null);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats: todayStats }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError('Error: ' + (data.error || 'Unknown error'));
        return;
      }

      setRecommendation(data.recommendation);
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !todayStats) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, stats: todayStats }),
      });

      const data = await response.json();

      if (!response.ok) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: 'Error: ' + (data.error || 'Unknown error') }]);
        return;
      }

      setChatMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Error: ' + err.message }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Conectando con Home Assistant...</p>
        </div>
      </div>
    );
  }

  if (!todayStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md">
          <AlertCircle className="text-red-400 mb-2" size={32} />
          <h2 className="text-red-300 font-bold mb-2">Error de conexión</h2>
          <p className="text-sm text-slate-300">No se pudo conectar a Home Assistant. Verifica tu token y configuración.</p>
        </div>
      </div>
    );
  }

  const stepsProgress = (todayStats.steps / todayStats.stepsGoal) * 100;
  const sleepProgress = (todayStats.totalSleep / todayStats.sleepGoal) * 100;

  const StatCard = ({ icon: Icon, label, value, unit, goal, progress, color }) => (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        {progress !== undefined && (
          <span className="text-xs font-semibold text-slate-400">{Math.round(progress)}%</span>
        )}
      </div>
      <h3 className="text-slate-400 text-xs uppercase font-bold mb-1">{label}</h3>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>
      {goal && (
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${color}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6 flex-col md:flex-row gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Entrenador Personal IA</h1>
            <p className="text-slate-400">Análisis Garmin + Recomendaciones inteligentes</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">
              {haUrl === HA_REMOTE_URL ? '🌐 Remoto' : '🏠 Local'}
            </p>
            <p className="text-2xl font-bold text-white">{new Date().toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <button
            onClick={analyzeAndRecommend}
            disabled={analyzing}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 text-lg shadow-lg mb-6"
          >
            {analyzing ? (
              <>
                <Loader size={24} className="animate-spin" />
                Analizando tus métricas...
              </>
            ) : (
              <>
                <Brain size={24} />
                Analizar y Recomendar Entrenamiento
              </>
            )}
          </button>

          {recommendation && (
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-500 rounded-xl p-6">
              <div className="flex gap-4">
                <Zap size={28} className="text-purple-400 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-white mb-3">Tu Entrenamiento Recomendado:</h2>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{recommendation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 flex flex-col h-[500px]">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="text-white font-bold flex items-center gap-2">
              <MessageCircle size={20} className="text-cyan-400" />
              Consultor IA
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center text-slate-400 text-sm mt-4">
                <p>Haz tus preguntas sobre entrenamiento y salud</p>
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 rounded-lg p-3">
                  <Loader size={16} className="text-cyan-400 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pregunta algo..."
                className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-lg transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={Activity} 
          label="Pasos" 
          value={todayStats.steps.toLocaleString()} 
          unit="pasos"
          goal={todayStats.stepsGoal}
          progress={stepsProgress}
          color="bg-blue-600"
        />
        <StatCard 
          icon={Flame} 
          label="Calorías Activas" 
          value={Math.round(todayStats.activeCalories)} 
          unit="kcal"
          color="bg-orange-600"
        />
        <StatCard 
          icon={Heart} 
          label="FC en Reposo" 
          value={todayStats.restingHeartRate} 
          unit="bpm"
          color="bg-red-600"
        />
        <StatCard 
          icon={Moon} 
          label="Sueño" 
          value={(todayStats.totalSleep / 60).toFixed(1)} 
          unit="hrs"
          goal={todayStats.sleepGoal / 60}
          progress={sleepProgress}
          color="bg-indigo-600"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">FC Máxima</p>
          <p className="text-xl font-bold text-red-400">{todayStats.maxHeartRate}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">VO₂ Máximo</p>
          <p className="text-xl font-bold text-cyan-400">{todayStats.vo2Max}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Distancia</p>
          <p className="text-xl font-bold text-emerald-400">{todayStats.distance.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Nivel Estrés</p>
          <p className="text-xl font-bold text-yellow-400">{todayStats.avgStress}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={20} className="text-blue-400" />
            Pasos de la Semana
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyStepsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
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
            <AreaChart data={heartRateData}>
              <defs>
                <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[50, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Area type="monotone" dataKey="hr" stroke="#ef4444" fillOpacity={1} fill="url(#colorHR)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Area type="monotone" dataKey="sleep" stroke="#6366f1" fillOpacity={1} fill="url(#colorSleep)" />
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
              <Pie data={activitiesData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                {activitiesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="text-xs text-slate-500 text-center
