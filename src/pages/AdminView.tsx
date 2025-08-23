import React, { useState, useMemo } from 'react';
import { type Purchase, PurchaseStatus, type Owner, VerificationStatus } from '../types';
import Button from '../components/Button';
import { ShieldCheckIcon, BanknotesIcon, ArchiveBoxIcon, DashboardIcon, UsersIcon, ListIcon } from '../components/icons/Icons';
import LoadingSpinner from '../components/LoadingSpinner';

// --- INTERFACES E TIPOS ---
interface AdminViewProps {
  stats: any;
  purchases: Purchase[];
  onConfirmPurchase: (purchaseId: string) => void;
  usersToVerify: Owner[];
  onConfirmVerification: (ownerId: string) => void;
  onRefreshData: () => void;
}

type AdminViewTab = 'dashboard' | 'verifications' | 'pending_purchases' | 'purchase_history';

// ========================================================================
// SEUS SUB-COMPONENTES ORIGINAIS (SEM ALTERAÇÕES)
// ========================================================================

const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center mt-6 space-x-2">
      <Button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</Button>
      {Array.from({ length: totalPages }, (_, i) => (<Button key={i} onClick={() => onPageChange(i + 1)} variant={currentPage === i + 1 ? 'primary' : 'secondary'}>{i + 1}</Button>))}
      <Button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Próximo</Button>
    </div>
  );
};

const PendingVerifications: React.FC<{ usersToVerify: Owner[]; onConfirmVerification: (ownerId: string) => void; }> = ({ usersToVerify, onConfirmVerification }) => {
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const filteredUsers = useMemo(() => (usersToVerify || []).filter(u => u.user && u.user.name.toLowerCase().includes(filter.toLowerCase())), [filter, usersToVerify]);
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-lg border border-crust">
        <div className="mb-8"><h2 className="text-3xl font-bold text-text">Verificações de Identidade Pendentes</h2><p className="text-subtext mt-1">Aprove os pedidos de verificação de identidade dos proprietários.</p></div>
        <input type="text" placeholder="Filtrar por nome..." value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="border p-2 rounded mb-4 w-full bg-background" />
        {paginatedUsers.length > 0 ? ( <div className="space-y-4">{paginatedUsers.map(user => ( <div key={user.id} className="bg-background p-4 rounded-lg shadow-sm border border-crust"><div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center"><div className="md:col-span-2"><p className="font-bold text-lg text-primary">{user.user.name}</p><p className="text-sm text-subtext"><strong>Email:</strong> {user.user.email}</p><p className="text-sm text-subtext"><strong>Telefone:</strong> {user.phoneNumber}</p><div className="mt-2 flex space-x-4"><a href={user.verificationDocumentUrl || '#'} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue hover:underline">Ver Documento</a><a href={user.verificationSelfieUrl || '#'} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue hover:underline">Ver Selfie</a></div></div><div className="mt-4 md:mt-0 md:text-right"><Button onClick={() => onConfirmVerification(user.id)} className="w-full md:w-auto">Aprovar Verificação</Button></div></div></div> ))}</div> ) : ( <p className="text-subtext text-center py-4">Nenhuma verificação pendente encontrada.</p> )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

const PendingPurchases: React.FC<{ pendingPurchases: Purchase[]; onConfirmPurchase: (purchaseId: string) => void; }> = ({ pendingPurchases, onConfirmPurchase }) => {
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const filteredPurchases = useMemo(() => (pendingPurchases || []).filter(p => p.id.toLowerCase().includes(filter.toLowerCase()) || p.pkg?.coins.toString().includes(filter)), [filter, pendingPurchases]);
  const totalPages = Math.ceil(filteredPurchases.length / pageSize);
  const paginatedPurchases = filteredPurchases.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-lg border border-crust">
      <div className="mb-8"><h2 className="text-3xl font-bold text-text">Aprovações de Compra Pendentes</h2><p className="text-subtext mt-1">Confirme os pagamentos para creditar as moedas.</p></div>
      <input type="text" placeholder="Filtrar por ID da transação ou ASC..." value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="border p-2 rounded mb-4 w-full bg-background" />
      {paginatedPurchases.length > 0 ? ( <div className="space-y-4">{paginatedPurchases.map(p => (
        <div key={p.id} className="bg-background p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center shadow-sm border border-crust">
          <div className="flex-grow"><p className="font-bold text-lg text-primary">{p.pkg?.coins || 'N/A'} ASC</p><p className="text-sm text-subtext">Valor: {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(p.pkg?.price || 0)}</p><p className="text-xs text-subtext/70 mt-1">ID da Transação: {p.id}</p><p className="text-xs text-subtext/70">Data Pedido: {new Date(p.createdAt).toLocaleString('pt-AO')}</p></div>
          <div className="mt-4 sm:mt-0 sm:mx-4 flex-shrink-0"><Button variant="link" className="font-semibold text-blue hover:underline" onClick={() => { if (p.proofOfPayment) { window.open(p.proofOfPayment, '_blank', 'noopener,noreferrer'); } }}>Ver Comprovativo</Button></div>
          <div className="mt-4 sm:mt-0 flex-shrink-0"><Button onClick={() => onConfirmPurchase(p.id)} variant="secondary" className="w-full sm:w-auto">Confirmar Pagamento</Button></div>
        </div>
      ))}</div> ) : ( <p className="text-subtext text-center py-4">Nenhuma compra pendente encontrada.</p> )}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

const ConfirmedPurchasesHistory: React.FC<{ confirmedPurchases: Purchase[] }> = ({ confirmedPurchases }) => {
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const filtered = useMemo(() => (confirmedPurchases || []).filter(p => p.id.toLowerCase().includes(filter.toLowerCase()) || p.pkg?.coins.toString().includes(filter)), [filter, confirmedPurchases]);
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  
    return (
      <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-lg border border-crust">
        <h3 className="text-xl font-bold text-text mb-4">Histórico de Compras Aprovadas</h3>
        <input type="text" placeholder="Filtrar por ID ou ASC..." value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="border p-2 rounded mb-4 w-full bg-background" />
        {paginated.length > 0 ? (
          <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {paginated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(p => (
                <li key={p.id} className="bg-background p-3 rounded-md flex justify-between items-center text-sm shadow-sm">
                  <div><span className="font-semibold">{p.pkg?.coins || 'N/A'} ASC</span><span className="text-subtext ml-2">({new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(p.pkg?.price || 0)})</span><p className="text-xs text-subtext/70 mt-1">ID: {p.id} | Confirmado em: {p.confirmedAt ? new Date(p.confirmedAt).toLocaleString('pt-AO') : '-'}</p></div>
                  <div className="text-right"><Button variant="link" className="text-xs" onClick={() => { if (p.proofOfPayment) window.open(p.proofOfPayment, '_blank', 'noopener,noreferrer'); }}>Ver Comp.</Button><span className="block mt-1 px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">Confirmado</span></div>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-subtext text-center py-4">Nenhuma compra encontrada.</p>
        )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    );
};

const AdminDashboard: React.FC<{ stats: any; onNavigate: (tab: AdminViewTab) => void }> = ({ stats, onNavigate }) => {
    if (!stats) {
        return <div className="flex justify-center items-center p-8"><LoadingSpinner /></div>;
    }
    const statCards = [
        { label: 'Total de Utilizadores', value: stats.totalUsers, icon: UsersIcon },
        { label: 'Total de Imóveis', value: stats.totalProperties, icon: ListIcon },
        { label: 'Verificações Pendentes', value: stats.pendingVerifications, actionTab: 'verifications' as AdminViewTab },
        { label: 'Compras Pendentes', value: stats.pendingPurchases, actionTab: 'pending_purchases' as AdminViewTab },
    ];
    return (
        <div className="bg-surface p-8 rounded-xl shadow-lg border border-crust">
            <h2 className="text-3xl font-bold text-text mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map(card => (
                    <div key={card.label} className={`bg-background p-6 rounded-lg border border-crust ${card.actionTab && card.value > 0 ? 'cursor-pointer hover:bg-surface hover:border-blue' : ''}`}
                         onClick={() => card.actionTab && card.value > 0 && onNavigate(card.actionTab)}>
                        <h3 className="font-semibold text-subtext mb-2">{card.label}</h3>
                        <p className={`text-5xl font-extrabold ${card.value > 0 ? 'text-blue' : 'text-text'}`}>{card.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ========================================================================
// COMPONENTE PRINCIPAL REESTRUTURADO
// ========================================================================
const AdminView: React.FC<AdminViewProps> = ({ stats, purchases = [], onConfirmPurchase, usersToVerify = [], onConfirmVerification, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<AdminViewTab>('dashboard');

  const pendingPurchases = useMemo(() => purchases.filter(p => p.status === 'PENDING'), [purchases]);
  const confirmedPurchases = useMemo(() => purchases.filter(p => p.status === 'CONFIRMED'), [purchases]);
  const pendingUsers = useMemo(() => usersToVerify.filter(u => u.verificationStatus === 'PENDING'), [usersToVerify]);
  
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard stats={stats} onNavigate={setActiveTab} />;
      case 'pending_purchases':
        return <PendingPurchases pendingPurchases={pendingPurchases} onConfirmPurchase={onConfirmPurchase} />;
      case 'purchase_history':
        return <ConfirmedPurchasesHistory confirmedPurchases={confirmedPurchases} />;
      case 'verifications':
      default:
        return <PendingVerifications usersToVerify={pendingUsers} onConfirmVerification={onConfirmVerification} />;
    }
  };

  const tabItems = [
    { id: 'dashboard' as AdminViewTab, label: 'Dashboard', icon: DashboardIcon },
    { id: 'verifications' as AdminViewTab, label: `Verificações (${pendingUsers.length})`, icon: ShieldCheckIcon },
    { id: 'pending_purchases' as AdminViewTab, label: `Compras Pendentes (${pendingPurchases.length})`, icon: BanknotesIcon },
    { id: 'purchase_history' as AdminViewTab, label: `Histórico (${confirmedPurchases.length})`, icon: ArchiveBoxIcon },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-1/4 lg:w-1-5">
        <div className="bg-surface p-4 rounded-xl shadow-lg border border-crust">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-text">Painel de Admin</h3>
            <Button onClick={onRefreshData} variant="secondary" className="p-2 h-auto">🔄</Button>
          </div>
          <nav className="flex flex-col space-y-2">
            {tabItems.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 border-l-4 ${
                  activeTab === tab.id
                    ? 'bg-blue border-blue-500 text-white shadow-lg font-bold'
                    : 'border-transparent text-text hover:bg-background hover:border-blue-200 font-semibold'
                }`}
              >
                <tab.icon className="w-6 h-6" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminView;