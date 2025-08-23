import React from 'react';

const TermsPage: React.FC = () => {
    return (
        <div className="bg-white p-6 md:p-10 rounded-lg shadow-md max-w-4xl mx-auto font-sans">
            <h1 className="text-3xl font-extrabold text-primary mb-6 border-b pb-4">Termos, Contratos de Uso e Política de Privacidade</h1>
            
            <section className="mb-8">
                <h2 className="text-2xl font-bold text-dark mb-4">Termos e Condições de Uso</h2>
                <p className="text-gray-600 mb-4">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                <p className="text-gray-700 mb-4">Bem-vindo ao ArrendaSuaCasa! Ao aceder e utilizar a nossa plataforma, concorda em cumprir e ficar vinculado aos seguintes termos e condições. Por favor, leia-os com atenção.</p>

                <h3 className="text-xl font-semibold text-primary mt-6 mb-2">1. Aceitação dos Termos</h3>
                <p className="text-gray-700">Ao utilizar a plataforma ArrendaSuaCasa, o utilizador (seja "Cliente" ou "Proprietário") confirma que leu, entendeu e concorda em estar sujeito a estes Termos de Uso e à nossa Política de Privacidade.</p>

                <h3 className="text-xl font-semibold text-primary mt-6 mb-2">2. Descrição do Serviço</h3>
                <p className="text-gray-700">O ArrendaSuaCasa é uma plataforma online que conecta proprietários que desejam arrendar os seus imóveis com clientes que procuram imóveis para arrendar em Angola. Não somos uma parte direta em qualquer transação de arrendamento.</p>

                <h3 className="text-xl font-semibold text-primary mt-6 mb-2">3. Contas de Utilizador</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>Proprietário:</strong> Para anunciar um imóvel, deve registar-se como proprietário, fornecer informações precisas e passar pelo nosso processo de verificação de identidade.</li>
                    <li><strong>Cliente:</strong> Para explorar os imóveis, pode navegar como visitante. O contacto com proprietários pode exigir registo.</li>
                    <li>O utilizador é responsável por manter a confidencialidade da sua conta e senha.</li>
                </ul>

                <h3 className="text-xl font-semibold text-primary mt-6 mb-2">4. Moedas ASC (ArrendaSuaCasa Coins)</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Para publicar um anúncio, os proprietários devem utilizar "Moedas ASC", a moeda virtual da plataforma.</li>
                    <li>As moedas podem ser adquiridas na "Loja de Moedas" através dos métodos de pagamento disponíveis.</li>
                    <li>A compra de moedas requer a submissão de um comprovativo e está sujeita a aprovação administrativa. As moedas não são reembolsáveis nem transferíveis.</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-primary mt-6 mb-2">5. Verificação de Identidade</h3>
                <p className="text-gray-700">Para aumentar a segurança, os proprietários devem submeter documentos (BI, Passaporte) e uma selfie para verificação. A aprovação concede um selo de "Verificado", aumentando a confiança na plataforma.</p>

                 <h3 className="text-xl font-semibold text-primary mt-6 mb-2">6. Limitação de Responsabilidade</h3>
                 <p className="text-gray-700">O ArrendaSuaCasa não se responsabiliza pela veracidade dos anúncios, pela condição dos imóveis ou por quaisquer disputas entre clientes e proprietários. Aconselhamos a devida diligência antes de fechar qualquer contrato de arrendamento.</p>
            </section>

             <section className="mb-8 pt-8 border-t">
                <h2 className="text-2xl font-bold text-dark mb-4">Política de Privacidade</h2>
                
                <h3 className="text-xl font-semibold text-primary mt-6 mb-2">1. Informação que Recolhemos</h3>
                <p className="text-gray-700">Recolhemos informações que nos fornece diretamente, como nome, email, telefone, e os documentos para verificação de identidade. Também recolhemos dados de utilização da plataforma.</p>

                <h3 className="text-xl font-semibold text-primary mt-6 mb-2">2. Como Usamos a Sua Informação</h3>
                <p className="text-gray-700">Utilizamos as suas informações para operar e manter a plataforma, processar transações (compras de moedas e verificações), comunicar consigo e melhorar os nossos serviços.</p>

                <h3 className="text-xl font-semibold text-primary mt-6 mb-2">3. Partilha de Informação</h3>
                <p className="text-gray-700">Não partilhamos as suas informações pessoais com terceiros, exceto quando necessário para fornecer o serviço (ex: processamento de pagamentos) ou se exigido por lei. Os detalhes de contacto entre cliente e proprietário podem ser partilhados mediante interesse mútuo na plataforma.</p>

                 <h3 className="text-xl font-semibold text-primary mt-6 mb-2">4. Segurança de Dados</h3>
                <p className="text-gray-700">Implementamos medidas de segurança para proteger as suas informações. No entanto, nenhum sistema é 100% seguro, e não podemos garantir segurança absoluta.</p>

                <h3 className="text-xl font-semibold text-primary mt-6 mb-2">5. Os Seus Direitos</h3>
                <p className="text-gray-700">Tem o direito de aceder, corrigir ou apagar as suas informações pessoais. Pode fazê-lo através das configurações do seu perfil ou contactando o nosso suporte.</p>
            </section>
        </div>
    );
};

export default TermsPage;
