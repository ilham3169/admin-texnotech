import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';


const AddSpecificationModal = ({ isOpen, onClose, categories }) => {
  const [nameSpecification, setNameSpecification] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('https://back-texnotech.onrender.com/specifications/add', {
        name: nameSpecification,
        category_id: categoryId,
      });

      onClose();
    } catch (err) {
      setError('Failed to add specification. Please try again.');
      console.error('Error adding specification:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Spesifikasiya əlavə et</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Spesifikasiyanın adı</label>
              <input
                type="text"
                className="bg-gray-700 text-white rounded-lg p-2 w-full"
                value={nameSpecification}
                onChange={(e) => setNameSpecification(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Kateqoriya</label>
              <select
                className="bg-gray-700 text-white rounded-lg p-2 w-full"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Select</option>
                {categories.filter(c => c.id > 17).map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-red-500 text-sm col-span-2">{error}</p>}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                onClick={onClose}
                disabled={isLoading}
              >
                Bağla
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Bitir'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddSpecificationModal;
