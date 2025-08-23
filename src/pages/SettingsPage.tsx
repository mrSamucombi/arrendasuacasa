// SettingsPage.tsx (Versão Melhorada)

import React from 'react';
import Button from '../components/Button';
import { CogIcon } from '../components/icons/Icons';
import { toast } from 'react-hot-toast';
import * as apiService from '../services/apiService'; // Supondo que você tem este serviço

// --- TIPOS E INTERFACES ---
interface SettingsPageProps {
  // O estado é passado via props, vindo do componente pai (ex: App.tsx)
  settings: {
    emailNotifications: boolean;
    theme: 'Claro' | 'Escuro';
  };
  // Funções para atualizar o estado no componente pai
  onSettingsChange: (newSettings: Partial<SettingsPageProps['settings']>) => void;
  onLogout: () => void; // Para deslogar o utilizador após apagar a conta
}

// --- COMPONENTE PRINCIPAL ---
const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSettingsChange, onLogout }) => {

  // --- HANDLERS ---
  const handleToggleNotifications = async () => {
    const newValue = !settings.emailNotifications;
    // UI otimista: atualiza a interface imediatamente
    onSettingsChange({ emailNotifications: newValue });

    try {
      // Sincroniza a mudança com o backend
      await apiService.updateUserSettings({ emailNotifications: newValue });
      toast.success('Preferências de notificação atualizadas.');
    } catch (error) {
      toast.error('Não foi possível guardar as alterações.');
      // Reverte a mudança na UI em caso de erro
      onSettingsChange({ emailNotifications: !newValue });
    }
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as 'Claro' | 'Escuro';
    onSettingsChange({ theme: newTheme });
    // A lógica para aplicar o tema (mudar a classe no <body>)
    // estaria no App.tsx, dentro de um useEffect que observa 'settings.theme'.
  };

  const handleDeleteAccount = async () => {
    const confirmationText = "APAGAR CONTA";
    const userInput = prompt(`Esta ação é irreversível e irá apagar todos os seus dados.\nPara confirmar, por favor, escreva "${confirmationText}" na caixa abaixo.`);
    
    if (userInput === confirmationText) {
      const toastId = toast.loading('A apagar a sua conta...');
      try {
        await apiService.deleteMyAccount();
        toast.success('Conta apagada com sucesso. A terminar a sessão...', { id: toastId });
        // Aguarda um pouco para o utilizador ler a mensagem e depois desloga
        setTimeout(() => {
          onLogout();
        }, 2000);
      } catch (error) {
        toast.error(`Erro: ${error.message}`, { id: toastId });
      }
    } else if (userInput !== null) { // Se o utilizador escreveu algo mas não foi o correto
      toast.error('Texto de confirmação incorreto.');
    }
  };

  return (
    <div className="bg-surface p-6 md:p-8 rounded-xl shadow-lg max-w-4xl mx-auto border border-crust">
      <div className="flex items-center mb-6 border-b border-crust pb-4">
        <CogIcon className="w-8 h-8 text-primary mr-3" />
        <h1 className="text-3xl font-bold text-text">Configurações</h1>
      </div>

      <div className="space-y-8">
        {/* Notificações */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text">Notificações</h2>
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <label htmlFor="email-notifications" className="font-medium text-text">Notificações por Email</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="email-notifications" className="sr-only peer" checked={settings.emailNotifications} onChange={handleToggleNotifications} />
              <div className="w-11 h-6 bg-crust rounded-full peer peer-focus:ring-4 peer-focus:ring-blue/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Aparência */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text">Aparência</h2>
          <div className="p-4 bg-background rounded-lg">
            <label htmlFor="theme" className="block font-medium text-text mb-2">Tema da Aplicação</label>
            <select id="theme" className="w-full p-2 border border-crust rounded-md shadow-sm focus:border-primary focus:ring-primary" value={settings.theme} onChange={handleThemeChange}>
              <option>Claro</option>
              <option disabled>Escuro (em breve)</option>
            </select>
          </div>
        </div>

        {/* Conta */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text">Conta</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-red/10 rounded-lg border border-red/20">
            <p className="font-medium text-danger mb-2 sm:mb-0">Apagar a sua conta permanentemente</p>
            <Button variant="danger" onClick={handleDeleteAccount}>Apagar Conta</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;