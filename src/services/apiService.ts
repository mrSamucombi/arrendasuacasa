import { auth } from '../firebase';
import type { AuthenticatedUser, CoinPackage, Property, Purchase, UserRole, Owner } from '../types';

const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_BASE_URL 
  : '/api';

// Adicionado o tipo para a resposta paginada que vem do backend
interface PaginatedPropertiesResponse {
  data: Property[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

interface PropertyFilters {
  searchTerm?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
}



// --- Helper genérico para fazer chamadas JSON autenticadas ---
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Utilizador não autenticado.');
  }
  const token = await user.getIdToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  return fetch(url, { ...options, headers });
}

// --- Helper para tratar respostas fetch ---
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: `API call failed with status ${response.status}`,
    }));
    throw new Error(errorData.error || 'Ocorreu um erro desconhecido');
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

// --- Função Helper para Upload de Ficheiros ---
export async function uploadFile(file: File, path?: string): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Utilizador não autenticado para fazer upload.');

  // Usar o caminho fornecido ou um caminho padrão
  const finalPath = path || `uploads/${user.uid}/general`;

  const formData = new FormData();
  formData.append('file', file);
  
  const token = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  const result = await handleResponse(response);
  if (!result || !result.url) {
      throw new Error("O servidor de upload não retornou um URL válido.");
  }
  return result.url;
}

export async function deactivateProperty(propertyId: string): Promise<Property> {
  const response = await fetchWithAuth(`${API_BASE_URL}/properties/${propertyId}/deactivate`, { method: 'PATCH' });
  return handleResponse(response);
}

export async function reactivateProperty(propertyId: string): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/properties/${propertyId}/reactivate`, { method: 'PATCH' });
  return handleResponse(response); // A resposta agora contém 'updatedProperty' e 'updatedOwner'
}

// --- Autenticação ---
export async function registerUser(data: { id: string; name: string; email: string; role: UserRole; phoneNumber?: string; }) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function getMyProfile(): Promise<AuthenticatedUser> { // O tipo AuthenticatedUser deve ser o objeto do utilizador
  const response = await fetchWithAuth(`${API_BASE_URL}/auth/me`);
  const data = await handleResponse(response); // handleResponse retorna { user: {...}, role: '...' }

  // Retornamos o objeto aninhado que contém os detalhes
  return data.user; 
}

// --- Rotas Públicas ---
export async function getProperties(page: number = 1, filters: PropertyFilters = {}): Promise<PaginatedPropertiesResponse> {
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: '12',
  });

  if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);
  if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
  if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
  if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms);

  const finalUrl = `${API_BASE_URL}/properties?${queryParams.toString()}`;

  // LOG DE DEPURAÇÃO
  console.log("A buscar imóveis com o URL:", finalUrl);

  const response = await fetch(finalUrl);
  return handleResponse(response);
}

export async function getCoinPackages(): Promise<CoinPackage[]> {
  const response = await fetch(`${API_BASE_URL}/packages`);
  return handleResponse(response);
}

// --- Rotas de Cliente / Proprietário (Autenticadas) ---
export async function getClientPurchases(): Promise<Purchase[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/purchases`);
  return handleResponse(response);
}

export async function initiatePurchase(pkgId: string, proofOfPaymentFile: File): Promise<Purchase> {
  const proofOfPaymentUrl = await uploadFile(proofOfPaymentFile);
  const response = await fetchWithAuth(`${API_BASE_URL}/purchases`, {
    method: 'POST',
    body: JSON.stringify({ pkgId, proofOfPayment: proofOfPaymentUrl }),
  });
  return handleResponse(response);
}

export async function initiateVerification(ownerId: string, data: { email: string; phone: string; documentFile: File; selfieFile: File; }): Promise<Owner> {
  const [documentUrl, selfieUrl] = await Promise.all([
      uploadFile(data.documentFile),
      uploadFile(data.selfieFile)
  ]);
  const response = await fetchWithAuth(`${API_BASE_URL}/owners/initiate-verification`, {
      method: 'PUT',
      body: JSON.stringify({ 
          phone: data.phone,
          documentUrl,
          selfieUrl,
      }),
  });
  return handleResponse(response);
}

export async function toggleFavorite(propertyId: string): Promise<Client> { // Tipo de retorno atualizado
    const response = await fetchWithAuth(`${API_BASE_URL}/clients/toggle-favorite/${propertyId}`, {
        method: 'POST',
    });
    return handleResponse(response);
}

export async function addProperty(propertyData: Omit<Property, 'id' | 'ownerId' | 'imageUrls' | 'favoritedBy' | 'createdAt' | 'updatedAt'>, images: File[]): Promise<Property> {
  if (images.length === 0) throw new Error("Pelo menos uma imagem é necessária.");
  if (!auth.currentUser) throw new Error("Ação requer autenticação.");
  const uploadPromises = images.map(image => uploadFile(image));
  const imageUrlsArray = await Promise.all(uploadPromises);
  const imageUrlsString = imageUrlsArray.join(',');
  const dataToSend = { ...propertyData, imageUrls: imageUrlsString };
  const response = await fetchWithAuth(`${API_BASE_URL}/properties`, {
    method: 'POST',
    body: JSON.stringify(dataToSend),
  });
  return handleResponse(response);
}

interface ProfileUpdateData {
  name?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
}

export async function updateMyProfile(data: ProfileUpdateData): Promise<AuthenticatedUser> {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/me`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function getOwnerDashboardData() {
  // Usamos Promise.all para fazer as chamadas em paralelo, o que é mais rápido.
  const [profile, properties, purchases] = await Promise.all([
    getMyProfile(), // Você já tem esta função
    // Crie uma função getMyProperties se não tiver
    // Ou adapte a getProperties para buscar apenas os do usuário logado
    getProperties(), // Adapte se necessário
    getClientPurchases() // Você já tem esta função
  ]);

  return { profile, properties, purchases };
}

// --- Rotas de Administrador ---
export async function getUsersToVerify(): Promise<Owner[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/verifications`);
  return handleResponse(response);
}

export async function confirmVerification(ownerId: string): Promise<Owner> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/verifications/${ownerId}/confirm`, { method: 'PUT' });
  return handleResponse(response);
}

export async function getAdminPendingPurchases(): Promise<Purchase[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/purchases`);
  return handleResponse(response);
}

export async function getAdminStats(): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/stats`);
  return handleResponse(response);
}

export async function confirmPurchase(purchaseId: string): Promise<Purchase> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/purchases/${purchaseId}/confirm`, { method: 'PUT' });
  return handleResponse(response);
}

export async function getMyConversations(): Promise<any[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/messages`);
  return handleResponse(response);
}

// Obter ou criar uma conversa sobre um imóvel específico
export async function getConversationByProperty(propertyId: string): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/messages/property/${propertyId}`);
  return handleResponse(response);
}

// Enviar uma nova mensagem para uma conversa
export async function sendMessage(conversationId: string, text: string): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/messages/${conversationId}`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return handleResponse(response);
}

export async function markConversationAsRead(conversationId: string): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/messages/${conversationId}/read`, {
    method: 'PUT',
  });
  return handleResponse(response);
}