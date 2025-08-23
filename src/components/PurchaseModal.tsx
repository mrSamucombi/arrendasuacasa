import React, { useState, useEffect } from 'react';
import { type CoinPackage } from '../types';
import Button from './Button';
import { CoinsIcon } from './icons/Icons';
import { toast } from 'react-hot-toast';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinPackage: CoinPackage | null;
  onConfirm: (proofOfPaymentFile: File) => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, coinPackage, onConfirm }) => {
  if (!isOpen || !coinPackage) return null;

  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Limpa o ficheiro quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
        setProofFile(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setProofFile(file || null);
  };

  const handleConfirm = () => {
    if (!proofFile) {
        toast.error('Por favor, anexe o comprovativo de pagamento.');
        return;
    }
    onConfirm(proofFile);
  };

  const paymentDetails = {
    transferencia: (
        <div className="text-sm bg-background p-3 rounded-lg border border-crust">
            <p><strong>IBAN:</strong> AO06.0000.1234.5678.9101.1121.3</p>
            <p><strong>Beneficiário:</strong> ArrendaSuaCasa, Lda.</p>
        </div>
    ),
    multicaixa: (
        <div className="text-sm bg-background p-3 rounded-lg border border-crust">
            <p><strong>Entidade:</strong> 12345</p>
            <p><strong>Referência:</strong> 987 654 321</p>
        </div>
    )
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface rounded-lg shadow-xl p-6 md:p-8 m-4 max-w-2xl w-full border border-crust text-text" onClick={e => e.stopPropagation()}>
        <div className="text-center">
            <CoinsIcon className="w-12 h-12 text-yellow-500 mx-auto mb-3"/>
            <h2 className="text-2xl font-bold text-text mb-1">Finalizar Compra</h2>
            <p className="text-subtext mb-6">Pacote: <strong className="text-blue">{coinPackage.description}</strong></p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
            {/* Coluna da Esquerda: Detalhes do Pagamento */}
            <div className="md:w-1/2 space-y-4">
                 <div className="bg-background rounded-lg p-4 text-center border border-crust">
                    <p className="text-lg font-semibold text-text">{coinPackage.coins} ASC</p>
                    <p className="text-3xl font-extrabold text-blue">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(coinPackage.price)}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-text mb-2">1. Escolha como pagar</h3>
                    <div className="space-y-2">
                        <label className="flex items-center p-3 border border-crust rounded-lg cursor-pointer hover:border-blue has-[:checked]:border-blue has-[:checked]:bg-background">
                            <input type="radio" name="paymentMethod" value="transferencia" checked={paymentMethod === 'transferencia'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-blue focus:ring-blue"/>
                            <span className="ml-3 font-medium text-text">Transferência Bancária</span>
                        </label>
                        <label className="flex items-center p-3 border border-crust rounded-lg cursor-pointer hover:border-blue has-[:checked]:border-blue has-[:checked]:bg-background">
                            <input type="radio" name="paymentMethod" value="multicaixa" checked={paymentMethod === 'multicaixa'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-blue focus:ring-blue"/>
                            <span className="ml-3 font-medium text-text">Multicaixa Express</span>
                        </label>
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-lg text-text mb-2">2. Efetue o pagamento</h3>
                    {paymentDetails[paymentMethod as keyof typeof paymentDetails]}
                 </div>
            </div>

            {/* Coluna da Direita: Upload do Comprovativo */}
            <div className="md:w-1/2 space-y-4 flex flex-col">
                <h3 className="font-semibold text-lg text-text">3. Envie o comprovativo</h3>
                <div className="border-2 border-dashed border-crust rounded-lg p-6 text-center flex-grow flex flex-col justify-center">
                    <input type="file" id="proof-upload" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                    <label htmlFor="proof-upload" className="cursor-pointer text-blue hover:underline font-semibold">
                        Clique para selecionar o ficheiro
                    </label>
                    <p className="text-xs text-subtext mt-1">PNG, JPG, PDF (max. 5MB)</p>
                    
                    {/* ======================================================================== */}
                    {/* LÓGICA DE PRÉ-VISUALIZAÇÃO REMOVIDA. MOSTRAR APENAS O NOME DO FICHEIRO. */}
                    {/* ======================================================================== */}
                    {proofFile && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-text mb-2">Ficheiro selecionado:</p>
                            <p className="text-sm bg-background p-2 rounded truncate">{proofFile.name}</p>
                        </div>
                    )}
                </div>
                 <p className="text-xs text-center text-subtext">A sua compra ficará pendente até à confirmação.</p>
            </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-crust">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!proofFile}>Submeter para Confirmação</Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;