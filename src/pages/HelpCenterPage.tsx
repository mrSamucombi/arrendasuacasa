import React from 'react';
import { HelpIcon } from '../components/icons/Icons';

const HelpCenterPage: React.FC = () => {
  const faqs = [
    {
      question: "Como posso comprar moedas ASC?",
      answer: "Pode comprar moedas ASC na 'Loja de Moedas', acessível através do painel do proprietário. Selecione o pacote desejado, realize o pagamento e submeta o comprovativo. A nossa equipa irá aprovar a sua compra rapidamente."
    },
    {
      question: "Como funciona a verificação de identidade?",
      answer: "No seu perfil, submeta uma foto do seu documento de identidade e uma selfie a segurar o mesmo. A nossa equipa irá analisar e aprovar, atribuindo-lhe um selo de 'Verificado' para aumentar a confiança na plataforma."
    },
    // ... adicione mais FAQs se desejar
  ];

  return (
    <div className="bg-surface p-6 md:p-8 rounded-xl shadow-lg max-w-4xl mx-auto border border-crust">
      <div className="flex items-center mb-6 border-b border-crust pb-4">
        <HelpIcon className="w-8 h-8 text-primary mr-3" />
        <h1 className="text-3xl font-bold text-text">Centro de Ajuda</h1>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-text mb-4">Perguntas Frequentes (FAQ)</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-background p-4 rounded-lg border border-crust">
                <p className="font-semibold text-primary">{faq.question}</p>
                <p className="mt-2 text-subtext">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-crust pt-6">
          <h2 className="text-xl font-semibold text-text mb-4">Ainda precisa de ajuda?</h2>
          <p className="text-subtext">Se não encontrou a resposta para a sua questão, por favor contacte a nossa equipa de suporte.</p>
          <p className="mt-2">
            <a href="mailto:suporte@arrendasuacasa.com" className="font-semibold text-primary hover:underline">
              suporte@arrendasuacasa.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;