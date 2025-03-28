import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';


const AddProductModal = ({ isOpen, onClose, onProductAdded, categories, brands }) => {
  const [productName, setProductName] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [productBrandId, setProductBrandId] = useState('');
  const [productModel, setProductModel] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDiscount, setProductDiscount] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productKeywords, setProductKeywords] = useState('');
  const [productImageLink, setProductImageLink] = useState('');
  const [isSuperOffer, setIsSuperOffer] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let imageLink = productImageLink;

    if (uploadedFile) {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      try {
        const response = await fetch("https://back-texnotech.onrender.com/files", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("File upload failed");
        imageLink = await response.json();
      
      } catch (err) {
        setError('Failed to upload image. Please try again.');
        setIsLoading(false);
        return;
      }

    }

    const productPayload = {
      name: productName,
      category_id: parseInt(productCategoryId),
      num_product: parseInt(productStock),
      image_link: imageLink,
      brend_id: parseInt(productBrandId),
      model_name: productModel,
      discount: parseInt(productDiscount || 0),
      search_string: productKeywords,
      author_id: 1,
      is_super: isSuperOffer,
      is_new: true,
      price: parseInt(productPrice),
    };

    try {
      const response = await axios.post('https://back-texnotech.onrender.com/products/add', productPayload);

      await onProductAdded(response.data); // Notify parent
      onClose(); // Close modal
    
    } catch (err) {
      setError('Failed to add product. Please try again.');
      console.error('Error adding product:', err);
    
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto absolute top-4"
        initial={{ y: -200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Məhsul əlavə et</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Məhsulun adı</label>
              <input
                type="text"
                className="bg-gray-700 text-white rounded-lg p-2 w-full"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Kateqoriya</label>
              <select
                className="bg-gray-700 text-white rounded-lg p-2 w-full"
                value={productCategoryId}
                onChange={(e) => setProductCategoryId(e.target.value)}
                required
              >
                <option value="">Select</option>
                {categories.filter(c => c.id > 17).map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Brend</label>
              <select
                className="bg-gray-700 text-white rounded-lg p-2 w-full"
                value={productBrandId}
                onChange={(e) => setProductBrandId(e.target.value)}
                required
              >
                <option value="">Select</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
              <input
                type="text"
                className="bg-gray-700 text-white rounded-lg p-2 w-full"
                value={productModel}
                onChange={(e) => setProductModel(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Qiymət</label>
              <input
                type="number"
                className="bg-gray-700 text-white rounded-lg p-2 w-full"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Endirimli Qiymət</label>
              <input
                type="number"
                className="bg-gray-700 text-white rounded-lg p-2 w-full"
                value={productDiscount}
                onChange={(e) => setProductDiscount(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Kəmiyyət</label>
              <input
                type="number"
                className="bg-gray-700 text-white rounded-lg p-2 w-full"
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Açar sözlər</label>
              <input
                type="text"
                className="bg-gray-700 text-white rounded-lg p-2 w-full"
                value={productKeywords}
                onChange={(e) => setProductKeywords(e.target.value)}
              />
            </div>
            <div className="mb-4 col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Məhsul şəklini yüklə</label>
              <input
                type="file"
                accept="image/*"
                className="bg-gray-700 text-white rounded-lg p-2 w-full"
                onChange={handleFileChange}
              />
              {uploadedFile && (
                <div className="mt-4 flex items-center space-x-2">
                  <img src={URL.createObjectURL(uploadedFile)} alt={uploadedFile.name} className="w-16 h-16 object-cover rounded-lg" />
                  <span className="text-white text-sm">{uploadedFile.name}</span>
                </div>
              )}
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                checked={isSuperOffer}
                onChange={() => setIsSuperOffer(!isSuperOffer)}
                className="text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-300">Super Təklif</span>
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
                {isLoading ? 'Adding...' : 'Növbəti'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddProductModal;
