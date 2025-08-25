import React, { useState } from 'react';
import { UserRole } from '../types';
import * as apiService from '../services/apiService';
import Button from '../components/Button';
import { HomeIcon } from '../components/icons/Icons';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-hot-toast';

// Componente reutilizável para os campos de formulário, já estilizado
const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-text">{label}</label>
    <input
      id={id}
      {...props}
      className="
        mt-1 block w-full rounded-lg 
        bg-surface border-crust
        text-text
        placeholder:text-subtext
        focus:border-primary focus:ring-primary
        shadow-sm transition
      "
    />
  </div>
);

// As props que o AuthPage recebe do App.tsx
interface AuthPageProps {
  onLoginSuccess: (user: any) => void;
  onAdminLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onAdminLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>(UserRole.Client);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // O onAuthStateChanged no App.tsx tratará do resto.
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err: any) {
      console.error('Firebase login error:', err.code);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Credenciais inválidas. Verifique o seu email e senha.');
      } else {
        setError('Ocorreu um erro ao tentar entrar. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      const firebaseUser = userCredential.user;

      const dataToSend = {
        id: firebaseUser.uid,
        name: registerName,
        email: registerEmail,
        role: registerRole,
        ...(registerRole === UserRole.OWNER && { phoneNumber: '' }) // Envia phoneNumber vazio por defeito
      };
     
      await apiService.registerUser(dataToSend);
      
      toast.success('Registo concluído! Por favor, faça login.');
      setIsLoginView(true);
      // Limpa os campos de registo
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');

    } catch (err: any) {
      console.error('Erro no fluxo de registo:', err);
      
      const errorMessage = err.response?.data?.error || err.message;

      if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso.');
      } else {
        setError(errorMessage || 'Falha no registo. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4">
      
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center -z-10"
        style={{ backgroundImage: "url('/images/auth-background.jpg')" }} // <-- Verifique se este caminho está correto!
      >
        <div className="absolute inset-0 w-full h-full bg-background/70 backdrop-blur-sm"></div>
      </div>

      <div className="w-full max-w-md z-10">
        
        <a href="/" className="flex flex-col items-center text-center mb-8 no-underline">
          <HomeIcon className="w-12 h-12 text-blue mx-auto" />
          <h1 className="text-4xl font-extrabold text-text mt-2">ArrendaSuaCasa</h1>
          <p className="text-subtext">A sua plataforma de arrendamento em Angola</p>
        </a>

        <div className="bg-mantle rounded-xl shadow-lg p-8 border border-crust">
          <div className="flex border-b border-crust mb-6">
            <button onClick={() => { setIsLoginView(true); setError(null); }} className={`flex-1 pb-3 text-lg font-semibold transition-colors duration-300 ${isLoginView ? 'text-blue border-b-2 border-blue' : 'text-subtext hover:text-text'}`}>
              Entrar
            </button>
            <button onClick={() => { setIsLoginView(false); setError(null); }} className={`flex-1 pb-3 text-lg font-semibold transition-colors duration-300 ${!isLoginView ? 'text-blue border-b-2 border-blue' : 'text-subtext hover:text-text'}`}>
              Cadastrar
            </button>
          </div>

          {error && (
            <div className="bg-red/10 border border-red text-red px-4 py-3 rounded-lg mb-4 text-sm" role="alert">
              {error}
            </div>
          )}

          {isLoginView ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <InputField label="Email" id="login-email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required autoComplete="email" />
              <InputField label="Palavra-passe" id="login-password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required autoComplete="current-password" />
              <Button type="submit" className="w-full" variant="primary" disabled={isLoading}>
                {isLoading ? 'A entrar...' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <InputField label="Nome Completo" id="register-name" type="text" value={registerName} onChange={e => setRegisterName(e.target.value)} required autoComplete="name" />
              <InputField label="Email" id="register-email" type="email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} required autoComplete="email" />
              <InputField label="Palavra-passe" id="register-password" type="password" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
              <div>
                <span className="block text-sm font-medium text-text mb-2">Quero registar-me como:</span>
                <div className="flex space-x-4">
                  <label className="flex items-center text-text">
                    <input type="radio" name="role" value={UserRole.Client} checked={registerRole === UserRole.Client} onChange={() => setRegisterRole(UserRole.Client)} className="w-4 h-4 text-blue focus:ring-blue" />
                    <span className="ml-2">Cliente</span>
                  </label>
                  <label className="flex items-center text-text">
                    <input type="radio" name="role" value={UserRole.Owner} checked={registerRole === UserRole.Owner} onChange={() => setRegisterRole(UserRole.Owner)} className="w-4 h-4 text-blue focus:ring-blue" />
                    <span className="ml-2">Proprietário</span>
                  </label>
                </div>
              </div>
              <Button type="submit" className="w-full" variant="primary" disabled={isLoading}>
                {isLoading ? 'A registar...' : 'Registar'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;