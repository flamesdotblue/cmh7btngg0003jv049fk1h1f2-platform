import { useMemo, useState } from 'react';
import { Wallet, Trash2, Plus } from 'lucide-react';

function currency(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);
}

const categories = ['Utilities', 'Rent', 'Salaries', 'Software', 'Travel', 'Misc'];

export default function ExpenseManager({ expenses, setExpenses }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), category: 'Utilities', description: '', amount: 0, receipt: null });

  function addExpense() {
    const id = crypto.randomUUID();
    const e = { id, ...form, amount: Number(form.amount) || 0 };
    setExpenses(prev => [e, ...prev]);
    setForm({ date: new Date().toISOString().slice(0,10), category: 'Utilities', description: '', amount: 0, receipt: null });
  }

  function removeExpense(id) {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }

  const summary = useMemo(() => {
    const byCat = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {});
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    return { byCat, total };
  }, [expenses]);

  return (
    <section id="expenses" className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold">Expenses</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="text-xs text-slate-600">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className="mt-1 w-full rounded-md border-slate-300" />
          </div>
          <div>
            <label className="text-xs text-slate-600">Category</label>
            <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="mt-1 w-full rounded-md border-slate-300">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-600">Description</label>
            <input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 w-full rounded-md border-slate-300" placeholder="Expense details" />
          </div>
          <div>
            <label className="text-xs text-slate-600">Amount</label>
            <input type="number" min="0" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} className="mt-1 w-full rounded-md border-slate-300" />
          </div>
          <div className="sm:col-span-5 flex items-center gap-3">
            <input type="file" onChange={(e) => setForm(f => ({ ...f, receipt: e.target.files?.[0] || null }))} className="text-xs" />
            <button onClick={addExpense} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add</button>
            <div className="ml-auto text-sm text-slate-600">Total: <span className="font-semibold text-slate-900">{currency(summary.total)}</span></div>
          </div>
        </div>

        <div className="space-y-2">
          {expenses.length === 0 ? (
            <div className="text-slate-500 text-sm">No expenses added.</div>
          ) : (
            expenses.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-xl border bg-slate-50">
                <div>
                  <div className="font-medium">{e.description || e.category}</div>
                  <div className="text-xs text-slate-500">{new Date(e.date).toLocaleDateString()} • {e.category}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-semibold">{currency(e.amount)}</div>
                  <button onClick={() => removeExpense(e.id)} className="inline-flex items-center justify-center rounded-md bg-red-50 text-red-600 hover:bg-red-100 h-9 w-9"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
