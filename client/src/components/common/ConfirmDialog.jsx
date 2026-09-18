import { AlertTriangle } from "lucide-react";

import Modal from "./Modal";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title={title}
      description={message}
      size="small"
    >
      <div className="confirm-dialog">

        <div className="confirm-dialog-icon">
          <AlertTriangle size={24} />
        </div>

        <div className="confirm-dialog-actions">

          <button
            type="button"
            className="confirm-dialog-cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="confirm-dialog-confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : confirmText}
          </button>

        </div>

      </div>
    </Modal>
  );
};

export default ConfirmDialog;