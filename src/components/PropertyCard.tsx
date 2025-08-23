import React from 'react';
import { type Property } from '../types';
import { BedIcon, BathIcon, AreaIcon, HeartIconOutline, HeartIconSolid } from './icons/Icons';
import Button from './Button';

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
  onSelectProperty?: (property: Property) => void;
  // Novos props para as ações do proprietário
  isOwnerView?: boolean;
  onDeactivate?: (propertyId: string) => void;
  onReactivate?: (propertyId: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  isFavorite, 
  onToggleFavorite, 
  onSelectProperty, 
  isOwnerView, 
  onDeactivate, 
  onReactivate 
}) => {
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique no coração acione o clique no cartão
    onToggleFavorite?.(property.id);
  };

  const handleActionClick = (e: React.MouseEvent, action: 'deactivate' | 'reactivate') => {
      e.stopPropagation(); // Impede que o clique no botão acione o clique no cartão
      if (action === 'deactivate') {
          onDeactivate?.(property.id);
      } else {
          onReactivate?.(property.id);
      }
  };

  const imageUrls = property.imageUrls ? property.imageUrls.split(',') : [];
  const isAvailable = property.status === 'AVAILABLE';

  return (
    <div 
      className={`bg-surface rounded-xl shadow-lg border border-crust overflow-hidden group transition-all duration-300 ${onSelectProperty ? 'cursor-pointer hover:-translate-y-1' : ''} ${!isAvailable && 'opacity-60'}`}
      onClick={() => onSelectProperty?.(property)}
    >
      <div className="relative">
        <img 
          src={imageUrls[0] || 'https://placehold.co/800x600?text=Imovel'} 
          alt={property.title} 
          className="w-full h-48 object-cover" 
        />
        
        {/* Badge de Status */}
        <div className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-bold text-white rounded-full ${isAvailable ? 'bg-success' : 'bg-subtext'}`}>
          {isAvailable ? 'Disponível' : 'Indisponível'}
        </div>

        {/* Botão de Favorito (apenas para Clientes) */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm p-2 rounded-full text-text hover:bg-white transition-colors duration-200"
            aria-label="Toggle Favorite"
          >
            {isFavorite ? (
              <HeartIconSolid className="w-6 h-6 text-danger" />
            ) : (
              <HeartIconOutline className="w-6 h-6" />
            )}
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-text truncate group-hover:text-blue transition-colors">{property.title}</h3>
        <p className="text-sm text-subtext truncate mt-1">{property.address}</p>
        <p className="text-2xl font-extrabold text-blue my-3">
          {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(property.price)}
          <span className="text-base font-normal text-subtext">/mês</span>
        </p>
        <div className="flex justify-between items-center text-sm text-subtext pt-3 border-t border-crust">
          <div className="flex items-center gap-1"><BedIcon className="w-5 h-5"/><span>{property.bedrooms}</span></div>
          <div className="flex items-center gap-1"><BathIcon className="w-5 h-5"/><span>{property.bathrooms}</span></div>
          <div className="flex items-center gap-1"><AreaIcon className="w-5 h-5"/><span>{property.area} m²</span></div>
        </div>
      </div>
      
      {/* Botões de Ação para o Proprietário */}
      {isOwnerView && (
        <div className="p-3 bg-background border-t border-crust flex gap-2">
          {isAvailable ? (
            <Button onClick={(e) => handleActionClick(e, 'deactivate')} variant="secondary" className="w-full text-sm">Desativar</Button>
          ) : (
            // ========================================================================
            // CORREÇÃO: Mudar o texto do botão para ser mais genérico
            // A função onReactivate é a mesma, apenas o texto muda.
            // ========================================================================
            <Button onClick={(e) => handleActionClick(e, 'reactivate')} variant="primary" className="w-full text-sm">
                Ativar (-5 ASC)
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyCard;