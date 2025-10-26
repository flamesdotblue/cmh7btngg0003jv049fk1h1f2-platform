import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

function currency(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);
}

const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6'];

export default function AnalyticsDashboard({ invoices, expenses, metrics }) {
  const [range, setRange] = useState('6m');

  const revenueSeries = useMemo(() => {
    const map = new Map();
    const add = (dateStr, val) => {
      const d = new Date(dateStr);
      const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      map.set(k, (map.get(k) || 0) + val);
    };
    invoices.forEach(i => add(i.date, i.total));
    const out = Array.from(map.entries()).sort().map(([k, v]) => ({ month: k, revenue: v }));
    return out;
  }, [invoices]);

  const expenseSeries = useMemo(() => {
    const map = new Map();
    const add = (dateStr, val) => {
      const d = new Date(dateStr);
      const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      map.set(k, (map.get(k) || 0) + val);
    };
    expenses.forEach(e => add(e.date, e.amount));
    return Array.from(map.entries()).sort().map(([k, v]) => ({ month: k, expenses: v }));
  }, [expenses]);

  const mergedSeries = useMemo(() => {
    const map = new Map();
    revenueSeries.forEach(r => map.set(r.month, { month: r.month, revenue: r.revenue, expenses: 0 }));
    expenseSeries.forEach(e => map.set(e.month, { ...(map.get(e.month) || { month: e.month, revenue: 0 }), expenses: e.expenses }));
    return Array.from(map.values()).sort((a,b)=>a.month.localeCompare(b.month));
  }, [revenueSeries, expenseSeries]);

  const pieData = useMemo(() => {
    const byCat = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {});
    return Object.entries(byCat).map(([k,v]) => ({ name: k, value: v }));
  }, [expenses]);

  return (
    <section id="analytics" className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieIcon className="h-5 w-5 text-slate-900" />
          <h2 className="font-semibold">Analytics</h2>
        </div>
        <div className="flex items-center gap-2">
          <select value={range} onChange={(e) => setRange(e.target.value)} className="rounded-md border-slate-300 text-sm">
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
          </select>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-sm text-slate-600">Revenue</div>
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} key={metrics.revenue} className="text-2xl font-extrabold">{currency(metrics.revenue)}</motion.div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600">Expenses</div>
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} key={metrics.expenseTotal} className="text-2xl font-extrabold">{currency(metrics.expenseTotal)}</motion.div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v) => currency(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-sm text-slate-600">Collected Tax</div>
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} key={metrics.collectedTax} className="text-2xl font-extrabold">{currency(metrics.collectedTax)}</motion.div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600">Net Profit</div>
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} key={metrics.net} className="text-2xl font-extrabold">{currency(metrics.net)}</motion.div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mergedSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v) => currency(v)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#22C55E" radius={[6,6,0,0]} />
                  <Bar dataKey="expenses" fill="#F59E0B" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="mb-4">
              <div className="text-sm text-slate-600">Expense Split</div>
              <div className="text-xs text-slate-500">By Category</div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} paddingAngle={2} stroke="#fff" strokeWidth={2}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => currency(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="text-sm text-slate-600 mb-1">Tax Summary</div>
            <div className="text-xs text-slate-500 mb-3">Collected vs Expenses</div>
            <div className="space-y-2">
              <Progress label="Tax Collected" value={safePercent(metrics.collectedTax, metrics.revenue)} color="bg-indigo-600" />
              <Progress label="Expenses Share" value={safePercent(metrics.expenseTotal, metrics.revenue)} color="bg-rose-600" />
              <Progress label="Profit Share" value={safePercent(metrics.net, metrics.revenue)} color="bg-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function safePercent(part, total) {
  if (!total || total <= 0) return 0;
  const v = Math.max(0, Math.min(100, (part / total) * 100));
  return Number.isFinite(v) ? v : 0;
}

function Progress({ label, value, color }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900 font-medium">{value.toFixed(0)}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-white border overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className={`h-full ${color}`} />
      </div>
    </div>
  );
}
