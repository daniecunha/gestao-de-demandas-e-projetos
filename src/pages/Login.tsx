import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Zap, ShieldX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { signInWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const denied = searchParams.get('denied') === '1';

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError('Não foi possível iniciar o login. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dot grid background inherited from body */}
      {/* Soft radial glow — adds warmth and depth to the center of the viewport */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(37,99,235,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-sm relative animate-fade-up">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-5 shadow-xl shadow-blue-500/20">
            <Zap size={30} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-gray-900 tracking-tight">
            Gestão de Projetos
          </h1>
          <p className="text-sm text-gray-500 mt-1">Acesso restrito — conta autorizada</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card-hover border border-gray-200/80 p-8">
          <h2 className="font-display text-base font-semibold text-gray-800 mb-1 tracking-tight">
            Entrar na plataforma
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Use sua conta Google para continuar.
          </p>

          {denied && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3">
              <ShieldX size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Acesso negado</p>
                <p className="text-xs text-red-600 mt-0.5">
                  Sua conta não tem permissão. Entre com a conta autorizada.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={loading}
            className={[
              'w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-medium text-sm',
              'border border-gray-200 bg-white shadow-sm',
              'hover:bg-gray-50 hover:border-gray-300 hover:shadow-md',
              'active:scale-[0.98] active:shadow-sm',
              'transition-all duration-150 ease-spring',
              'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100',
            ].join(' ')}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span className="font-display tracking-tight">
              {loading ? 'Redirecionando…' : 'Continuar com Google'}
            </span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Somente usuários autorizados têm acesso.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}
