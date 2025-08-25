// src/pages/TermsPage.tsx

import React from 'react';
import { ArrowLeftIcon, ShieldCheckIcon, UserGroupIcon, ExclamationTriangleIcon } from '../components/icons/Icons'; // Supondo que tem estes ícones

interface TermsPageProps {
  onGoBack: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onGoBack }) => {
  return (
    <div className="bg-surface p-6 md:p-8 rounded-xl shadow-lg max-w-4xl mx-auto border border-crust text-text animate-fade-in">
      <button onClick={onGoBack} className="inline-flex items-center text-blue hover:underline mb-8 font-semibold">
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Voltar à Página Principal
      </button>

      <div className="flex items-center mb-6 border-b border-crust pb-4">
        <UserGroupIcon className="w-8 h-8 text-primary mr-4" />
        <h1 className="text-3xl font-bold">Termos e Condições de Uso</h1>
      </div>
      <p className="text-subtext mb-8">Última atualização: 23 de Agosto de 2025</p>
      
      <p className="mb-6">
        Bem-vindo ao <strong>ArrendaSuaCasa</strong>! Ao aceder e utilizar a nossa plataforma, o utilizador concorda em cumprir e ficar vinculado aos seguintes termos e condições. A leitura atenta deste documento é fundamental para uma utilização segura e correta do nosso serviço.
      </p>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-primary border-l-4 border-primary pl-4">1. Descrição e Objeto do Serviço</h3>
        <p>O ArrendaSuaCasa é uma plataforma de marketplace online desenhada para conectar proprietários de imóveis ("Proprietários") com potenciais inquilinos ("Clientes") em Angola. A nossa função é de intermediário tecnológico, facilitando a publicação e a descoberta de imóveis para arrendamento. Não somos parte em qualquer contrato de arrendamento nem atuamos como agente imobiliário.</p>

        <h3 className="text-xl font-semibold text-primary border-l-4 border-primary pl-4">2. Contas de Utilizador e Verificação</h3>
        <ul className="list-disc list-inside space-y-3 pl-4">
          <li><strong>Registo:</strong> Para anunciar um imóvel, é obrigatório o registo como Proprietário. Para contactar um proprietário, pode ser necessário o registo como Cliente. O utilizador garante que todas as informações fornecidas no registo são verdadeiras, precisas e completas.</li>
          <li><strong>Verificação de Identidade:</strong> Para promover um ambiente de confiança, os Proprietários são encorajados a submeter documentos de identificação para obter um selo de "Utilizador Verificado". Este processo é gerido de acordo com a nossa Política de Privacidade.</li>
          <li><strong>Responsabilidade:</strong> O utilizador é o único responsável por manter a confidencialidade da sua senha e por todas as atividades que ocorram na sua conta.</li>
        </ul>

        <h3 className="text-xl font-semibold text-primary border-l-4 border-primary pl-4">3. Conduta e Responsabilidades do Proprietário</h3>
        <ul className="list-disc list-inside space-y-3 pl-4">
          <li><strong>Veracidade da Informação:</strong> O Proprietário tem o dever de publicar apenas informações verdadeiras, precisas e não enganosas sobre os seus imóveis, incluindo preço, localização, características e fotografias. A publicação de conteúdo falso ou fraudulento é estritamente proibida.</li>
          <li><strong>Legitimidade:</strong> Ao anunciar um imóvel, o Proprietário declara e garante que tem a autoridade legal para o fazer, seja como proprietário direto ou como representante legalmente constituído.</li>
          <li><strong>Sistema de Moedas (ASC):</strong> A publicação e reativação de anúncios requer a utilização de "Moedas ASC", a moeda virtual da plataforma, adquirida através dos canais oficiais. As moedas não são reembolsáveis nem transferíveis.</li>
        </ul>

        <div className="bg-red/10 border-l-4 border-danger p-4 rounded-r-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-danger mr-3" />
            <h4 className="text-lg font-semibold text-danger">Suspensão e Desativação de Conta</h4>
          </div>
          <p className="mt-2 text-text">
            O ArrendaSuaCasa reserva-se o direito de suspender ou desativar permanentemente, sem aviso prévio, qualquer conta que viole estes termos. Isto inclui, mas não se limita a: fornecer informações falsas de identidade, anunciar imóveis sobre os quais não tem autoridade, ou receber múltiplas denúncias válidas de outros utilizadores.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-primary border-l-4 border-primary pl-4">4. Denúncias e Moderação</h3>
        <p>Os Clientes são encorajados a denunciar qualquer anúncio ou perfil que pareça suspeito, fraudulento ou que viole os nossos termos. A nossa equipa de administração investigará todas as denúncias e tomará as medidas apropriadas.</p>

        <h3 className="text-xl font-semibold text-primary border-l-4 border-primary pl-4">5. Limitação de Responsabilidade</h3>
        <p>A plataforma é fornecida "como está". O ArrendaSuaCasa não se responsabiliza pela veracidade dos anúncios, condição dos imóveis, legalidade dos contratos de arrendamento ou por quaisquer disputas que possam surgir entre Clientes e Proprietários. Recomendamos sempre a devida diligência e, se possível, a consulta de um profissional legal antes de finalizar qualquer acordo.</p>
      </div>
    </div>
  );
};

export default TermsPage;