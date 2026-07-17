import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login('demo@example.com', 'password');
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">L-DAD</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to access the logistics control center.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" defaultValue="demo@ldad.example" />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input type="password" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" defaultValue="password" />
          </label>

          <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white" type="submit">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
