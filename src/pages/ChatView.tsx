// ChatView.tsx (Versão Completa e Corrigida)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as apiService from '../services/apiService';
import { type AuthenticatedUser } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { PaperAirplaneIcon } from '../components/icons/Icons';

interface ChatViewProps {
  currentUser: AuthenticatedUser;
  initialPropertyId?: string | null; 
}

const ChatView: React.FC<ChatViewProps> = ({ currentUser, initialPropertyId }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const handleSelectConversation = useCallback(async (propertyId: string) => {
    try {
        const fullConvo = await apiService.getConversationByProperty(propertyId);
        setActiveConversation(fullConvo);
        setMessages(fullConvo.messages || []);

        if (fullConvo.id) {
            await apiService.markConversationAsRead(fullConvo.id);
        }
        
    } catch(err) {
        console.error("Falha ao selecionar conversa", err);
    }
  }, []);

  const fetchAndSetConversations = useCallback(() => {
    setIsLoading(true);
    apiService.getMyConversations()
      .then(data => {
        setConversations(data || []);
        if (initialPropertyId) {
            handleSelectConversation(initialPropertyId);
        }
      })
      .catch(err => console.error("Falha ao buscar conversas", err))
      .finally(() => setIsLoading(false));
  }, [initialPropertyId, handleSelectConversation]);

  useEffect(() => {
    fetchAndSetConversations();
  }, [fetchAndSetConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activeConversation || !activeConversation.propertyId) return;
    
    const intervalId = setInterval(() => {
        apiService.getConversationByProperty(activeConversation.propertyId)
            .then(updatedConversation => {
                if (updatedConversation && updatedConversation.messages) {
                    if (JSON.stringify(updatedConversation.messages) !== JSON.stringify(messages)) {
                         setMessages(updatedConversation.messages);
                    }
                }
            });
    }, 5000); // Polling a cada 5 segundos
    
    return () => clearInterval(intervalId);
  }, [activeConversation, messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    // UI Otimista: Adiciona a mensagem à UI imediatamente
    const tempMessage = {
        id: 'temp-' + Date.now(),
        text: newMessage,
        createdAt: new Date().toISOString(),
        senderId: currentUser.id, // <-- CORRIGIDO
        sender: { id: currentUser.id, name: 'Eu' } 
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
        const sentMessage = await apiService.sendMessage(activeConversation.id, tempMessage.text);
        // Substitui a mensagem temporária pela mensagem real do servidor
        setMessages(prev => prev.map(m => m.id === tempMessage.id ? sentMessage : m));
    } catch(err) {
        console.error("Falha ao enviar mensagem", err);
        // Reverte a UI otimista em caso de erro
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8 h-full"><LoadingSpinner /></div>;
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-surface rounded-xl shadow-lg border border-crust">
      {/* Painel de Conversas (Esquerda) */}
      <aside className="w-1/3 border-r border-crust overflow-y-auto">
        <div className="p-4 border-b border-crust">
            <h2 className="text-xl font-bold text-text">Mensagens</h2>
        </div>
        <nav>
            {conversations.map(convo => {
              // Lógica para encontrar o nome do outro participante para a pré-visualização
              const otherParticipant = convo.participants?.find((p: any) => p.id !== currentUser.id);
              return (
                <button key={convo.id} onClick={() => handleSelectConversation(convo.propertyId)}
                    className={`w-full text-left p-4 border-b border-crust hover:bg-background ${activeConversation?.id === convo.id ? 'bg-background' : ''}`}>
                    <p className="font-bold text-text truncate">{convo.property?.title || 'Imóvel Indisponível'}</p>
                    <p className="text-sm text-subtext truncate">{otherParticipant?.name || 'Utilizador'}: {convo.messages[0]?.text || 'Inicie a conversa...'}</p>
                </button>
              );
            })}
        </nav>
      </aside>

      {/* Janela de Chat (Direita) */}
      <main className="w-2/3 flex flex-col">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-crust flex-shrink-0">
                {/* Lógica segura para encontrar o nome do outro participante */}
                <p className="font-bold text-text">
                  {activeConversation.participants?.find((p: any) => p.id !== currentUser.id)?.name || 'Outro Utilizador'}
                </p>
                <p className="text-sm text-blue">{activeConversation.property?.title || 'Imóvel Indisponível'}</p>
            </div>

            <div className="flex-grow p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3 rounded-lg ${msg.senderId === currentUser.id ? 'bg-blue text-white' : 'bg-background'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 border-t border-crust flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                           placeholder="Escreva uma mensagem..." className="w-full rounded-lg border-crust bg-background focus:ring-blue" />
                    <Button type="submit" variant="primary" className="p-2 h-auto" disabled={!newMessage.trim()}><PaperAirplaneIcon className="w-6 h-6"/></Button>
                </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-center p-8">
            <h3 className="text-2xl font-bold text-text">Selecione uma conversa</h3>
            <p className="text-subtext mt-2">Escolha uma conversa na lista à esquerda para ver as mensagens.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatView;