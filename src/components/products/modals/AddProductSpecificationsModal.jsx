import React from 'react';
import { motion } from 'framer-motion';


const AddProductSpecificationsModal = ({
  isOpen,
  onClose,
  productSpecifications,
  productSpecificationsDict,
  onSpecificationChange,
  uploadedFiles,
  uploadStatus,
  onFileChange,
  onSubmit,
  isUploadComplete,
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
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Spesifikasiyaları doldur</h2>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {productSpecifications.map((spec, index) => (
              <div className="mb-4" key={index}>
                <label className="block text-sm font-medium text-gray-300 mb-2">{spec.name}</label>
                <input
                  type="text"
                  className="bg-gray-700 text-white rounded-lg p-2 w-full"
                  value={productSpecificationsDict[spec.id] || ''}
                  onChange={(e) => onSpecificationChange(e.target.value, spec.id)}
                />
              </div>
            ))}
            <div className="mb-4 col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Məhsul şəkillərini yüklə</label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="bg-gray-700 text-white rounded-lg p-2 w-full"
                onChange={onFileChange}
              />
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <span className="text-sm text-gray-300">{file.name}</span>
                      {uploadStatus[file.name] && (
                        <p
                          className={`text-sm ${
                            uploadStatus[file.name].success ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {uploadStatus[file.name].message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                onClick={onClose}
              >
                Bağla
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
              >
                Bitir
              </button>
            </div>
          </div>
        </form>
        {isUploadComplete && (
          <div className="mt-4 text-green-500 text-sm">Bütün şəkillər uğurla yükləndi!</div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AddProductSpecificationsModal;
