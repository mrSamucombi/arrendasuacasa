import React, { useState, useEffect } from 'react';
import { type Client, type Property, type Purchase } from '../types';
import PropertyCard from '../components/PropertyCard';
import Button from '../components/Button';
import { CompassIcon, HeartIconOutline, HomeIcon } from '../components/icons/Icons';

// --- INTERFACES E TIPOS ---
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface PaginatedProperties {
  data: Property[];
  pagination: PaginationInfo;
}

interface ClientViewProps {
  client: Client;
  properties: PaginatedProperties;
  purchases: Purchase[];
  onToggleFavorite?: (propertyId: string) => void;
  onSelectProperty: (property: Property) => void;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: any) => void;
  currentFilters: any;
}

type ClientViewTab = 'explore' | 'favorites';

// --- SUB-COMPONENTES ---

const FilterBar: React.FC<{ onFilter: (filters: any) => void; initialFilters: any }> = ({ onFilter, initialFilters }) => {
  const [localFilters, setLocalFilters] = useState(initialFilters);

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters({ ...localFilters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(localFilters);
  };

  const handleClear = () => {
    const cleared = { searchTerm: '', minPrice: '', maxPrice: '', bedrooms: '' };
    setLocalFilters(cleared);
    onFilter(cleared);
  };

  return (
    <form onSubmit={handleSearch} className="bg-surface p-4 rounded-xl shadow-lg border border-crust mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="lg:col-span-2">
          <label htmlFor="searchTerm" className="text-sm font-medium text-text">Procurar</label>
          <input type="text" name="searchTerm" id="searchTerm" value={localFilters.searchTerm || ''} onChange={handleChange} placeholder="Título ou Endereço..." className="w-full mt-1 rounded-lg bg-background border-crust" />
        </div>
        <div>
          <label htmlFor="minPrice" className="text-sm font-medium text-text">Preço Mín.</label>
          <input type="number" name="minPrice" id="minPrice" value={localFilters.minPrice || ''} onChange={handleChange} placeholder="Ex: 50000" className="w-full mt-1 rounded-lg bg-background border-crust" />
        </div>
        <div>
          <label htmlFor="maxPrice" className="text-sm font-medium text-text">Preço Máx.</label>
          <input type="number" name="maxPrice" id="maxPrice" value={localFilters.maxPrice || ''} onChange={handleChange} placeholder="Ex: 250000" className="w-full mt-1 rounded-lg bg-background border-crust" />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" className="w-full">Filtrar</Button>
          <Button type="button" variant="secondary" onClick={handleClear} className="w-full">Limpar</Button>
        </div>
      </div>
    </form>
  );
};

const ExploreProperties: React.FC<{ properties: Property[]; favoriteIds: Set<string>; onToggleFavorite?: (propertyId: string) => void; onSelectProperty: (property: Property) => void; }> = ({ properties, favoriteIds, onToggleFavorite, onSelectProperty }) => (
  <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-lg border border-crust">
    <div className="mb-8"><h2 className="text-3xl font-bold text-text">Explorar Imóveis</h2><p className="text-subtext mt-1">Encontre a sua próxima casa de sonho.</p></div>
    {properties.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{properties.map(property => (<PropertyCard key={property.id} property={property} isFavorite={favoriteIds.has(property.id)} onToggleFavorite={onToggleFavorite} onSelectProperty={onSelectProperty} />))}</div>
    ) : (
      <div className="text-center py-16"><HomeIcon className="w-16 h-16 mx-auto text-crust mb-4" /><h3 className="text-xl text-text font-semibold">Nenhum Imóvel Encontrado</h3><p className="text-subtext mt-1">Tente ajustar os seus filtros ou volte mais tarde.</p></div>
    )}
  </div>
);

const FavoriteProperties: React.FC<{ client: Client; onToggleFavorite?: (propertyId: string) => void; onSelectProperty: (property: Property) => void; }> = ({ client, onToggleFavorite, onSelectProperty }) => {
  const favoriteProperties = client?.favoriteProperties || [];
  return (
    <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-lg border border-crust">
      <div className="mb-8"><h2 className="text-3xl font-bold text-text">Meus Favoritos</h2><p className="text-subtext mt-1">Os imóveis que você guardou.</p></div>
      {favoriteProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{favoriteProperties.map(property => (<PropertyCard key={property.id} property={property} isFavorite={true} onToggleFavorite={onToggleFavorite} onSelectProperty={onSelectProperty} />))}</div>
      ) : (
        <div className="text-center py-16"><HeartIconOutline className="w-16 h-16 mx-auto text-crust mb-4" /><h3 className="text-xl text-text font-semibold">Nenhum Favorito Adicionado</h3><p className="text-subtext mt-1">Clique no coração de um imóvel para o guardar aqui.</p></div>
      )}
    </div>
  );
};

const Pagination: React.FC<{ pagination: PaginationInfo, onPageChange: (page: number) => void }> = ({ pagination, onPageChange }) => {
    if (!pagination || pagination.totalPages <= 1) return null;
    return (
      <div className="flex justify-center mt-8 space-x-2">
        <Button onClick={() => onPageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>Anterior</Button>
        <span className="p-2 text-text font-semibold">Página {pagination.currentPage} de {pagination.totalPages}</span>
        <Button onClick={() => onPageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}>Próximo</Button>
      </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const ClientView: React.FC<ClientViewProps> = ({ client, properties, purchases, onToggleFavorite, onSelectProperty, onPageChange, onFilterChange, currentFilters }) => {
  const [activeTab, setActiveTab] = useState<ClientViewTab>('explore');
  const favoriteIds = new Set(client?.favoriteProperties?.map(p => p.id) || []);

  const renderContent = () => {
    switch (activeTab) {
      case 'favorites':
        return <FavoriteProperties client={client} onToggleFavorite={onToggleFavorite} onSelectProperty={onSelectProperty} />;
      case 'explore':
      default:
        return (
          <>
            <FilterBar onFilter={onFilterChange} initialFilters={currentFilters} />
            <ExploreProperties 
              properties={properties?.data ?? []} 
              favoriteIds={favoriteIds} 
              onToggleFavorite={onToggleFavorite} 
              onSelectProperty={onSelectProperty} 
            />
            <Pagination 
              pagination={properties.pagination} 
              onPageChange={onPageChange} 
            />
          </>
        );
    }
  };

  const tabItems = [
    { id: 'explore' as ClientViewTab, label: 'Explorar Imóveis', icon: CompassIcon },
    { id: 'favorites' as ClientViewTab, label: `Favoritos (${favoriteIds.size})`, icon: HeartIconOutline },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-1/4 lg:w-1/5">
        <div className="bg-surface p-4 rounded-xl shadow-lg border border-crust">
          <h3 className="font-bold text-lg mb-4 text-text">Painel do Cliente</h3>
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

export default ClientView;