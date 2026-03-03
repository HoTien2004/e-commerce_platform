import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      closeOnBackdropClick={!false}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-700">{message}</p>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;

