import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserRole, AuthenticatedUser, Owner, Client, Property, Purchase, CoinPackage } from './types';
import Navbar from '../src/components/Navbar';
import ClientView from '../src/pages/ClientView';
import OwnerView from '../src/pages/OwnerView';
import AdminView from '../src/pages/AdminView';
import SettingsPage from '../src/pages/SettingsPage';
import HelpCenterPage from '../src/pages/HelpCenterPage';
import TermsPage from '../src/pages/TermsPage';
import ClientProfilePage from '../src/pages/ClientProfilePage';
import OwnerProfilePage from '../src/pages/OwnerProfilePage';
import PropertyDetailPage from '../src/pages/PropertyDetailPage';
import AgreementModal from '../src/components/AgreementModal';
import AuthPage from '../src/pages/AuthPage';
import ChatView from '../src/pages/ChatView';
import ProfileEditPage from '../src/pages/ProfileEditPage';
import * as apiService from '../src/services/apiService';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import LoadingSpinner from '../src/components/LoadingSpinner';
import { Toaster, toast } from 'react-hot-toast';


interface PaginatedProperties {
  data: Property[];
  pagination: { currentPage: number; totalPages: number; totalItems: number; };
}

function App() {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [properties, setProperties] = useState<PaginatedProperties>({ data: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } });
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [usersToVerify, setUsersToVerify] = useState<Owner[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [adminStats, setAdminStats] = useState(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [activeView, setActiveView] = useState<'main' | 'settings' | 'help' | 'terms' | 'my-profile' | 'owner-profile' | 'messages'>('main');
  const [hasConsented, setHasConsented] = useState(() => localStorage.getItem('arrenda-sua-casa-consent') === 'true');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [initialChatPropertyId, setInitialChatPropertyId] = useState<string | null>(null);

  useEffect(() => {
  // O estado 'isAuthLoading' já começa como 'true', não precisamos de o redefinir aqui.
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      if (firebaseUser) {
        // Se houver um utilizador no Firebase, buscamos o perfil detalhado na nossa API.
        
        // A nossa função corrigida getMyProfile não precisa do token, pois fetchWithAuth o adiciona.
        // E ela já retorna o objeto do utilizador diretamente!
        const userProfile = await apiService.getMyProfile(); 

        // Verificação de segurança: garante que o perfil retornado é válido.
          if (!userProfile || !userProfile.id || !userProfile.role) {
          throw new Error('Perfil inválido ou não encontrado na base de dados.');
          }

        // ---> A CORREÇÃO PRINCIPAL <---
        // Agora, o estado currentUser terá o formato { id: ..., role: ..., ... }
          setCurrentUser(userProfile);

        } else {
          // Se não houver utilizador no Firebase, limpamos o estado.
          setCurrentUser(null);
          setIsAdminMode(false);
        }
      } catch (error) {
      console.error("Falha na autenticação ou busca de perfil:", error);
      // Se algo der errado, garantimos que o utilizador seja deslogado.
      if (auth.currentUser) await signOut(auth);
        setCurrentUser(null);
      } finally {
      // Independentemente do resultado, o carregamento inicial da autenticação terminou.
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe(); // Limpa o listener ao desmontar
  }, []); // Array de dependências vazio significa que só corre uma vez.

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setIsDataLoading(true);
    try {
      const [propertiesResponse, convoData] = await Promise.all([
        apiService.getProperties(currentPage, filters),
        apiService.getMyConversations()
      ]);
      setProperties(propertiesResponse || { data: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } });
      setConversations(convoData || []);
      if (currentUser.role === UserRole.Admin) {
        const [usersToVerifyData, adminPurchasesData, statsData] = await Promise.all([
          apiService.getUsersToVerify(), apiService.getAdminPendingPurchases(), apiService.getAdminStats()
        ]);
        setUsersToVerify(usersToVerifyData || []);
        setPurchases(adminPurchasesData || []);
        setAdminStats(statsData);
      } else {
        const purchasesData = await apiService.getClientPurchases();
        setPurchases(purchasesData || []);
      }
    } catch (error) {
      toast.error("Não foi possível carregar os dados.");
    } finally {
      setIsDataLoading(false);
    }
  }, [currentUser, currentPage, filters]);

  useEffect(() => {
    if (!isAuthLoading) fetchData();
  }, [isAuthLoading, fetchData]);

  const hasUnreadMessages = useMemo(() => {
    if (!currentUser) return false;
    return conversations.some(convo => convo.messages?.some(msg => !msg.isRead && msg.senderId !== currentUser));
  }, [conversations, currentUser]);
  
  const handleLoginSuccess = useCallback((userData: AuthenticatedUser) => { setCurrentUser(userData); }, []);
  const handleLogout = useCallback(async () => { await signOut(auth); }, []);
  const handleAdminLogout = useCallback(() => setIsAdminMode(false), []);
  const handlePageChange = (newPage: number) => { if (newPage > 0 && newPage <= properties.pagination.totalPages) setCurrentPage(newPage); };
  const handleFilterChange = (newFilters: any) => { setCurrentPage(1); setFilters(newFilters); };
  const handleSelectProperty = (property: Property) => setSelectedProperty(property);
  const handleGoBackToList = () => setSelectedProperty(null);
  const handleInitiateChat = (propertyId: string) => { setInitialChatPropertyId(propertyId); setActiveView('messages'); setSelectedProperty(null); };
  const handleProfileUpdate = (updatedUserData: Partial<AuthenticatedUser>) => {
    setCurrentUser(previousUser => {
      // Se não houver um utilizador anterior, não faz nada
      if (!previousUser) return null;

      // Cria um novo objeto, fundindo o estado antigo com os dados atualizados
      return {
        ...previousUser, // <-- Mantém todos os dados antigos (saldo, imóveis, etc.)
        ...updatedUserData, // <-- Sobrescreve apenas os campos que mudaram (nome, foto)
      };
    });
  };

  const handleConfirmVerification = async (ownerId: string) => {
    const promise = apiService.confirmVerification(ownerId).then(() => setUsersToVerify(prev => prev.filter(user => user.id !== ownerId)));
    toast.promise(promise, { loading: 'A aprovar...', success: 'Verificação aprovada!', error: (err) => `Falha: ${err.message}` });
  };
  
  const handleConfirmPurchase = async (purchaseId: string) => {
    const promise = apiService.confirmPurchase(purchaseId).then(() => setPurchases(prev => prev.filter(p => p.id !== purchaseId)));
    toast.promise(promise, { loading: 'A aprovar...', success: 'Compra aprovada!', error: (err) => `Falha: ${err.message}` });
  };
  
  const handleInitiatePurchase = async (pkg: CoinPackage, proofFile: File) => {
    const promise = apiService.initiatePurchase(pkg.id, proofFile).then(() => fetchData());
    toast.promise(promise, { loading: 'A enviar pedido...', success: 'Pedido enviado!', error: (err) => `Falha: ${err.message}` });
  };

  const handleInitiateVerification = async (data: { documentFile: File; selfieFile: File; email: string; phone: string; }) => {
    if (!currentUser) return;
    const promise = apiService.initiateVerification(currentUser, data).then(() => {
      setCurrentUser(prev => prev ? ({ ...prev, user: { ...prev.user, verificationStatus: 'PENDING' } as Owner }) : null);
      setActiveView('main');
    });
    toast.promise(promise, { loading: 'A enviar documentos...', success: 'Documentos enviados!', error: (err) => `Falha: ${err.message}` });
  };

  const handleAddProperty = async (propertyData, images) => {
    const promise = apiService.addProperty(propertyData, images).then((newProperty) => {
      setProperties(prev => ({ ...prev, data: [newProperty, ...prev.data] }));
      setCurrentUser(prevUser => {
        if (!prevUser || !('ascBalance' in prevUser.user)) return prevUser;
        const updatedOwner = { ...prevUser.user, ascBalance: prevUser.user.ascBalance - 10 };
        return { ...prevUser, user: updatedOwner };
      });
    });
    toast.promise(promise, { loading: 'A publicar...', success: 'Imóvel publicado!', error: (err) => `Falha: ${err.message}` });
  };
  
  const handleToggleFavorite = async (propertyId: string) => {
    if (!currentUser) return;
    const previousUser = currentUser;
    try {
      await apiService.toggleFavorite(propertyId);
      const updatedProfile = await apiService.getMyProfile();
      setCurrentUser(updatedProfile);
      toast.success("Favoritos atualizados!");
    } catch (error) {
      toast.error(`Falha ao atualizar favoritos.`);
      setCurrentUser(previousUser);
    }
  };

  const handleDeactivateProperty = async (propertyId: string) => {
    const promise = apiService.deactivateProperty(propertyId);
    toast.promise(promise, { loading: 'A desativar...', success: (updatedProperty) => { setProperties(prev => ({ ...prev, data: prev.data.map(p => p.id === propertyId ? updatedProperty : p) })); return 'Imóvel desativado!'; }, error: (err) => `Falha: ${err.message}` });
  };

  const handleReactivateProperty = async (propertyId: string) => {
    const promise = apiService.reactivateProperty(propertyId);
    toast.promise(promise, { loading: 'A reativar...', success: (response) => { const { updatedProperty, updatedOwner } = response; setProperties(prev => ({ ...prev, data: prev.data.map(p => p.id === propertyId ? updatedProperty : p) })); setCurrentUser(prev => prev ? ({ ...prev, user: updatedOwner }) : null); return 'Imóvel reativado!'; }, error: (err) => `Falha: ${err.message}` });
  };

  const renderView = () => {
    if (selectedProperty) return <PropertyDetailPage property={selectedProperty} onGoBack={handleGoBackToList} onInitiateChat={handleInitiateChat} currentUser={currentUser} />;
    const role = isAdminMode ? UserRole.Admin : currentUser?.role;
    if (!currentUser) return null;
    
    switch (activeView) {
      case 'settings': return <ProfileEditPage currentUser={currentUser} onProfileUpdate={handleProfileUpdate} onGoBack={() => setActiveView('main')} />;
      case 'help': return <HelpCenterPage />;
      case 'terms': return <TermsPage />;
      case 'my-profile': return <ClientProfilePage client={currentUser as Client} onToggleFavorite={handleToggleFavorite} onSelectProperty={handleSelectProperty}/>;
      case 'owner-profile': return <OwnerProfilePage owner={currentUser as Owner} onInitiateVerification={handleInitiateVerification} />;
      case 'messages': return <ChatView currentUser={currentUser} initialPropertyId={initialChatPropertyId} />;
      default:
        if (role === UserRole.Admin) return ( <AdminView stats={adminStats} usersToVerify={usersToVerify} purchases={purchases} onConfirmVerification={handleConfirmVerification} onConfirmPurchase={handleConfirmPurchase} onRefreshData={fetchData}/> );
        if (role === UserRole.Owner) return ( <OwnerView owner={currentUser as Owner} properties={properties.data} purchases={purchases} onAddProperty={handleAddProperty} onInitiatePurchase={handleInitiatePurchase} onInitiateVerification={handleInitiateVerification} onSelectProperty={handleSelectProperty} onDeactivate={handleDeactivateProperty} onReactivate={handleReactivateProperty} /> );
        if (role === UserRole.Client) return ( <ClientView client={currentUser as Client} properties={properties} purchases={purchases} onToggleFavorite={handleToggleFavorite} onSelectProperty={handleSelectProperty} onPageChange={handlePageChange} onFilterChange={handleFilterChange} currentFilters={filters} /> );
        return null;
    }
  };
  
  if (isAuthLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  if (!hasConsented) return <AgreementModal onAgree={() => { localStorage.setItem('arrenda-sua-casa-consent', 'true'); setHasConsented(true); }} />;
  if (!currentUser) return <AuthPage onLoginSuccess={handleLoginSuccess} onAdminLogin={() => setIsAdminMode(true)} />;
  
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-text">
      <Toaster position="top-right" toastOptions={{ className: 'bg-surface text-text border border-crust shadow-lg' }} />
      <Navbar userRole={currentUser.role} onLogout={handleLogout} currentUser={currentUser} onAdminLogout={handleAdminLogout} setActiveView={setActiveView} hasUnreadMessages={hasUnreadMessages} />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {isDataLoading ? <div className="flex justify-center mt-16"><LoadingSpinner /></div> : renderView()}
      </main>
      <footer className="bg-primary text-white text-center p-4 mt-auto"><p>© {new Date().getFullYear()} Arrenda Sua Casa.</p></footer>
    </div>
  );
}

export default App;