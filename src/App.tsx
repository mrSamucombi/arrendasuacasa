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
  // --- ESTADOS DO COMPONENTE ---
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

  // --- LÓGICA DE AUTENTICAÇÃO E BUSCA DE DADOS ---

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userProfile = await apiService.getMyProfile();
          if (!userProfile || !userProfile.id || !userProfile.role) {
            throw new Error('Perfil inválido ou não encontrado na base de dados.');
          }
          setCurrentUser(userProfile);
        } else {
          setCurrentUser(null);
          setIsAdminMode(false);
        }
      } catch (error) {
        console.error("Falha na autenticação ou busca de perfil:", error);
        toast.error("Sessão inválida. Por favor, faça login novamente.");
        if (auth.currentUser) await signOut(auth);
        setCurrentUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setIsDataLoading(true);
    try {
      const promises = [
        apiService.getProperties(currentPage, filters),
        apiService.getMyConversations()
      ];

      if (currentUser.role === UserRole.Admin) {
        promises.push(apiService.getUsersToVerify(), apiService.getAdminPendingPurchases(), apiService.getAdminStats());
      } else {
        promises.push(apiService.getClientPurchases());
      }
      
      const [propertiesResponse, convoData, ...rest] = await Promise.all(promises);

      setProperties(propertiesResponse || { data: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } });
      setConversations(convoData || []);

      if (currentUser.role === UserRole.Admin) {
        setUsersToVerify(rest[0] || []);
        setPurchases(rest[1] || []);
        setAdminStats(rest[2]);
      } else {
        setPurchases(rest[0] || []);
      }

    } catch (error) {
      toast.error(`Não foi possível carregar os dados: ${(error as Error).message}`);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentUser, currentPage, filters]);

  useEffect(() => {
    if (!isAuthLoading && currentUser) {
      fetchData();
    }
  }, [isAuthLoading, currentUser, fetchData]);
  
  const hasUnreadMessages = useMemo(() => {
    if (!currentUser) return false;
    // Verifica se o currentUser tem um ID antes de comparar
    const currentUserId = currentUser.id;
    return conversations.some(convo => convo.messages?.some(msg => !msg.isRead && msg.senderId !== currentUserId));
  }, [conversations, currentUser]);
  
  // --- HANDLERS DE EVENTOS ---

  const handleLogout = useCallback(async () => { await signOut(auth); }, []);
  const handleAdminLogout = useCallback(() => setIsAdminMode(false), []);
  const handlePageChange = (newPage: number) => { if (newPage > 0 && newPage <= properties.pagination.totalPages) setCurrentPage(newPage); };
  const handleFilterChange = (newFilters: any) => { setCurrentPage(1); setFilters(newFilters); };
  const handleSelectProperty = (property: Property) => setSelectedProperty(property);
  const handleGoBackToList = () => setSelectedProperty(null);
  const handleInitiateChat = (propertyId: string) => { setInitialChatPropertyId(propertyId); setActiveView('messages'); setSelectedProperty(null); };

  const handleProfileUpdate = (updatedUserData: AuthenticatedUser) => {
    setCurrentUser(updatedUserData);
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
    const promise = apiService.initiateVerification(currentUser.id, data).then((updatedOwner) => {
      setCurrentUser({ user: updatedOwner, role: UserRole.Owner });
      setActiveView('main');
    });
    toast.promise(promise, { loading: 'A enviar documentos...', success: 'Documentos enviados para verificação!', error: (err) => `Falha: ${err.message}` });
  };

  const handleAddProperty = async (propertyData: Omit<Property, 'id' | 'ownerId' | 'imageUrls'>, images: File[]) => {
    const promise = apiService.addProperty(propertyData, images).then((response) => {
      const { newProperty, updatedOwner } = response;
      if (!newProperty || !updatedOwner) {
        throw new Error("A resposta da API está incompleta.");
      }
      setProperties(prev => ({ ...prev, data: [newProperty, ...prev.data] }));
      setCurrentUser({ user: updatedOwner, role: UserRole.Owner });
    });
    toast.promise(promise, { loading: 'A publicar o seu imóvel...', success: 'Imóvel publicado com sucesso!', error: (err) => `Falha ao publicar: ${err.message}` });
  };

  const handleToggleFavorite = async (propertyId: string) => {
    if (!currentUser) return;
    try {
      // Otimista: atualiza a UI primeiro
      const updatedUser = await apiService.toggleFavorite(propertyId);
      setCurrentUser({ user: updatedUser, role: UserRole.Client });
      toast.success("Favoritos atualizados!");
    } catch (error) {
      toast.error(`Falha ao atualizar favoritos.`);
      // Reverte a UI se a API falhar
      fetchData();
    }
  };

  const handleDeactivateProperty = async (propertyId: string) => {
    const promise = apiService.deactivateProperty(propertyId);
    toast.promise(promise, {
      loading: 'A desativar...',
      success: (updatedProperty) => {
        setProperties(prev => ({ ...prev, data: prev.data.map(p => p.id === propertyId ? updatedProperty : p) }));
        return 'Imóvel desativado!';
      },
      error: (err) => `Falha: ${err.message}`
    });
  };

  const handleReactivateProperty = async (propertyId: string) => {
    const promise = apiService.reactivateProperty(propertyId);
    toast.promise(promise, {
      loading: 'A reativar...',
      success: (response) => {
        const { updatedProperty, updatedOwner } = response;
        setProperties(prev => ({ ...prev, data: prev.data.map(p => p.id === propertyId ? updatedProperty : p) }));
        setCurrentUser({ user: updatedOwner, role: UserRole.Owner });
        return 'Imóvel reativado!';
      },
      error: (err) => `Falha: ${err.message}`
    });
  };

  // --- RENDERIZAÇÃO ---

  const renderView = () => {
    if (selectedProperty) {
      return <PropertyDetailPage property={selectedProperty} onGoBack={handleGoBackToList} onInitiateChat={handleInitiateChat} currentUser={currentUser} />;
    }

    const role = isAdminMode ? UserRole.Admin : currentUser?.role;
    if (!currentUser) return null;

    switch (activeView) {
      case 'settings':
        return <ProfileEditPage currentUser={currentUser} onProfileUpdate={handleProfileUpdate} onGoBack={() => setActiveView('main')} />;
      case 'help':
        return <HelpCenterPage />;
      case 'terms':
        return <TermsPage />;
      case 'my-profile':
        return currentUser.role === UserRole.Client ? <ClientProfilePage client={currentUser.user as Client} onToggleFavorite={handleToggleFavorite} onSelectProperty={handleSelectProperty}/> : null;
      case 'owner-profile':
        return currentUser.role === UserRole.Owner ? <OwnerProfilePage owner={currentUser.user as Owner} onInitiateVerification={handleInitiateVerification} /> : null;
      case 'messages':
        return <ChatView currentUser={currentUser} initialPropertyId={initialChatPropertyId} />;
      default: // 'main'
        if (role === UserRole.Admin) return <AdminView stats={adminStats} usersToVerify={usersToVerify} purchases={purchases} onConfirmVerification={handleConfirmVerification} onConfirmPurchase={handleConfirmPurchase} onRefreshData={fetchData}/>;
        if (role === UserRole.Owner) return <OwnerView owner={currentUser.user as Owner} properties={properties.data} purchases={purchases} onAddProperty={handleAddProperty} onInitiatePurchase={handleInitiatePurchase} onInitiateVerification={handleInitiateVerification} onSelectProperty={handleSelectProperty} onDeactivate={handleDeactivateProperty} onReactivate={handleReactivateProperty} />;
        if (role === UserRole.Client) return <ClientView client={currentUser.user as Client} properties={properties} purchases={purchases} onToggleFavorite={handleToggleFavorite} onSelectProperty={handleSelectProperty} onPageChange={handlePageChange} onFilterChange={handleFilterChange} currentFilters={filters} />;
        return null;
    }
  };
  
  if (isAuthLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }
  
  if (!hasConsented) {
    return <AgreementModal onAgree={() => { localStorage.setItem('arrenda-sua-casa-consent', 'true'); setHasConsented(true); }} />;
  }
  
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} onAdminLogin={() => setIsAdminMode(true)} />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-text">
      <Toaster position="top-right" toastOptions={{ className: 'bg-surface text-text border border-crust shadow-lg' }} />
      <Navbar userRole={currentUser.role} onLogout={handleLogout} currentUser={currentUser} onAdminLogout={handleAdminLogout} setActiveView={setActiveView} hasUnreadMessages={hasUnreadMessages} />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {isDataLoading ? <div className="flex justify-center mt-16"><LoadingSpinner /></div> : renderView()}
      </main>
      <footer className="bg-surface text-subtext text-center p-4 mt-auto border-t border-crust"><p>© {new Date().getFullYear()} ArrendaSuaCasa. Todos os direitos reservados.</p></footer>
    </div>
  );
}

export default App;