import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const PurchaseSuccessPopup = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Popup Image */}
        <div className="relative w-full">
          <img
            src="/api/uploads/pop-up.png"
            alt="Purchase Success"
            className="w-full rounded-t-2xl"
            loading="lazy"
          />
        </div>

        {/* Footer Text */}
        <div className="px-6 py-6 text-center">
          <h3 className="text-xl font-bold text-primary-700 mb-2">
            🎉 Thank You for Your Purchase!
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Your order has been placed successfully. Have a wonderful celebration!
          </p>
          <button
            onClick={handleClose}
            className="btn-primary w-full"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPopup;
