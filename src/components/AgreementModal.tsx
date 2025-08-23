import React, { useState } from 'react';
import Button from './Button';

interface AgreementModalProps {
  onAgree: () => void;
}

const AgreementModal: React.FC<AgreementModalProps> = ({ onAgree }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-xl p-6 md:p-8 max-w-2xl w-full border border-crust text-text">
        <h2 id="agreement-title" className="text-2xl font-bold text-text mb-4">Bem-vindo ao ArrendaSuaCasa!</h2>
        <p id="agreement-desc" className="text-subtext mb-6">
          Para continuar, por favor, leia e concorde com os nossos Termos de Uso e a nossa Política de Privacidade.
        </p>
        
        <div className="bg-background p-4 rounded-lg mb-6 border border-crust">
          <label htmlFor="agreement-checkbox" className="flex items-start cursor-pointer">
            <input
              id="agreement-checkbox"
              type="checkbox"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
              className="mt-1 h-5 w-5 rounded border-crust bg-surface text-blue focus:ring-blue"
            />
            <span className="ml-3 text-sm text-subtext">
              Li e concordo com os{' '}
              <a href="#/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue hover:underline">
                Termos de Uso
              </a>{' '}
              e com a{' '}
              <a href="#/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue hover:underline">
                Política de Privacidade
              </a>.
            </span>
          </label>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onAgree} disabled={!isChecked}>
            Concordo e Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgreementModal;