'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router   = useRouter();
  const supabase = createClient();
  const [email, setEmail]   = useState('');
  const [senha, setSenha]   = useState('');
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro]     = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro('E-mail ou senha inválidos.');
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="font-display text-2xl text-brand-900">Saúde Certa</h1>
          <p className="text-sm text-muted-foreground mt-1">Acesso ao painel administrativo</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input
                className="input"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={show ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {erro && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{erro}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Acesso restrito a funcionários autorizados
        </p>
      </div>
    </div>
  );
}
