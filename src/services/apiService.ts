import { auth } from '../firebase';
import type { AuthenticatedUser, CoinPackage, Property, Purchase, UserRole, Owner, Client } from '../types';

// A forma mais robusta de definir o URL base.
// Em produção (no Render), ele vai usar a variável de ambiente VITE_API_BASE_URL.
// Em desenvolvimento (localmente), ele vai usar o endereço do seu servidor local.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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

  console.log(`[API Service] A fazer pedido: ${options.method || 'GET'} ${url}`);
  return fetch(url, { ...options, headers });
}

// --- Helper para tratar respostas fetch ---
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: `API call failed with status ${response.status}`,
    }));
    console.error(`[API Service] Erro na resposta da API para ${response.url}:`, errorData);
    throw new Error(errorData.error || `Ocorreu um erro desconhecido (status: ${response.status})`);
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
  return handleResponse(response);
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

export async function getMyProfile(): Promise<AuthenticatedUser> {
  const response = await fetchWithAuth(`${API_BASE_URL}/auth/me`);
  const data = await handleResponse(response);
  // CORREÇÃO: A API agora retorna o objeto do utilizador diretamente.
  return data; 
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
    body: JSON.stringify({ pkgId, proofOfPaymentUrl }),
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

export async function toggleFavorite(propertyId: string): Promise<Client> {
    const response = await fetchWithAuth(`${API_BASE_URL}/clients/toggle-favorite/${propertyId}`, {
        method: 'POST',
    });
    return handleResponse(response);
}

export async function addProperty(propertyData: Omit<Property, 'id' | 'ownerId' | 'imageUrls' | 'favoritedBy' | 'createdAt' | 'updatedAt' | 'status' | 'conversations'>, images: File[]): Promise<{ newProperty: Property, updatedOwner: Owner }> {
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

// --- Rotas de Mensagens ---
export async function getMyConversations(): Promise<any[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/messages`);
  return handleResponse(response);
}

export async function getConversationByProperty(propertyId: string): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/messages/property/${propertyId}`);
  return handleResponse(response);
}

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