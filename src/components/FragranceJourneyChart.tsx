import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { TrendingUp, Compass, Sparkles, Flower2, Activity, Award } from 'lucide-react';
import { Order, Fragrance } from '../types';
import { fragrances as catalogFragrances } from '../data/fragrances';

interface FragranceJourneyChartProps {
  orders: Order[];
  theme: 'light' | 'dark';
  allFragrances?: Fragrance[];
}

export default function FragranceJourneyChart({
  orders,
  theme,
  allFragrances = catalogFragrances,
}: FragranceJourneyChartProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'radar' | 'notes'>('timeline');

  // Build timeline data sorted chronologically
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // If user has orders, calculate real progression
  let cumulativeSpend = 0;
  let cumulativePoints = 100; // start with welcome bonus

  const timelineData = sortedOrders.map((o, index) => {
    cumulativeSpend += o.total;
    const orderPoints = Math.floor(o.total / 50);
    cumulativePoints += orderPoints;

    // Determine primary scent notes in this order
    const itemNames = o.items.map((i) => i.name).join(', ');

    return {
      orderId: o.id.slice(-6),
      date: new Date(o.date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      orderTotal: o.total,
      cumulativeSpend,
      pointsEarned: orderPoints,
      totalPoints: cumulativePoints,
      itemsCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
      itemNames,
    };
  });

  // Calculate Scent Family Breakdown from customer's purchased fragrances
  const familyCount: Record<string, number> = {
    Floral: 0,
    Oriental: 0,
    Woody: 0,
    Fresh: 0,
    Gourmand: 0,
  };

  const noteCount: Record<string, number> = {};

  orders.forEach((o) => {
    o.items.forEach((item) => {
      // Find matching fragrance in catalog to get exact notes and family
      const matched = allFragrances.find(
        (f) =>
          f.id === item.id || f.name.toLowerCase() === item.name.toLowerCase()
      );

      if (matched) {
        familyCount[matched.family] =
          (familyCount[matched.family] || 0) + item.quantity;
        matched.notes.forEach((n) => {
          noteCount[n] = (noteCount[n] || 0) + item.quantity;
        });
      } else {
        // Fallback categorization based on name
        familyCount['Floral'] = (familyCount['Floral'] || 0) + item.quantity;
      }
    });
  });

  // Radar data
  const radarData = Object.keys(familyCount).map((family) => ({
    family,
    value: familyCount[family] || (orders.length === 0 ? Math.floor(Math.random() * 40) + 10 : 0),
    fullMark: 100,
  }));

  // Top Notes data
  const topNotesData = Object.entries(noteCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([note, count]) => ({ note, count }));

  // Color palette for chart bars
  const barColors = ['#C9A35A', '#EAB308', '#10B981', '#8B5CF6', '#F43F5E', '#06B6D4'];

  const isDark = theme === 'dark';

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        isDark
          ? 'bg-gradient-to-br from-neutral-950 via-[#101935] to-neutral-900 border-[#C9A35A]/25'
          : 'bg-gradient-to-br from-neutral-50 via-white to-amber-50/50 border-amber-200'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif italic text-base font-bold text-amber-400">
                Your Olfactory Journey Graph
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                Interactive Analytics
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Visualizing order progression, accumulated spend, and scent profile preference evolution
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/20 border border-neutral-800 self-start sm:self-auto text-[10px] font-bold">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'timeline'
                ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'radar'
                ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Flower2 className="w-3 h-3" />
            <span>Family Radar</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'notes'
                ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Top Notes</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Timeline Graph */}
      {activeTab === 'timeline' && (
        <div>
          {sortedOrders.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-amber-400/60 mx-auto animate-pulse" />
              <p className="text-xs font-semibold text-amber-300">
                Your fragrance journey is just beginning!
              </p>
              <p className="text-[10px] text-neutral-400 max-w-xs mx-auto">
                Once you make your first perfume purchase, your spend progression and earned Scent Points will map here dynamically.
              </p>
            </div>
          ) : (
            <div className="w-full h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A35A" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#C9A35A" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#262626' : '#e5e5e5'} />
                  <XAxis dataKey="date" stroke={isDark ? '#a3a3a3' : '#525252'} fontSize={10} />
                  <YAxis stroke={isDark ? '#a3a3a3' : '#525252'} fontSize={10} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 rounded-xl bg-neutral-900/95 border border-amber-500/40 text-white text-xs shadow-xl space-y-1">
                            <p className="font-mono font-bold text-amber-400">Order #{data.orderId} • {data.date}</p>
                            <p className="text-[11px] text-neutral-300">Items: <strong>{data.itemNames}</strong></p>
                            <div className="flex items-center justify-between gap-4 pt-1 border-t border-neutral-800 text-[10px]">
                              <span>Order Value: <strong className="text-amber-400 font-mono">₹{data.orderTotal.toLocaleString()}</strong></span>
                              <span>Earned: <strong className="text-emerald-400 font-mono">+{data.pointsEarned} pts</strong></span>
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              Cumulative Spend: <strong className="font-mono text-white">₹{data.cumulativeSpend.toLocaleString()}</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeSpend"
                    name="Cumulative Spend (₹)"
                    stroke="#C9A35A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#spendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Scent Family Radar */}
      {activeTab === 'radar' && (
        <div className="w-full h-56 flex items-center justify-center pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke={isDark ? '#333333' : '#e5e5e5'} />
              <PolarAngleAxis
                dataKey="family"
                stroke={isDark ? '#f59e0b' : '#d97706'}
                fontSize={11}
                tickLine={false}
              />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke={isDark ? '#525252' : '#a3a3a3'} fontSize={9} />
              <Radar
                name="Scent Preference"
                dataKey="value"
                stroke="#EAB308"
                fill="#EAB308"
                fillOpacity={0.45}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tab 3: Top Scent Notes Bar Chart */}
      {activeTab === 'notes' && (
        <div>
          {topNotesData.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Award className="w-8 h-8 text-amber-400/60 mx-auto" />
              <p className="text-xs font-semibold text-amber-300">No notes recorded yet</p>
              <p className="text-[10px] text-neutral-400 max-w-xs mx-auto">
                Explore perfumes in the catalog to build up your signature note preference profile!
              </p>
            </div>
          ) : (
            <div className="w-full h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topNotesData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#262626' : '#e5e5e5'} />
                  <XAxis type="number" stroke={isDark ? '#a3a3a3' : '#525252'} fontSize={10} allowDecimals={false} />
                  <YAxis dataKey="note" type="category" stroke={isDark ? '#f59e0b' : '#d97706'} fontSize={10} width={70} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-xl bg-neutral-900 border border-amber-500/40 text-white text-xs">
                            <p className="font-bold text-amber-400">{data.note}</p>
                            <p className="text-[10px] text-neutral-300">Purchased Count: <strong className="font-mono text-emerald-400">{data.count}x</strong></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {topNotesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Quick Summary Footer */}
      <div className="mt-3 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-400">
        <span>
          Total Completed Orders: <strong className="font-mono text-amber-400">{orders.length}</strong>
        </span>
        <span>
          Lifetime Spend: <strong className="font-mono text-amber-400">₹{cumulativeSpend.toLocaleString()}</strong>
        </span>
      </div>
    </div>
  );
}
