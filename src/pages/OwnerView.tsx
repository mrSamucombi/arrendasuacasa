import React, { useState, useEffect, useMemo } from 'react';
import { type Owner, type Property, type CoinPackage, type Purchase, PurchaseStatus, VerificationStatus } from '../types';
import PropertyCard from '../components/PropertyCard';
import Button from '../components/Button';
import { getCoinPackages } from '../services/apiService';
import { DashboardIcon, ListIcon, PlusCircleIcon, StoreIcon, CoinsIcon, ShieldCheckIcon } from '../components/icons/Icons';
import PurchaseModal from '../components/PurchaseModal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// CORREÇÃO AQUI
import { propertyFormSchema } from '../../lib/schemas'; 
import { z } from 'zod';
import { toast } from 'react-hot-toast';

// --- TIPOS E INTERFACES ---
export enum OwnerViewTab {
  Dashboard = 'DASHBOARD',
  MyProperties = 'MY_PROPERTIES',
  AddProperty = 'ADD_PROPERTY',
  Store = 'STORE',
}

interface OwnerViewProps {
  owner: Owner;
  properties: Property[];
  purchases: Purchase[];
  onAddProperty: (newPropertyData: any, images: File[]) => void;
  onInitiatePurchase: (pkg: CoinPackage, proofOfPaymentFile: File) => void;
  onSelectProperty: (property: Property) => void;
  onInitiateVerification: (data: { documentFile: File; selfieFile: File; email: string; phone: string; }) => void;
  onDeactivate: (propertyId: string) => void;
  onReactivate: (propertyId: string) => void;
}

// --- COMPONENTES HELPER ---
const FieldError: React.FC<{ message?: string }> = ({ message }) => {
    if (!message) return null;
    return <p className="text-sm text-danger mt-1">{message}</p>;
};

// --- SUB-COMPONENTES ---
const Dashboard: React.FC<{ owner: Owner; propertiesCount: number; purchases: Purchase[] }> = ({ owner, propertiesCount, purchases = [] }) => (
    <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-lg border border-crust space-y-8">
        <div>
            <h2 className="text-3xl font-bold text-text flex items-center">
                Bem-vindo, {owner.name}!
                {owner.verificationStatus === VerificationStatus.Verified && ( <ShieldCheckIcon className="w-8 h-8 ml-3 text-blue" title="Utilizador Verificado"/> )}
            </h2>
            <p className="text-subtext mt-1">Aqui está um resumo da sua atividade na plataforma.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-background p-6 rounded-lg border border-crust">
                    <h3 className="font-semibold text-lg text-text mb-2">Saldo de Moedas</h3>
                    <div className="flex items-center space-x-3">
                        <CoinsIcon className="w-10 h-10 text-yellow-500" />
                        <p className="text-4xl font-extrabold text-blue">{owner.ascBalance} <span className="text-2xl font-semibold">ASC</span></p>
                    </div>
                </div>
                <div className="bg-background p-6 rounded-lg border border-crust">
                    <h3 className="font-semibold text-lg text-text mb-2">Imóveis Publicados</h3>
                     <div className="flex items-center space-x-3">
                        <ListIcon className="w-10 h-10 text-blue" />
                        <p className="text-4xl font-extrabold text-text">{propertiesCount}</p>
                    </div>
                </div>
            </div>
        </div>
        <div>
             <h3 className="text-xl font-bold text-text mb-4">Meu Histórico de Compras</h3>
             <div className="bg-background p-4 rounded-lg max-h-60 overflow-y-auto border border-crust">
                {purchases.length > 0 ? (
                    <ul className="space-y-3">
                        {purchases.map(p => (
                            <li key={p.id} className="flex justify-between items-center text-sm p-3 bg-surface rounded-lg shadow-sm">
                                <div><span className="font-semibold text-text">{p.pkg.coins} ASC</span><span className="text-subtext ml-2">({new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(p.pkg.price)})</span></div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{p.status === 'PENDING' ? 'Pendente' : 'Confirmado'}</span>
                            </li>
                        ))}
                    </ul>
                ) : ( <p className="text-subtext text-center py-4">Ainda não efetuou nenhuma compra.</p> )}
             </div>
        </div>
    </div>
);

const MyProperties: React.FC<{ properties: Property[]; onSelectProperty: (property: Property) => void; onDeactivate: (propertyId: string) => void; onReactivate: (propertyId: string) => void; }> = ({ properties, onSelectProperty, onDeactivate, onReactivate }) => (
    <div className="bg-surface p-8 rounded-xl shadow-lg border border-crust">
        <h2 className="text-3xl font-bold text-text mb-6">Meus Imóveis</h2>
        {properties.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {properties.map(p => ( 
                    <PropertyCard 
                        key={p.id} 
                        property={p} 
                        onSelectProperty={onSelectProperty} 
                        isOwnerView={true}
                        onDeactivate={onDeactivate}
                        onReactivate={onReactivate}
                    /> 
                ))}
            </div>
        ) : ( <p className="text-subtext text-center py-10">Ainda não adicionou nenhum imóvel.</p> )}
    </div>
);

const AddPropertyForm: React.FC<{ owner: Owner, onAddProperty: (data: any, files: File[]) => void }> = ({ owner, onAddProperty }) => {
    type PropertyFormData = z.infer<typeof propertyFormSchema>;
    const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset } = useForm<PropertyFormData>({
        resolver: zodResolver(propertyFormSchema),
        defaultValues: { title: '', address: '', description: '' }
    });
    const canPublish = owner.ascBalance >= 10;
    const imageFiles = watch('images');

    const onSubmit = async (data: PropertyFormData) => {
        if (!canPublish) { toast.error("Saldo de ASC insuficiente."); return; }
        try {
            await onAddProperty({
                title: data.title, address: data.address, description: data.description,
                price: data.price, bedrooms: data.bedrooms, bathrooms: data.bathrooms, area: data.area,
            }, Array.from(data.images));
            reset();
        } catch (error) { /* App.tsx já mostra o toast de erro */ }
    };

    return (
        <div className="bg-surface p-8 rounded-xl shadow-lg border border-crust">
            <h2 className="text-3xl font-bold text-text mb-2">Adicionar Novo Imóvel</h2>
            <p className="mb-6 text-subtext">Publicar um novo imóvel custará <strong className="text-secondary">10 ASC</strong>. Saldo atual: {owner.ascBalance} ASC.</p>
            {!canPublish && ( <div className="bg-red-100 p-4 rounded-lg text-red-700">Saldo Insuficiente!</div> )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div><label htmlFor="title" className="block text-sm font-medium text-text mb-1">Título do Anúncio</label><input id="title" {...register('title')} className="block w-full rounded-lg bg-background border-crust" /><FieldError message={errors.title?.message} /></div>
                <div><label htmlFor="address" className="block text-sm font-medium text-text mb-1">Endereço Completo</label><input id="address" {...register('address')} className="block w-full rounded-lg bg-background border-crust" /><FieldError message={errors.address?.message} /></div>
                <div><label htmlFor="description" className="block text-sm font-medium text-text mb-1">Descrição Detalhada</label><textarea id="description" {...register('description')} rows={4} className="block w-full rounded-lg bg-background border-crust" /><FieldError message={errors.description?.message} /></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div><label htmlFor="price" className="block text-sm font-medium text-text mb-1">Preço (AOA/mês)</label><input id="price" type="number" {...register('price')} className="block w-full rounded-lg bg-background border-crust" /><FieldError message={errors.price?.message} /></div>
                    <div><label htmlFor="bedrooms" className="block text-sm font-medium text-text mb-1">Quartos</label><input id="bedrooms" type="number" {...register('bedrooms')} className="block w-full rounded-lg bg-background border-crust" /><FieldError message={errors.bedrooms?.message} /></div>
                    <div><label htmlFor="bathrooms" className="block text-sm font-medium text-text mb-1">WC</label><input id="bathrooms" type="number" {...register('bathrooms')} className="block w-full rounded-lg bg-background border-crust" /><FieldError message={errors.bathrooms?.message} /></div>
                    <div><label htmlFor="area" className="block text-sm font-medium text-text mb-1">Área (m²)</label><input id="area" type="number" {...register('area')} className="block w-full rounded-lg bg-background border-crust" /><FieldError message={errors.area?.message} /></div>
                </div>
                <div><label className="block text-sm font-medium text-text mb-1">Imagens (1-7)</label><input type="file" multiple accept="image/*" {...register('images')} className="w-full text-sm text-subtext file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" /><FieldError message={errors.images?.message as string} /></div>
                {imageFiles && imageFiles.length > 0 && (<div className="grid grid-cols-3 sm:grid-cols-5 gap-4">{Array.from(imageFiles).map((file, index) => (<img key={index} src={URL.createObjectURL(file as Blob)} alt="preview" className="h-24 w-full object-cover rounded-lg" />))}</div>)}
                <div className="pt-4 text-right"><Button type="submit" variant="primary" disabled={!canPublish || isSubmitting}>{isSubmitting ? 'A Publicar...' : 'Publicar (-10 ASC)'}</Button></div>
            </form>
        </div>
    );
};

const Store: React.FC<{ onSelectPackage: (pkg: CoinPackage) => void }> = ({ onSelectPackage }) => {
    const [packages, setPackages] = useState<CoinPackage[]>([]);
    useEffect(() => { getCoinPackages().then(data => setPackages(data || [])); }, []);
    const getPackageImage = (packageId: string) => {
        switch (packageId) {
            case 'pkg-1': return '/coin-pack-small.png';
            case 'pkg-2': return '/coin-pack-medium.png';
            case 'pkg-3': return '/coin-pack-large.png';
            default: return '/coin-pack-small.png';
        }
    };
    return (
        <div className="bg-surface p-8 rounded-xl shadow-lg border border-crust">
            <h2 className="text-3xl font-bold text-text mb-2">Loja de Moedas ASC</h2>
            <p className="mb-8 text-subtext">Compre moedas para publicar os seus imóveis.</p>
            {packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{packages.map((pkg) => (
                    <div key={pkg.id} className="border border-crust rounded-lg p-6 flex flex-col items-center text-center"><img src={getPackageImage(pkg.id)} alt={pkg.description} className="w-24 h-24 mb-4 object-contain" /><h3 className="text-2xl font-bold text-blue">{pkg.coins} ASC</h3><p className="text-subtext mb-4 flex-grow">{pkg.description}</p><p className="text-3xl font-extrabold">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(pkg.price)}</p><Button onClick={() => onSelectPackage(pkg)} variant="primary" className="mt-4">Comprar Agora</Button></div>
                ))}</div>
            ) : ( <p>Nenhum pacote de moedas encontrado.</p> )}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const OwnerView: React.FC<OwnerViewProps> = ({ owner, properties, purchases, onAddProperty, onInitiatePurchase, onInitiateVerification, onSelectProperty, onDeactivate, onReactivate }) => {
  const [activeTab, setActiveTab] = useState<OwnerViewTab>(OwnerViewTab.Dashboard);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);

  const myProperties = useMemo(() => {
    return (properties || []).filter(property => property.ownerId === owner.id);
  }, [properties, owner.id]);

  const handleSelectPackage = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
setIsModalOpen(true);
  };
  
  const handleConfirmPurchaseRequest = (proofFile: File) => {
    if (selectedPackage) onInitiatePurchase(selectedPackage, proofFile);
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case OwnerViewTab.MyProperties: return <MyProperties properties={myProperties} onSelectProperty={onSelectProperty} onDeactivate={onDeactivate} onReactivate={onReactivate} />;
      case OwnerViewTab.AddProperty: return <AddPropertyForm owner={owner} onAddProperty={onAddProperty} />;
      case OwnerViewTab.Store: return <Store onSelectPackage={handleSelectPackage} />;
      default: return <Dashboard owner={owner} propertiesCount={myProperties.length} purchases={purchases} />;
    }
  };

  const tabItems = [
    { id: OwnerViewTab.Dashboard, label: 'Dashboard', icon: DashboardIcon },
    { id: OwnerViewTab.MyProperties, label: 'Meus Imóveis', icon: ListIcon },
    { id: OwnerViewTab.AddProperty, label: 'Adicionar Imóvel', icon: PlusCircleIcon },
    { id: OwnerViewTab.Store, label: 'Loja de Moedas', icon: StoreIcon },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-1/4 lg:w-1/5">
            <div className="bg-surface p-4 rounded-xl shadow-lg border border-crust">
                <h3 className="font-bold text-lg mb-4 text-text">Painel do Proprietário</h3>
                <nav className="flex flex-col space-y-2">{tabItems.map(tab => ( <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 border-l-4 ${activeTab === tab.id ? 'bg-blue border-blue-500 text-white shadow-lg font-bold' : 'border-transparent text-text hover:bg-background hover:border-blue-200 font-semibold'}`}><tab.icon className="w-6 h-6" /><span>{tab.label}</span></button> ))}</nav>
            </div>
        </aside>
        <main className="flex-1">
            {renderContent()}
        </main>
        <PurchaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} coinPackage={selectedPackage} onConfirm={handleConfirmPurchaseRequest} />
    </div>
  );
};

export default OwnerView;