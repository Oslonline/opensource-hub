interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonLabel: string;
  cancelButtonLabel: string;
}

const ConfirmationModal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmButtonLabel, cancelButtonLabel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-lg">
      <div className="bg-zinc-150 rounded-md border-2 p-4 shadow-lg dark:bg-zinc-950">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p>{message}</p>
        <div className="mt-4 flex justify-end gap-4">
          <button onClick={onClose} className="rounded-md border px-4 py-2 duration-150 dark:border-zinc-100 dark:hover:border-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-950">
            {cancelButtonLabel}
          </button>
          <button onClick={onConfirm} className="rounded-md bg-red-600 px-4 py-2 duration-150 dark:hover:border-zinc-100 dark:hover:bg-red-800">
            {confirmButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
