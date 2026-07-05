import { useState } from 'react';
import Modal from '../Modal/Modal';
import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, message, onConfirm, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Xác nhận">
      <div className="confirm-dialog__body">
        <p>{message}</p>
      </div>
      <div className="confirm-dialog__footer">
        <button 
          className="btn-cancel" 
          onClick={onCancel} 
          disabled={isProcessing}
        >
          Hủy
        </button>
        <button 
          className="btn-confirm-delete" 
          onClick={handleConfirm} 
          disabled={isProcessing}
        >
          {isProcessing ? 'Đang xử lý...' : 'Xác nhận xóa'}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
