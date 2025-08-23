import React from 'react';
import { type Client, type Property } from '../types';
import PropertyCard from '../components/PropertyCard';
import Button from '../components/Button';
import { HeartIconSolid } from '../components/icons/Icons';

interface ClientProfilePageProps {
  client: Client;
  onToggleFavorite: (propertyId: string) => void;
}

const ClientProfilePage: React.FC<ClientProfilePageProps> = ({ client, onToggleFavorite }) => {
  // Garantir que favoriteProperties é sempre um array
  const favoriteProperties = client?.favoriteProperties || [];

  return (
    <div className="bg-surface p-6 md:p-8 rounded-xl shadow-lg max-w-6xl mx-auto border border-crust">
      <div className="flex flex-col sm:flex-row items-center mb-8 border-b border-crust pb-6">
        <img
          src={client.profilePictureUrl || `https://ui-avatars.com/api/?name=${client.name.replace(' ', '+')}&background=1e66f5&color=fff`}
          alt="Foto de Perfil"
          className="w-24 h-24 rounded-full object-cover mb-4 sm:mb-0 sm:mr-6 border-4 border-primary"
        />
        <div>
          <h1 className="text-3xl font-bold text-text">{client.name}</h1>
          <p className="text-subtext">{client.email}</p>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-text mb-6 flex items-center">
            {/* ======================================================================== */}
            {/* CORREÇÃO: Usar o nome do componente importado (HeartIconSolid) */}
            {/* ======================================================================== */}
            <HeartIconSolid className="w-7 h-7 text-danger mr-3" />
            Meus Imóveis Favoritos ({favoriteProperties.length})
          </h2>

          {favoriteProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-background rounded-lg border-dashed border-2 border-crust">
              <p className="text-lg text-subtext">Ainda não adicionou nenhum imóvel aos seus favoritos.</p>
              <p className="text-sm text-subtext/70 mt-2">Clique no coração nos anúncios para os guardar aqui.</p>
              <Button className="mt-6" onClick={() => window.location.href = '#/'}>
                Ver Imóveis
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ClientProfilePage;