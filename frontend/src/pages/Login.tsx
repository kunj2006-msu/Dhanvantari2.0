import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { LogIn, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await authService.login({ email, password });
      if (data.role === 'ROLE_DOCTOR') {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } catch (error: any) {
      // Check if the backend specifically rejected the credentials (401 or 403)
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        setError("Invalid email or password. If you are new here, please register first.");
      }
      // Else, it's a network error or server crash
      else {
        setError("Unable to connect to the server. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-slate-900 min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md p-8 md:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border border-white/10 shadow-inner mb-6">
              <LogIn className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-300 font-light">Sign in to your Dhanvantari account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-500 transition-all font-light"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-500 transition-all font-light"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-300 cursor-pointer">
                <input type="checkbox" className="mr-2 rounded border-white/20 bg-slate-800 text-cyan-500 focus:ring-cyan-500" />
                <span className="font-light hover:text-white transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Forgot password?</a>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(6, 182, 212, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold text-lg transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400 font-light">
            Don't have an account?{' '}
            <a href="#" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Register here</a>
          </p>
        </motion.div>
      </div>
    </main>
  );
}