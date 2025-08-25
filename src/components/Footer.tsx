// src/components/Footer.tsx

import React from 'react';

// O tipo das props que o Footer vai receber
interface FooterProps {
  // Uma função para dizer ao App.tsx qual vista mostrar
  setActiveView: (view: 'terms' | 'privacy' | 'main') => void;
}

const Footer: React.FC<FooterProps> = ({ setActiveView }) => {
  // Handler para evitar que o link recarregue a página
  const handleLinkClick = (event: React.MouseEvent, view: 'terms' | 'privacy') => {
    event.preventDefault(); // Impede o comportamento padrão do link <a>
    setActiveView(view);
  };
  
  return (
    <footer className="bg-surface text-subtext text-center p-4 mt-auto border-t border-crust">
      <div className="container mx-auto">
        <p className="mb-2">
          © {new Date().getFullYear()} ArrendaSuaCasa. Todos os direitos reservados.
        </p>
        <div className="flex justify-center items-center space-x-4 text-sm">
          {/* Usamos onClick para controlar a navegação interna */}
          <a 
            href="/terms" 
            onClick={(e) => handleLinkClick(e, 'terms')} 
            className="hover:text-primary hover:underline"
          >
            Termos de Serviço
          </a>
          <span className="text-crust">|</span>
          <a 
            href="/privacy" 
            onClick={(e) => handleLinkClick(e, 'privacy')} 
            className="hover:text-primary hover:underline"
          >
            Política de Privacidade
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;