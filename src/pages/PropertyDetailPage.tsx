import React from 'react';
import { AuthenticatedUser, type Property } from '../types';
import { BedIcon, BathIcon, AreaIcon } from '../components/icons/Icons';
import Button from '../components/Button';

// 1. Importar o Carrossel e os seus estilos
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

interface PropertyDetailPageProps {
  currentUser: AuthenticatedUser | null;
  property: Property;
  onGoBack: () => void;
  onInitiateChat: (propertyId: string) => void;
}

const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({ property, onGoBack, onInitiateChat, currentUser }) => {
  const imageUrls = property.imageUrls ? property.imageUrls.split(',') : [];
  const isOwner = currentUser?.user?.id === property.ownerId;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button onClick={onGoBack} variant="secondary">
          &larr; Voltar à Lista
        </Button>
      </div>

      <div className="bg-surface rounded-xl shadow-lg border border-crust overflow-hidden">
        {/* ======================================================================== */}
        {/* GALERIA DE IMAGENS SUBSTITUÍDA PELO CARROSSEL */}
        {/* ======================================================================== */}
        {imageUrls.length > 0 ? (
          <Carousel
            showThumbs={true}
            thumbWidth={100}
            infiniteLoop={true}
            autoPlay={false}
            showStatus={false}
            className="property-carousel" // Adicionar estilos customizados para as miniaturas no seu index.css
          >
            {imageUrls.map((url, index) => (
              <div key={index} className="h-[500px]">
                <img src={url} alt={`${property.title} ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="h-[500px] bg-background flex items-center justify-center">
            <p className="text-subtext">Nenhuma imagem disponível.</p>
          </div>
        )}

        {/* Informações (O SEU CÓDIGO ORIGINAL, SEM ALTERAÇÕES) */}
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text">{property.title}</h1>
              <p className="text-subtext mt-1">{property.address}</p>
            </div>
            <div className="mt-4 md:mt-0 text-left md:text-right">
              <p className="text-3xl font-extrabold text-blue">
                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(property.price)}
                <span className="text-xl font-normal text-subtext">/mês</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-subtext mt-6 border-t border-b border-crust py-4">
            <div className="flex items-center gap-2"><BedIcon className="w-6 h-6"/><span>{property.bedrooms} Quartos</span></div>
            <div className="flex items-center gap-2"><BathIcon className="w-6 h-6"/><span>{property.bathrooms} WC</span></div>
            <div className="flex items-center gap-2"><AreaIcon className="w-6 h-6"/><span>{property.area} m²</span></div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-text mb-2">Sobre este imóvel</h2>
            <p className="text-subtext whitespace-pre-wrap">{property.description}</p>
          </div>

          <div className="mt-8 pt-6 border-t border-crust">
            <h2 className="text-xl font-semibold text-text mb-4">Interessado?</h2>
            <p className="text-subtext mb-2">Proprietário: {property.owner?.user?.name || 'Informação não disponível'}</p>
            {!isOwner && currentUser?.role === 'CLIENT' && (
              <Button onClick={() => onInitiateChat(property.id)} variant="primary">
                Enviar Mensagem ao Proprietário
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;