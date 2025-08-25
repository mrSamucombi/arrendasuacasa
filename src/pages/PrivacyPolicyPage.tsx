// src/pages/PrivacyPolicyPage.tsx

import React from 'react';
import { ArrowLeftIcon, ShieldCheckIcon } from '../components/icons/Icons';

interface PrivacyPolicyPageProps {
  onGoBack: () => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onGoBack }) => {
  return (
    <div className="bg-surface p-6 md:p-8 rounded-xl shadow-lg max-w-4xl mx-auto border border-crust text-text animate-fade-in">
      <button onClick={onGoBack} className="inline-flex items-center text-blue hover:underline mb-8 font-semibold">
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Voltar à Página Principal
      </button>

      <div className="flex items-center mb-6 border-b border-crust pb-4">
        <ShieldCheckIcon className="w-8 h-8 text-primary mr-4" />
        <h1 className="text-3xl font-bold">Política de Privacidade</h1>
      </div>
      <p className="text-subtext mb-8">Última atualização: 23 de Agosto de 2025</p>

      <p className="mb-6">
        A sua privacidade é de extrema importância para o <strong>ArrendaSuaCasa</strong>. Esta política detalha como recolhemos, usamos, partilhamos e protegemos as suas informações pessoais, em conformidade com as boas práticas e a legislação de proteção de dados aplicável em Angola, nomeadamente a Lei n.º 22/11, de 17 de Junho (Lei da Proteção de Dados Pessoais).
      </p>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-primary border-l-4 border-primary pl-4">1. Informações que Recolhemos</h3>
        <p>Recolhemos diferentes tipos de informação para fornecer e melhorar o nosso serviço:</p>
        <ul className="list-disc list-inside space-y-3 pl-4">
          <li><strong>Informações Fornecidas pelo Utilizador:</strong> Nome, endereço de email, número de telefone e senha (encriptada) durante o registo.</li>
          <li><strong>Informações de Verificação (Proprietários):</strong> Cópias de documentos de identificação (Bilhete de Identidade, Passaporte) e uma fotografia tipo "selfie" para o processo de verificação de identidade. Estes dados são tratados como altamente confidenciais.</li>
          <li><strong>Conteúdo Gerado pelo Utilizador:</strong> Detalhes e fotografias dos imóveis que anuncia, mensagens trocadas na plataforma e comprovativos de pagamento submetidos.</li>
          <li><strong>Dados de Utilização:</strong> Informações sobre como acede e utiliza a plataforma, como pesquisas realizadas, imóveis visualizados e interações com outros utilizadores.</li>
        </ul>

        <h3 className="text-xl font-semibold text-primary border-l-4 border-primary pl-4">2. Finalidade da Recolha e Tratamento de Dados</h3>
        <p>Os seus dados são utilizados estritamente para os seguintes fins:</p>
        <ul className="list-disc list-inside space-y-3 pl-4">
          <li><strong>Operação da Plataforma:</strong> Para criar e gerir a sua conta, publicar os seus anúncios e facilitar a comunicação entre utilizadores.</li>
          <li><strong>Segurança e Confiança:</strong> Os documentos de verificação são usados exclusivamente para confirmar a identidade dos Proprietários e atribuir o selo de "Verificado", com o objetivo de prevenir fraudes e aumentar a segurança de todos.</li>
          <li><strong>Processamento de Transações:</strong> Para gerir a compra de "Moedas ASC" e validar os comprovativos de pagamento.</li>
          <li><strong>Comunicação:</strong> Para enviar notificações importantes sobre a sua conta, anúncios ou mensagens.</li>
          - <strong>Melhoria do Serviço:</strong> Para analisar dados de utilização de forma anónima, a fim de entender como a nossa plataforma é usada e como podemos melhorá-la.</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-primary border-l-4 border-primary pl-4">3. Partilha e Divulgação de Informação</h3>
        <p>A confidencialidade dos seus dados é um pilar do nosso serviço. Não vendemos, alugamos ou partilhamos as suas informações pessoais com terceiros para fins de marketing.</p>
        <p className="mt-2">A partilha de informação limita-se aos seguintes casos:</p>
        <ul className="list-disc list-inside space-y-3 pl-4">
          <li><strong>Com o seu Consentimento:</strong> A comunicação entre Cliente e Proprietário é iniciada por si. Detalhes de contacto só são trocados no contexto dessa comunicação.</li>
          <li><strong>Prestadores de Serviços:</strong> Partilhamos informações com empresas terceiras que nos auxiliam a operar (ex: Cloudinary para armazenamento de imagens, Supabase para alojamento da base de dados). Estes parceiros estão contratualmente obrigados a proteger os seus dados.</li>
          <li><strong>Obrigações Legais:</strong> Poderemos divulgar as suas informações se formos obrigados por lei ou por uma ordem judicial válida emitida por autoridades angolanas.</li>
        </ul>

        <h3 className="text-xl font-semibold text-primary border-l-4 border-primary pl-4">4. Segurança e Armazenamento dos Dados</h3>
        <p>Implementamos medidas de segurança técnicas e organizacionais para proteger os seus dados contra acesso não autorizado, alteração ou destruição. Os seus dados são armazenados em servidores seguros, e o acesso a informações sensíveis (como documentos de verificação) é estritamente restrito.</p>

        <h3 className="text-xl font-semibold text-primary border-l-4 border-primary pl-4">5. Os Seus Direitos</h3>
        <p>De acordo com a lei, tem o direito de aceder, retificar ou solicitar o apagamento das suas informações pessoais. Pode exercer a maioria destes direitos através das configurações do seu perfil na plataforma. Para pedidos mais específicos, por favor contacte o nosso suporte através do email: [seu-email-de-suporte@arrendasuacasa.com].</p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;