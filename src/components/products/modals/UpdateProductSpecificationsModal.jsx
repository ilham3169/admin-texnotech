import React from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';


const UpdateProductSpecificationsModal = ({
  isOpen,
  onClose,
  productSpecifications,
  productSpecificationsDict,
  handleProductSpecificationInput,
  handleDeleteProductSpecification,
  handleUpdateProductSpecifications,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Məhsulun spesifikasiyalarını yeniləyin</h2>
        <form onSubmit={handleUpdateProductSpecifications}>
          <div className="grid grid-cols-2 gap-4">
            {productSpecifications.map((spec, index) => (
              <div className="mb-4" key={index}>
                <label className="block text-sm font-medium text-gray-300 mb-1">{spec.name}</label>
                <div style={{ display: "flex", justifyContent: 'center', gap: "3%" }} className="mb-1">
                  <input
                    type="text"
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    value={productSpecificationsDict[spec.id] || ""}
                    onChange={e => handleProductSpecificationInput(e.target.value, spec.id)}
                  />
                  <button
                    className="text-indigo-400 hover:text-indigo-300 mr-2"
                    style={{ color: "red" }}
                    onClick={(e) => handleDeleteProductSpecification(e, spec.id)}
                  >
                    <XCircle size={15} />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                onClick={onClose}
              >
                Bağla
              </button>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded">
                Bitir
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default UpdateProductSpecificationsModal;
