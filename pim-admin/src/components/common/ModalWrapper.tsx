import React from 'react';
import { Modal as BaseModal } from './Modal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Compatibility wrapper for CategoryManagement
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <BaseModal
      open={isOpen}
      onClose={() => onClose()}
      title={title}
      showCloseButton={true}
    >
      {children}
    </BaseModal>
  );
};

export default Modal;
