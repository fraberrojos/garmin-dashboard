  import React, { useState, useEffect } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Heart, Flame, Moon, Brain, AlertCircle, Loader } from 'lucide-react';

export default function GarminDashboard() {
  const HA_TOKEN = process.env.NEXT_PUBLIC_HA_TOKEN;
  const HA_LOCAL_URL = "http://homeassistant.local:8123";
  const HA_REMOTE_URL = "https://lospichus.duckdns.org";

  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  const defaultStats = {
    steps: 5080, stepsGoal: 10000, activeCalories: 147, restingHeartRate: 48,
    maxHeartRate: 104, deepSleep: 64, lightSleep: 220, remSleep: 79, totalSleep: 363,
    sleepGoal: 480, distance: 4.23, activeTime: 111, avgStress: 28, vo2Max: 38.0
  };

  const weeklyData = [
    { day: 'Lun', steps: 9200 }, { day: 'Mar', steps: 7850 }, { day: 'Mié', steps: 11200 },
    { day: 'Jue', steps: 8950 }, { day: 'Vie', steps: 10500 }, { day: 'Sab', steps: 12100 },
    { day: 'Dom', steps: 5080 }
  ];

  const heartData = [
    { time: '00:00', hr: 58 }, { time: '06:00', hr: 62 }, { time: '12:00', hr: 75 },
    { time: '18:00', hr: 82 }, { time: '23:59', hr: 68 }
  ];

  const sleepData = [
    { day: 'Lun', sleep: 7.2 }, { day: 'Mar', sleep: 6.8 }, { day: 'Mié', sleep: 8.1 },
    { day: 'Jue', sleep: 7.9 }, { day: 'Vie', sleep: 7.5 }, { day: 'Sab', sleep: 8.3 },
    { day: 'Dom', sleep: 6.0 }
  ];

  const activitiesData = [
    { name: 'Ciclismo', value: 35, color: '#3b82f6' },
    { name: 'Correr', value: 25, color: '#ef4444' },
    { name: 'Fuerza', value: 20, color: '#f59e0b' },
    { name: 'Otros', value: 20, color: '#
