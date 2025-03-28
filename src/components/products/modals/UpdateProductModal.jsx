import React from 'react';
import { motion } from 'framer-motion';


const UpdateProductModal = ({
  isOpen,
  onClose,
  productData,
  categories,
  brands,

  handleUpdateProduct,
  handleCategoryChange,
  handleBrandChange,
  
  uploadMainImage,
  uploadAndAddImage,
  handleDeleteExtraImage,
  extraImages,
  setState,
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
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Məhsulu Yenilə</h2>
        <form onSubmit={handleUpdateProduct}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Məhsulun adı", type: "text", value: productData.productName, onChange: v => setState(prev => ({ ...prev, productName: v })) },
              { label: "Model", type: "text", value: productData.productModel, onChange: v => setState(prev => ({ ...prev, productModel: v })) },
              { label: "Qiymət", type: "number", value: productData.productPrice, onChange: v => setState(prev => ({ ...prev, productPrice: v })) },
              { label: "Endirim", type: "number", value: productData.productDiscount, onChange: v => setState(prev => ({ ...prev, productDiscount: v })) },
              { label: "Kəmiyyət", type: "number", value: productData.productStock, onChange: v => setState(prev => ({ ...prev, productStock: v })) },
              { label: "Açar sözlər", type: "text", value: productData.productKeywords, onChange: v => setState(prev => ({ ...prev, productKeywords: v })) },
              { label: "Id", type: "number", value: productData.productId, onChange: v => setState(prev => ({ ...prev, productId: v })) },
            ].map(({ label, type, value, onChange }) => (
              <div key={label} className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
                <input
                  type={type}
                  className="bg-gray-700 text-white rounded-lg p-2 w-full"
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  required
                />
              </div>
            ))}
            {[
              { label: "Kateqoriya", value: productData.productCategoryId, onChange: handleCategoryChange, options: categories },
              { label: "Brend", value: productData.productBrandId, onChange: handleBrandChange, options: brands },
            ].map(({ label, value, onChange, options }) => (
              <div key={label} className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
                <select
                  className="bg-gray-700 text-white rounded-lg p-2 w-full"
                  value={value}
                  onChange={onChange}
                  required
                >
                  <option value="">Sec</option>
                  {options.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </div>
            ))}
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                checked={productData.isSuperOffer}
                onChange={() => setState(prev => ({ ...prev, isSuperOffer: !prev.isSuperOffer }))}
                className="text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-300">Super Təklif</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Məhsulla əlaqəli Şəkillər</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Əsas Səhifə Şəkili</label>
            <div className="flex items-center gap-4 w-50">
              {productData.productImageLink && (
                <img
                  src={productData.productImageLink}
                  alt="Product Preview"
                  className="w-20 h-20 rounded-lg object-cover cursor-pointer"
                  onClick={() => setState(prev => ({ ...prev, mainImageZoomed: productData.productImageLink, extraImageZoomed: null, isImageModalOpen: true }))}
                />
              )}
              <input
                type="file"
                className="bg-gray-700 text-white rounded-lg p-2 w-30"
                style={{ width: "100%" }}
                onChange={e => uploadMainImage(e.target.files[0], productData.productId)}
              />
            </div>
          </div>
          <h1 className="block text-sm font-medium text-gray-300 mb-2">Əlavə məhsul şəkilləri</h1>
          <div className="mb-4">
            <div className="mt-4 flex flex-wrap gap-6">
              {extraImages.filter(image => image.product_id === productData.productId).length === 0 && (
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    className="bg-gray-700 text-white rounded-lg p-1 w-25"
                    onChange={e => uploadAndAddImage(e.target.files[0], productData.productId)}
                  />
                </div>
              )}
              {extraImages.filter(image => image.product_id === productData.productId).map((image, index) => (
                <div className="flex items-center gap-2 w-50" key={index}>
                  <div className="w-20">
                    <img
                      src={image.image_link}
                      alt={`Extra Image ${index + 1}`}
                      className="h-20 rounded-lg object-cover cursor-pointer"
                      onClick={() => setState(prev => ({ ...prev, extraImageZoomed: image.image_link, mainImageZoomed: null, isImageModalOpen: true }))}
                    />
                  </div>
                  <span
                    onClick={() => window.confirm("Are you sure you want to delete this image?") && handleDeleteExtraImage(image.id)}
                    className="text-red-500 cursor-pointer"
                  >
                    ✖
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-4 w-30">
                <input
                  type="file"
                  className="bg-gray-700 text-white rounded-lg p-1"
                  style={{ width: "100%" }}
                  onChange={e => uploadAndAddImage(e.target.files[0], productData.productId)}
                />
              </div>
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
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded">
              Növbəti
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default UpdateProductModal;
