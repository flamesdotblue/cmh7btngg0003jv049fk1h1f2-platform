import { useMemo, useState, useEffect } from 'react';
import Hero from './components/Hero.jsx';
import InvoiceManager from './components/InvoiceManager.jsx';
import ExpenseManager from './components/ExpenseManager.jsx';
import AnalyticsDashboard from './components/AnalyticsDashboard.jsx';

function App() {
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('invoices');
    return saved ? JSON.parse(saved) : [];
  });
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const metrics = useMemo(() => {
    const revenue = invoices.filter(i => i.status === 'Paid' || i.status === 'Sent').reduce((sum, i) => sum + i.total, 0);
    const collectedTax = invoices.reduce((sum, i) => sum + i.taxTotal, 0);
    const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    const net = revenue - expenseTotal;
    return { revenue, collectedTax, expenseTotal, net };
  }, [invoices, expenses]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Hero />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InvoiceManager invoices={invoices} setInvoices={setInvoices} />
          </div>
          <div className="lg:col-span-1">
            <ExpenseManager expenses={expenses} setExpenses={setExpenses} />
          </div>
        </div>

        <div className="mt-10">
          <AnalyticsDashboard invoices={invoices} expenses={expenses} metrics={metrics} />
        </div>
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-slate-500 flex items-center justify-between">
          <span>Billing MVP • React + Tailwind • Animated</span>
          <a className="hover:text-slate-900 transition" href="#top">Back to top</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
