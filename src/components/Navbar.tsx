import React, { useState, useEffect, useRef } from 'react';
import { UserRole, AuthenticatedUser, VerificationStatus } from '../types'; 
import {
  CoinsIcon,
  HomeIcon,
  UserCircleIcon,
  CogIcon,
  LogoutIcon,
  HelpIcon,
  UserEditIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon
} from './icons/Icons';

// Interface de props corrigida (sem duplicados)
interface NavbarProps {
  userRole: UserRole;
  onLogout: () => void;
  onAdminLogout: () => void;
  currentUser: AuthenticatedUser | null;
  setActiveView: (view: 'main' | 'settings' | 'help' | 'terms' | 'my-profile' | 'owner-profile' | 'messages') => void;
  hasUnreadMessages: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ userRole, onLogout, onAdminLogout, currentUser, setActiveView, hasUnreadMessages }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const profilePicture = currentUser?.user?.profilePictureUrl;
  const user = currentUser?.user;
  const isOwner = currentUser?.role === UserRole.Owner;
  const isClient = currentUser?.role === UserRole.Client;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => { onLogout(); setIsMenuOpen(false); };
  const handleAdminLogoutClick = () => { onAdminLogout(); setIsMenuOpen(false); };

  const MenuButton: React.FC<{ onClick: () => void; children: React.ReactNode; icon: React.ElementType, isDanger?: boolean }> = ({ onClick, children, icon: Icon, isDanger = false }) => (
    <button onClick={onClick} className={`flex items-center w-full text-left px-4 py-3 text-sm rounded-md transition-colors ${isDanger ? 'text-danger hover:bg-red-50' : 'text-text hover:bg-background'}`}>
      <Icon className={`w-5 h-5 mr-3 ${isDanger ? 'text-danger' : 'text-subtext'}`} />
      {children}
    </button>
  );

  // Função renderUserMenu limpa e corrigida
  const renderUserMenu = () => (
    <div className="absolute right-0 mt-2 w-72 bg-surface rounded-xl shadow-2xl p-2 z-50 border border-crust">
      {/* Informações do Perfil */}
      {isOwner && user && 'ascBalance' in user && (
        <div className="px-3 py-3 border-b border-crust">
          <p className="font-bold text-text flex items-center truncate">{user.name}{user.verificationStatus === VerificationStatus.Verified && (<ShieldCheckIcon className="w-5 h-5 ml-2 text-blue flex-shrink-0" title="Utilizador Verificado" />)}</p>
          <p className="text-xs text-subtext">Proprietário</p>
          <div className="flex items-center space-x-2 text-yellow-500 font-bold mt-2"><CoinsIcon className="w-6 h-6"/><span>{user.ascBalance} ASC</span></div>
        </div>
      )}
      {isClient && user && (
        <div className="px-3 py-3 border-b border-crust">
          <p className="font-bold text-text truncate">{user.name}</p>
          <p className="text-xs text-subtext">Cliente</p>
        </div>
      )}
      
      {/* Navegação Principal */}
      <nav className="mt-2 space-y-1">
        <MenuButton onClick={() => { setActiveView('messages'); setIsMenuOpen(false); }} icon={ChatBubbleLeftRightIcon}>
          <div className="flex items-center justify-between w-full">
            <span>Mensagens</span>
            {hasUnreadMessages && (<span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>)}
          </div>
        </MenuButton>
        <div className="border-t border-crust my-1"></div>
        {isOwner && <MenuButton onClick={() => { setActiveView('owner-profile'); setIsMenuOpen(false); }} icon={UserEditIcon}>Perfil & Verificação</MenuButton>}
        {isClient && <MenuButton onClick={() => { setActiveView('my-profile'); setIsMenuOpen(false); }} icon={UserEditIcon}>Meu Perfil & Favoritos</MenuButton>}
        <MenuButton onClick={() => { setActiveView('settings'); setIsMenuOpen(false); }} icon={CogIcon}>Configurações</MenuButton>
        <MenuButton onClick={() => { setActiveView('help'); setIsMenuOpen(false); }} icon={HelpIcon}>Centro de Ajuda</MenuButton>
        <div className="border-t border-crust my-1"></div>
        <MenuButton onClick={handleLogoutClick} icon={LogoutIcon} isDanger>Sair</MenuButton>
      </nav>
    </div>
  );
  
  const renderAdminMenu = () => (
    <div className="absolute right-0 mt-2 w-64 bg-surface rounded-xl shadow-2xl p-2 z-50 border border-crust">
        <MenuButton onClick={handleAdminLogoutClick} icon={LogoutIcon} isDanger>Sair do Modo Admin</MenuButton>
    </div>
  );

  return (
    <header className="bg-surface sticky top-0 z-50 border-b border-crust">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
        
        {/* ======================================================================== */}
        {/* BOTÃO DA LOGO CORRIGIDO */}
        {/* ======================================================================== */}
        <button 
          onClick={() => { 
            setActiveView('main'); 
            setIsMenuOpen(false); // Adicionado para fechar o menu ao clicar na logo
          }} 
          className="flex items-center space-x-2"
        >
          <img src="/logo.png" alt="ArrendaSuaCasa Logo" className="w-7 h-7" />
          <h1 className="text-xl font-bold text-text hidden sm:block">ArrendaSuaCasa</h1>
        </button>

        <div className="flex items-center space-x-4">
          <div ref={menuRef} className="relative">
            <button onClick={() => setIsMenuOpen(prev => !prev)} className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-blue transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue">
              {profilePicture ? (
                <img src={profilePicture} alt="Foto de Perfil" className="w-full h-full object-cover" />
              ) : (
                <UserCircleIcon className="w-7 h-7 text-subtext" />
              )}
            </button>

            {hasUnreadMessages && !isMenuOpen && (
              <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-surface pointer-events-none"></span>
            )}
            
            {isMenuOpen && (userRole === UserRole.Admin ? renderAdminMenu() : renderUserMenu())}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;