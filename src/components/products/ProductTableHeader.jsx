import React from 'react';
import { Search, Plus, RefreshCcw } from 'lucide-react';


const ProductTableHeader = ({
  searchTerm,
  handleSearch,
  handleOpenAddProductModal,
  handleOpenBrandModal,
  handleOpenAddCategoryModal,
  handleOpenAddSpecificationModal,
  handleRefreshProducts,
}) => (

  <div className="flex items-center mb-6" style={{ gap: '2%' }}>
    <h2 className="text-xl font-semibold text-gray-100">Məhsulların siyahısı</h2>
    <div className="relative">
      <input
        type="text"
        placeholder="Məhsulları axtar..."
        className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={handleSearch}
        value={searchTerm}
      />
      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
    </div>
    <button
      onClick={handleOpenAddProductModal}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
    >
      <Plus size={18} /> Məhsul
    </button>
    <button
      onClick={handleOpenBrandModal}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
    >
      <Plus size={18} /> Brend
    </button>
    <button
      onClick={handleOpenAddCategoryModal}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
    >
      <Plus size={18} /> Kateqoriya
    </button>
    <button
      onClick={handleOpenAddSpecificationModal}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
    >
      <Plus size={18} /> Spesifikasiya
    </button>
    <button
      onClick={handleRefreshProducts}
      className="hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
    >
      <RefreshCcw size={20} />
    </button>
  </div>
);

export default ProductTableHeader;
