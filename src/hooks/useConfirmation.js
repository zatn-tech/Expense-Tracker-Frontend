import { useState, useCallback } from 'react';

export const useConfirmation = () => {
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    onConfirm: null
  });

  const showConfirmation = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning',
    onConfirm
  }) => {
    setConfirmation({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  }, []);

  const confirm = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning'
  }) => {
    return new Promise((resolve) => {
      showConfirmation({
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => resolve(true)
      });
    });
  }, [showConfirmation]);

  return {
    confirmation,
    showConfirmation,
    hideConfirmation,
    confirm
  };
}; 