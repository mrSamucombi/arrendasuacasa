import React from 'react';
import { type AuthenticatedUser, UserRole } from '../types';
import Button from '../components/Button';
import * as apiService from '../services/apiService';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileFormSchema } from '../schemas/formSchemas';
import { z } from 'zod';

interface ProfileEditPageProps {
  currentUser: AuthenticatedUser;
  onProfileUpdate: (updatedUser: AuthenticatedUser) => void;
  onGoBack: () => void;
}

type ProfileFormData = z.infer<typeof profileFormSchema>;

const FieldError: React.FC<{ message?: string }> = ({ message }) => {
    if (!message) return null;
    return <p className="text-sm text-danger mt-1">{message}</p>;
};

const ProfileEditPage: React.FC<ProfileEditPageProps> = ({ currentUser, onProfileUpdate, onGoBack }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      // <-- CORREÇÃO AQUI
      name: currentUser.name,
      phoneNumber: currentUser.phoneNumber || '',
    },
  });

  const isOwner = currentUser.role === UserRole.Owner;
  const profilePictureFile = watch('profilePicture');
  // <-- CORREÇÃO AQUI
  const preview = profilePictureFile?.[0] 
    ? URL.createObjectURL(profilePictureFile[0]) 
    : currentUser.profilePictureUrl;

  const onSubmit = async (data: ProfileFormData) => {
    const toastId = toast.loading('A guardar perfil...');
    try {
      // <-- CORREÇÃO AQUI
      let uploadedImageUrl = currentUser.profilePictureUrl;

      const newImageFile = data.profilePicture?.[0];
      if (newImageFile) {
        // <-- CORREÇÃO AQUI
        uploadedImageUrl = await apiService.uploadFile(newImageFile, `uploads/${currentUser.id}/profile`);
      }

      const updateData = {
        name: data.name,
        ...(isOwner && { phoneNumber: data.phoneNumber }),
        // <-- CORREÇÃO AQUI
        ...(uploadedImageUrl !== currentUser.profilePictureUrl && { profilePictureUrl: uploadedImageUrl }),
      };
      
      const updatedUser = await apiService.updateMyProfile(updateData);
      
      onProfileUpdate(updatedUser);
      
      toast.success("Perfil atualizado com sucesso!", { id: toastId });
      onGoBack();

    } catch (error) {
      toast.error(`Erro: ${error.message}`, { id: toastId });
      console.error("ERRO CRÍTICO ao atualizar perfil:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface p-8 rounded-xl shadow-lg border border-crust">
        <h2 className="text-3xl font-bold text-text mb-6">Editar Perfil</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <img 
              // <-- CORREÇÃO AQUI
              src={preview || `https://ui-avatars.com/api/?name=${currentUser.name.replace(' ', '+')}`}
              alt="Pré-visualização do Perfil"
              className="w-32 h-32 rounded-full object-cover border-4 border-primary"
            />
            <input 
              type="file" 
              accept="image/*" 
              id="profilePicture" 
              {...register('profilePicture')}
              className="sr-only" 
            />
            <label htmlFor="profilePicture" className="cursor-pointer text-blue font-semibold hover:underline">
              {/* <-- CORREÇÃO AQUI */}
              {preview !== currentUser.profilePictureUrl ? 'Mudar imagem' : 'Carregar nova imagem'}
            </label>
            <FieldError message={errors.profilePicture?.message as string} />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text">Nome Completo</label>
            <input type="text" id="name" {...register('name')} className="w-full mt-1 rounded-lg" />
            <FieldError message={errors.name?.message} />
          </div>

          {isOwner && (
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-text">Número de Telefone</label>
              <input type="tel" id="phoneNumber" {...register('phoneNumber')} className="w-full mt-1 rounded-lg" />
              <FieldError message={errors.phoneNumber?.message} />
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-crust">
            <Button type="button" variant="secondary" onClick={onGoBack}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'A guardar...' : 'Guardar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditPage;