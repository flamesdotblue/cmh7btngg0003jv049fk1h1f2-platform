import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative h-[72vh] w-full overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800" id="top">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/IKzHtP5ThSO83edK/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/40 to-slate-900/70 pointer-events-none" />

      <div className="relative z-10 h-full">
        <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 grid place-items-center text-indigo-300 font-bold">₹</span>
            <span className="text-white font-semibold tracking-tight">BillCraft</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-slate-200">
            <a href="#invoices" className="hover:text-white">Invoices</a>
            <a href="#expenses" className="hover:text-white">Expenses</a>
            <a href="#analytics" className="hover:text-white">Analytics</a>
          </nav>
        </header>

        <div className="h-[calc(72vh-72px)] grid place-items-center">
          <div className="mx-auto max-w-3xl text-center px-4">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white"
            >
              Elegant billing for growing businesses
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="mt-4 text-slate-200 text-base sm:text-lg"
            >
              Create invoices, track expenses, and visualize taxes with smooth, delightful animations.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="mt-8 flex items-center justify-center gap-3"
            >
              <a href="#invoices" className="inline-flex items-center rounded-md bg-indigo-500 px-5 py-3 text-white font-medium shadow hover:bg-indigo-600 transition">+ New Invoice</a>
              <a href="#analytics" className="inline-flex items-center rounded-md bg-white/10 px-5 py-3 text-white font-medium ring-1 ring-white/20 backdrop-blur hover:bg-white/20 transition">View Analytics</a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
