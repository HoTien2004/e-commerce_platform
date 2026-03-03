import { FiX } from 'react-icons/fi';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
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
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2 bg-gray-50 rounded-b-2xl">
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
    </div>,
    document.body
  );
};

export default ConfirmModal;

