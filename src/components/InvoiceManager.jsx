import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Download, Send, CheckCircle, FileText } from 'lucide-react';

function currency(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);
}

function calcItem(item, taxType = 'GST') {
  const base = (Number(item.quantity) || 0) * (Number(item.price) || 0);
  const discountAmt = base * ((Number(item.discount) || 0) / 100);
  const taxable = Math.max(base - discountAmt, 0);
  const taxRate = Number(item.taxRate) || 0;
  let cgst = 0, sgst = 0, igst = 0;
  if (taxType === 'IGST') {
    igst = taxable * (taxRate / 100);
  } else {
    cgst = taxable * ((taxRate / 2) / 100);
    sgst = taxable * ((taxRate / 2) / 100);
  }
  const total = taxable + cgst + sgst + igst;
  return { base, discountAmt, taxable, cgst, sgst, igst, total };
}

export default function InvoiceManager({ invoices, setInvoices }) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    customer: '',
    contact: '',
    gstin: '',
    taxType: 'GST',
    status: 'Draft',
    items: [
      { description: 'Design Service', quantity: 1, price: 1000, discount: 0, taxRate: 18 },
    ],
  });

  const totals = useMemo(() => {
    return form.items.reduce((acc, it) => {
      const r = calcItem(it, form.taxType);
      acc.subtotal += r.taxable;
      acc.cgst += r.cgst;
      acc.sgst += r.sgst;
      acc.igst += r.igst;
      acc.total += r.total;
      return acc;
    }, { subtotal: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });
  }, [form]);

  function addItem() {
    setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, price: 0, discount: 0, taxRate: 18 }] }));
  }

  function removeItem(idx) {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  function updateItem(idx, key, value) {
    setForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, [key]: value } : it) }));
  }

  function saveInvoice() {
    const id = crypto.randomUUID();
    const invoiceNo = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
    const taxTotal = totals.cgst + totals.sgst + totals.igst;
    const due = totals.total;

    const newInvoice = {
      id,
      invoiceNo,
      date: new Date().toISOString(),
      ...form,
      subtotal: totals.subtotal,
      taxTotal,
      total: totals.total,
      due,
    };
    setInvoices(prev => [newInvoice, ...prev]);
    setSuccess(true);
    setOpen(false);
    setForm({ customer: '', contact: '', gstin: '', taxType: 'GST', status: 'Draft', items: [{ description: '', quantity: 1, price: 0, discount: 0, taxRate: 18 }] });
    setTimeout(() => setSuccess(false), 2000);
  }

  function updateStatus(id, status) {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  }

  function deleteInvoice(id) {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  }

  return (
    <section id="invoices" className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h2 className="font-semibold">Invoices</h2>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition">
          <Plus className="h-4 w-4" /> New Invoice
        </button>
      </div>

      <div className="p-6">
        {invoices.length === 0 ? (
          <div className="text-center text-slate-500 py-12">No invoices yet. Create your first invoice.</div>
        ) : (
          <ul className="space-y-3">
            {invoices.map(inv => (
              <li key={inv.id} className="p-4 rounded-xl border bg-slate-50/60 hover:bg-white transition">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div>
                    <div className="font-medium">{inv.invoiceNo}</div>
                    <div className="text-sm text-slate-500">{inv.customer} • {new Date(inv.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{currency(inv.total)}</div>
                    <div className="text-xs text-slate-500">Tax: {currency(inv.taxTotal)}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : inv.status === 'Sent' ? 'bg-blue-100 text-blue-700' : inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>{inv.status}</span>
                    <span className="text-xs text-slate-500">TaxType: {inv.taxType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={inv.status} onChange={(e) => updateStatus(inv.id, e.target.value)} className="rounded-md border-slate-300 text-sm">
                      <option>Draft</option>
                      <option>Sent</option>
                      <option>Paid</option>
                      <option>Overdue</option>
                    </select>
                    <button className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-white bg-slate-100"><Send className="h-4 w-4" /> Send</button>
                    <button className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-white bg-slate-100"><Download className="h-4 w-4" /> PDF</button>
                    <button onClick={() => deleteInvoice(inv.id)} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /> Delete</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }} className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">New Invoice</h3>
                <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-900">Close</button>
              </div>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-sm text-slate-600">Customer</label>
                    <input value={form.customer} onChange={(e) => setForm(f => ({ ...f, customer: e.target.value }))} className="mt-1 w-full rounded-md border-slate-300" placeholder="Acme Inc" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Contact</label>
                    <input value={form.contact} onChange={(e) => setForm(f => ({ ...f, contact: e.target.value }))} className="mt-1 w-full rounded-md border-slate-300" placeholder="email@domain.com" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">GSTIN</label>
                    <input value={form.gstin} onChange={(e) => setForm(f => ({ ...f, gstin: e.target.value }))} className="mt-1 w-full rounded-md border-slate-300" placeholder="27ABCDE1234F1Z5" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Tax Type</label>
                    <select value={form.taxType} onChange={(e) => setForm(f => ({ ...f, taxType: e.target.value }))} className="mt-1 w-full rounded-md border-slate-300">
                      <option value="GST">GST (CGST+SGST)</option>
                      <option value="IGST">IGST</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Status</label>
                    <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="mt-1 w-full rounded-md border-slate-300">
                      <option>Draft</option>
                      <option>Sent</option>
                      <option>Paid</option>
                      <option>Overdue</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Items</h4>
                    <button onClick={addItem} className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white px-3 py-1.5 text-sm hover:bg-black"><Plus className="h-4 w-4" /> Add Item</button>
                  </div>
                  <div className="space-y-3">
                    {form.items.map((it, idx) => {
                      const r = calcItem(it, form.taxType);
                      return (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-end p-3 rounded-xl border bg-slate-50">
                          <div className="col-span-12 sm:col-span-4">
                            <label className="text-xs text-slate-600">Description</label>
                            <input value={it.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} className="mt-1 w-full rounded-md border-slate-300" placeholder="Item description" />
                          </div>
                          <div className="col-span-6 sm:col-span-2">
                            <label className="text-xs text-slate-600">Qty</label>
                            <input type="number" min="0" value={it.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} className="mt-1 w-full rounded-md border-slate-300" />
                          </div>
                          <div className="col-span-6 sm:col-span-2">
                            <label className="text-xs text-slate-600">Price</label>
                            <input type="number" min="0" value={it.price} onChange={(e) => updateItem(idx, 'price', e.target.value)} className="mt-1 w-full rounded-md border-slate-300" />
                          </div>
                          <div className="col-span-6 sm:col-span-2">
                            <label className="text-xs text-slate-600">Discount %</label>
                            <input type="number" min="0" value={it.discount} onChange={(e) => updateItem(idx, 'discount', e.target.value)} className="mt-1 w-full rounded-md border-slate-300" />
                          </div>
                          <div className="col-span-6 sm:col-span-1">
                            <label className="text-xs text-slate-600">Tax %</label>
                            <input type="number" min="0" value={it.taxRate} onChange={(e) => updateItem(idx, 'taxRate', e.target.value)} className="mt-1 w-full rounded-md border-slate-300" />
                          </div>
                          <div className="col-span-12 sm:col-span-1 flex justify-end">
                            <button onClick={() => removeItem(idx)} className="inline-flex items-center justify-center rounded-md bg-red-50 text-red-600 hover:bg-red-100 h-9 w-9"><Trash2 className="h-4 w-4" /></button>
                          </div>
                          <div className="col-span-12 text-xs text-slate-600">Line total: <span className="font-medium text-slate-900">{currency(r.total)}</span> (Tax: {currency(r.cgst + r.sgst + r.igst)})</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600">Subtotal</div>
                    <div className="text-lg font-semibold">{currency(totals.subtotal)}</div>
                    <div className="text-xs text-slate-500">CGST: {currency(totals.cgst)} • SGST: {currency(totals.sgst)} • IGST: {currency(totals.igst)}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-slate-600">Grand Total</div>
                    <div className="text-2xl font-extrabold text-slate-900">{currency(totals.total)}</div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
                <button onClick={() => setOpen(false)} className="rounded-md border px-4 py-2">Cancel</button>
                <button onClick={saveInvoice} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"><CheckCircle className="h-4 w-4" /> Save Invoice</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 pointer-events-none grid place-items-center">
            <motion.div initial={{ y: 10, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, scale: 0.95 }} className="rounded-2xl bg-emerald-600 text-white px-6 py-3 shadow-2xl">
              <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5" /> Invoice created successfully</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
