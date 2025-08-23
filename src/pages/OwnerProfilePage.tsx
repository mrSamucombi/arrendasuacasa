// DENTRO DE src/pages/OwnerProfilePage.tsx

import React, { useState } from 'react';
import { Owner, VerificationStatus } from '../types';
import Button from '../components/Button';

interface OwnerProfilePageProps {
  owner: Owner;
  onInitiateVerification: (data: { documentFile: File; selfieFile: File; email: string; phone: string; }) => void;
}

const OwnerProfilePage: React.FC<OwnerProfilePageProps> = ({ owner, onInitiateVerification }) => {
  // Lógica de estado para o formulário
  const [phone, setPhone] = useState(owner.phoneNumber || '');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentFile || !selfieFile) {
      alert('Por favor, carregue o seu documento e a selfie.');
      return;
    }
    // O email é enviado a partir do objeto 'owner' para garantir que é o correto
    onInitiateVerification({ email: owner.email, phone, documentFile, selfieFile });
  };

  const isSubmissionAllowed = owner.verificationStatus === VerificationStatus.NotVerified;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-surface p-8 rounded-xl shadow-lg border border-crust">
        <h2 className="text-3xl font-bold text-text mb-2">Perfil & Verificação de Identidade</h2>
        <p className="text-subtext mb-6">Verifique a sua identidade para aumentar a confiança dos clientes.</p>

        {owner.verificationStatus === VerificationStatus.Verified && (
          <div className="bg-green/10 border border-green text-green p-4 mb-6 rounded-lg">
            <p className="font-bold">A sua conta está verificada!</p>
          </div>
        )}
        {owner.verificationStatus === VerificationStatus.Pending && (
          <div className="bg-yellow/10 border border-yellow text-yellow p-4 mb-6 rounded-lg">
            <p className="font-bold">A sua submissão está a ser revista.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={!isSubmissionAllowed} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text">Nome Completo</label>
              <input type="text" name="name" id="name" value={owner.name} disabled className="mt-1 block w-full rounded-lg border-crust bg-background cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text">Endereço de Email</label>
              <input type="email" name="email" id="email" value={owner.email} disabled className="mt-1 block w-full rounded-lg border-crust bg-background cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text">Número de Telefone</label>
              <input type="tel" name="phone" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full rounded-lg border-crust" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-crust">
              <div>
                <label htmlFor="documentFile" className="block text-sm font-medium text-text">Documento de Identificação (BI)</label>
                <input type="file" name="documentFile" id="documentFile" onChange={(e) => setDocumentFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-subtext file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue/10 file:text-blue hover:file:bg-blue/20" required />
              </div>
              <div>
                <label htmlFor="selfieFile" className="block text-sm font-medium text-text">Selfie a Segurar o Documento</label>
                <input type="file" name="selfieFile" id="selfieFile" onChange={(e) => setSelfieFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-subtext file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue/10 file:text-blue hover:file:bg-blue/20" required />
              </div>
            </div>
          </fieldset>
          
          {isSubmissionAllowed && (
            <div className="text-right pt-6 border-t border-crust">
              <Button type="submit" variant="primary" disabled={!documentFile || !selfieFile}>
                Submeter para Verificação
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OwnerProfilePage;