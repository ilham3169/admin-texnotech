import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';


const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded, categories }) => {
  const [nameCategory, setNameCategory] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [specifications, setSpecifications] = useState([{ name: "" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddSpecification = () => {
    setSpecifications([...specifications, { name: "" }]);
  };

  const handleRemoveSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSpecificationChange = (index, value) => {
    const newSpecifications = [...specifications];
    newSpecifications[index].name = value;
    setSpecifications(newSpecifications);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const categoryResponse = await axios.post('https://back-texnotech.onrender.com/categories/child/add', {
        name: nameCategory,
        is_active: true,
        num_category: 0,
        parent_category_id: parentCategory,
      });
      const categoryId = categoryResponse.data.id;

      const specificationPromises = specifications.map(spec => {
        return axios.post('https://back-texnotech.onrender.com/specifications/add', {
          name: spec.name,
          category_id: categoryId,
        });
      });

      await Promise.all(specificationPromises);
      onCategoryAdded({ id: categoryId, name: nameCategory, parent_category_id: parentCategory });
      onClose();
    } catch (err) {
      setError('Failed to add category or specifications. Please try again.');
      console.error('Error adding category:', err);
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
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Kateqoriya əlavə et</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Kateqoriya adı</label>
              <input
                type="text"
                className="bg-gray-700 text-white rounded-lg p-2 w-full"
                value={nameCategory}
                onChange={(e) => setNameCategory(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ana Kateqoriya</label>
              <select
                className="bg-gray-700 text-white rounded-lg p-2 w-full"
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
                required
              >
                <option value="">Select</option>
                {categories.filter(c => c.id > 17).map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <h3 className="text-lg font-medium text-gray-100 mb-2">Spesifikasiyalar</h3>
              {specifications.map((spec, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    value={spec.name}
                    onChange={(e) => handleSpecificationChange(index, e.target.value)}
                    placeholder={`Spesifikasiya #${index + 1}`}
                    required
                  />
                  {specifications.length > 1 && (
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-500"
                      onClick={() => handleRemoveSpecification(index)}
                    >
                      Sil
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="text-indigo-400 hover:text-indigo-500"
                onClick={handleAddSpecification}
              >
                + Başqa Spesifikasiya əlavə et
              </button>
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

export default AddCategoryModal;
