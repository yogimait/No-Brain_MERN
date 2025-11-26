import { X, AlertTriangle } from 'lucide-react';
import { Button } from './button';

export function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger' // 'danger' or 'default'
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: 'bg-gray-700 hover:bg-gray-600 text-white',
      icon: 'text-gray-400',
      border: 'border-gray-700/50'
    },
    default: {
      button: 'bg-gray-700 hover:bg-gray-600 text-white',
      icon: 'text-gray-400',
      border: 'border-gray-700/50'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative z-10 bg-gray-900/95 backdrop-blur-xl border-2 border-gray-700/50 rounded-2xl p-6 w-[90vw] max-w-md shadow-2xl transform transition-all duration-200 scale-100 opacity-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className={`p-3 rounded-full bg-gray-800/50 ${styles.icon}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-300 text-center mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-gray-600 hover:border-gray-500 hover:bg-gray-800 text-gray-300"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            className={`flex-1 ${styles.button}`}
            onClick={async () => {
              await onConfirm();
              // onClose will be called by the parent component after successful operation
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

