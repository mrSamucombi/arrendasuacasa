
import React from 'react';
import { UserRole } from '../types ';

interface RoleSwitchProps {
  userRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

const RoleSwitch: React.FC<RoleSwitchProps> = ({ userRole, onRoleChange }) => {
  const isClient = userRole === UserRole.Client;

  return (
    <div className="flex items-center bg-gray-200 rounded-full p-1 cursor-pointer">
      <button
        onClick={() => onRoleChange(UserRole.Client)}
        className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${
          isClient ? 'bg-primary text-white shadow' : 'text-gray-600'
        }`}
      >
        Cliente
      </button>
      <button
        onClick={() => onRoleChange(UserRole.Owner)}
        className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${
          !isClient ? 'bg-primary text-white shadow' : 'text-gray-600'
        }`}
      >
        Proprietário
      </button>
    </div>
  );
};

export default RoleSwitch;
