import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Plus, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';

import AddProductModal from "./modals/AddProductModal.jsx";
import AddCategoryModal from './modals/AddCategoryModal.jsx';
import AddSpecificationModal from './modals/AddSpecificationModal.jsx';
import AddBrandModal from './modals/AddBrandModal.jsx';
import AddProductSpecificationsModal from "./modals/AddProductSpecificationsModal.jsx";
import UpdateProductModal from "./modals/UpdateProductModal.jsx";
import UpdateProductSpecificationsModal from "./modals/UpdateProductSpecificationsModal.jsx";
import ProductTableContent from './ProductTableContent.jsx';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const ProductTableHeader = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
  handleOpenAddProductModal,
  handleOpenBrandModal,
  handleOpenAddCategoryModal,
  handleOpenAddSpecificationModal,
  handleRefreshProducts,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          placeholder="Search products by name or ID..."
          className="pl-10 pr-4 py-2 rounded-md bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 w-64"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleOpenAddProductModal}
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={handleOpenAddCategoryModal}
          className="p-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
        >
          Kategoriya əlavə et
        </button>
        <button
          onClick={handleOpenBrandModal}
          className="p-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
        >
          Brand Əlavə et
        </button>
        <button
          onClick={handleOpenAddSpecificationModal}
          className="p-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
        >
          Spesifikasiya Əlavə et
        </button>
        <button
          onClick={handleRefreshProducts}
          className="p-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
        >
          <RefreshCcw size={20} />
        </button>
      </div>
    </div>
  );
};

const ProductsTable = () => {
  const [state, setState] = useState({
    isAddProductModalOpen: false,
    isAddProductSpecificationsModalOpen: false,
    isAddCategoryModalOpen: false,
    isAddSpecificationModalOpen: false,
    isAddBrandModalOpen: false,
    isAddProductSuccessModalOpen: false,
    isUpdateProductSpecificationsModalOpen: false,
    isUpdateProductModalOpen: false,
    searchTerm: "",
    products: [],
    categories: [],
    brands: [],
    updateProductId: null,
    addedProductId: null,
    productName: "",
    productCategoryId: null,
    productStock: null,
    productImageLink: "",
    productBrandId: null,
    productModel: "",
    productDiscount: null,
    productKeywords: "",
    isSuperOffer: null,
    productPrice: null,
    productId: null,
    productSpecifications: [],
    productSpecificationsDict: {},
    specificationValues: {},
    extraImages: [],
    uploadedFiles: [],
    uploadStatus: {},
    isUploadComplete: false,
    currentPage: 1,
    itemsPerPage: 10,
    itemsPerPageOptions: [5, 10, 20, 50],
    totalPages: 1,
    totalItems: 0,
    isLoading: false,
  });

  const fetchTotalProducts = async () => {
    try {
      const response = await axios.get('https://back-texnotech.onrender.com/products/num-products');
      const totalItems = response.data.num_products || response.data.count || response.data;
      return totalItems;
    } catch (error) {
      console.error('Error fetching total products:', error);
      return 0;
    }
  };

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, brandsRes, productsRes, totalItems] = await Promise.all([
        axios.get('https://back-texnotech.onrender.com/categories'),
        axios.get('https://back-texnotech.onrender.com/brands'),
        axios.get(`https://back-texnotech.onrender.com/products?page=${state.currentPage}&page_size=${state.itemsPerPage}`),
        fetchTotalProducts(),
      ]);

      const productsData = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.results || [];
      const totalPages = Math.ceil(totalItems / state.itemsPerPage) || 1;

      setState(prev => ({
        ...prev,
        categories: categoriesRes.data.sort((a, b) => a.name.localeCompare(b.name)),
        brands: brandsRes.data.sort((a, b) => a.name.localeCompare(b.name)),
        products: productsData,
        totalPages,
        totalItems,
      }));
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchProducts = async (page = state.currentPage, pageSize = state.itemsPerPage, search = state.searchTerm) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const url = `https://back-texnotech.onrender.com/products?page=${page}&page_size=${pageSize}${search ? `&search_query=${encodeURIComponent(search)}` : ''}`;
      console.log('Fetching from:', url);
      const [response, totalItems] = await Promise.all([
        axios.get(url),
        fetchTotalProducts(),
      ]);

      const productsData = Array.isArray(response.data) ? response.data : response.data.results || [];
      const totalPages = Math.ceil(totalItems / pageSize) || 1;

      setState(prev => ({
        ...prev,
        products: productsData,
        totalPages,
        totalItems,
        currentPage: page,
        itemsPerPage: pageSize,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const debouncedFetchProducts = useCallback(
    debounce((page, pageSize, search) => {
      fetchProducts(page, pageSize, search);
    }, 300),
    []
  );

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= state.totalPages) {
      fetchProducts(page, state.itemsPerPage, state.searchTerm);
    }
  }, [state.itemsPerPage, state.searchTerm, state.totalPages]);

  const handleItemsPerPageChange = useCallback((e) => {
    const newPageSize = parseInt(e.target.value);
    fetchProducts(1, newPageSize, state.searchTerm);
  }, [state.searchTerm]);

  const getPageNumbers = () => {
    const maxButtons = 10;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, state.currentPage - half);
    let end = start + maxButtons - 1;

    if (end > state.totalPages) {
      end = state.totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    const showLeftEllipsis = start > 1;
    const showRightEllipsis = end < state.totalPages;

    return { pages, showLeftEllipsis, showRightEllipsis };
  };

  const setSearchTerm = useCallback((term) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const handleSearch = useCallback(() => {
    fetchProducts(1, state.itemsPerPage, state.searchTerm);
  }, [state.itemsPerPage, state.searchTerm]);

  const handleRefreshProducts = useCallback(async () => {
    try {
      await axios.delete('https://back-texnotech.onrender.com/others/cache/clear');
      fetchProducts(1, state.itemsPerPage, state.searchTerm);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  }, [state.itemsPerPage, state.searchTerm]);

  const handleOpenAddProductModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddProductModalOpen: true }));
  }, []);

  const handleCloseAddProductModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddProductModalOpen: false, isAddProductSpecificationsModalOpen: true }));
  }, []);

  const handleProductAdded = useCallback(async (newProduct) => {
    setState(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
      addedProductId: newProduct.id,
      productCategoryId: newProduct.category_id,
    }));
    await handleCategorySpecifications();
    fetchProducts(state.currentPage, state.itemsPerPage, state.searchTerm);
  }, [state.currentPage, state.itemsPerPage, state.searchTerm]);

  const handleAddProductSpecifications = useCallback(async (e) => {
    e.preventDefault();
    const entries = Object.entries(state.productSpecificationsDict);
    let hasError = false;

    const requests = entries.map(([id, value]) => {
      const payload = { product_id: state.addedProductId, specification_id: id, value };
      return axios.post('https://back-texnotech.onrender.com/p_specification', payload).catch(error => {
        console.error('Error adding specification:', error);
        hasError = true;
      });
    });

    await Promise.all(requests);
    if (!hasError) setState(prev => ({ ...prev, isAddProductSpecificationsModalOpen: false, isAddProductSuccessModalOpen: true }));
  }, [state.productSpecificationsDict, state.addedProductId]);

  const handleCategorySpecifications = useCallback(async () => {
    try {
      const response = await axios.get(`https://back-texnotech.onrender.com/categories/values/${state.productCategoryId}`);
      const specs = response.data;
      const newDict = specs.reduce((acc, item) => ({ ...acc, [item.id]: "" }), {});
      setState(prev => ({ ...prev, productSpecifications: specs, productSpecificationsDict: newDict }));
    } catch (error) {
      console.error('Error fetching specifications:', error);
    }
  }, [state.productCategoryId]);

  const handleOpenAddSpecificationModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddSpecificationModalOpen: true }));
  }, []);

  const handleCloseAddSpecificationModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddSpecificationModalOpen: false }));
  }, []);

  const handleOpenAddBrandModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddBrandModalOpen: true }));
  }, []);

  const handleCloseAddBrandModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddBrandModalOpen: false }));
  }, []);

  const handleBrandAdded = useCallback((newBrand) => {
    setState(prev => ({
      ...prev,
      brands: [...prev.brands, newBrand].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, []);

  const handleSelectUpdateProductSpecifications = useCallback(async (product_id) => {
    try {
      const product = state.products.find(p => p.id === product_id);
      const [specsRes, existingSpecsRes] = await Promise.all([
        axios.get(`https://back-texnotech.onrender.com/categories/values/${product.category_id}`),
        axios.get(`https://back-texnotech.onrender.com/p_specification/values/${product_id}`),
      ]);

      const allSpecs = specsRes.data;
      const existingSpecs = existingSpecsRes.data;
      const specsDict = allSpecs.reduce((acc, spec) => {
        const existing = existingSpecs.find(es => es.id === spec.id);
        return { ...acc, [spec.id]: existing ? existing.value : "" };
      }, {});

      setState(prev => ({
        ...prev,
        productSpecifications: allSpecs,
        productSpecificationsDict: specsDict,
        isUpdateProductSpecificationsModalOpen: true,
      }));
    } catch (error) {
      console.error('Error fetching specifications for update:', error);
    }
  }, [state.products]);

  const handleSelectUpdateProduct = useCallback((product) => {
    setState(prev => ({
      ...prev,
      updateProductId: product.id,
      isUpdateProductModalOpen: true,
      productName: product.name,
      productCategoryId: product.category_id,
      productStock: product.num_product,
      productImageLink: product.image_link,
      productBrandId: product.brend_id,
      productModel: product.model_name,
      productDiscount: product.discount,
      productKeywords: product.search_string,
      isSuperOffer: product.is_super,
      productPrice: product.price,
      productId: product.id,
    }));
  }, []);

  const handleUpdateStatusProduct = useCallback(async (product) => {
    const is_active = !product.is_active;
    try {
      await axios.put(`https://back-texnotech.onrender.com/products/${product.id}`, { is_active });
      fetchProducts(state.currentPage, state.itemsPerPage, state.searchTerm);
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  }, [state.currentPage, state.itemsPerPage, state.searchTerm]);

  const handleUpdateProduct = useCallback(async (e) => {
    e.preventDefault();
    const payload = {
      name: state.productName,
      id: parseInt(state.productId),
      category_id: parseInt(state.productCategoryId),
      num_product: parseInt(state.productStock),
      image_link: state.productImageLink,
      brend_id: parseInt(state.productBrandId),
      model_name: state.productModel,
      discount: parseInt(state.productDiscount || 0),
      search_string: state.productKeywords,
      author_id: 1,
      is_super: state.isSuperOffer,
      is_new: true,
      price: parseInt(state.productPrice),
    };
    try {
      await axios.put(`https://back-texnotech.onrender.com/products/${state.updateProductId}`, payload);
      setState(prev => ({ ...prev, isUpdateProductModalOpen: false }));
      await handleSelectUpdateProductSpecifications(state.productId);
      fetchProducts(state.currentPage, state.itemsPerPage, state.searchTerm);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  }, [state, handleSelectUpdateProductSpecifications, state.currentPage, state.itemsPerPage, state.searchTerm]);

  const handleProductSpecificationInput = useCallback((value, id) => {
    setState(prev => ({
      ...prev,
      specificationValues: { ...prev.specificationValues, [id]: value },
      productSpecificationsDict: { ...prev.productSpecificationsDict, [id]: value },
    }));
  }, []);

  const handleDeleteProductSpecification = useCallback(async (e, spec_id) => {
    e.preventDefault();
    try {
      await axios.delete(
        `https://back-texnotech.onrender.com/p_specification/product/${state.updateProductId}/${spec_id}`,
      );
    } catch (error) {
      if (error.status === 404) {
        console.error("Specification doesn't exist.");
      } else {
        console.error('Error deleting specification:', error);
      }
    }
  }, [state.updateProductId]);

  const handleUpdateProductSpecifications = useCallback(async (e) => {
    e.preventDefault();
    const entries = Object.entries(state.productSpecificationsDict);
    let hasError = false;
    try {
      const existingSpecsResponse = await axios.get(`https://back-texnotech.onrender.com/p_specification/values/${state.updateProductId}`);
      const existingSpecs = existingSpecsResponse.data || [];
      const categorySpecsResponse = await axios.get(`https://back-texnotech.onrender.com/categories/values/${state.productCategoryId}`);
      const categorySpecs = categorySpecsResponse.data || [];
      const specIdToNameMap = categorySpecs.reduce((acc, spec) => {
        acc[spec.id] = spec.name;
        return acc;
      }, {});
      for (const [specificationId, value] of entries) {
        if (value) {
          const specName = specIdToNameMap[parseInt(specificationId)];
          if (!specName) continue;
          const specRecord = existingSpecs.find(spec => spec.name === specName);
          if (specRecord && specRecord.id) {
            const payload = { product_id: state.updateProductId, value };
            try {
              await axios.put(`https://back-texnotech.onrender.com/p_specification/${specRecord.id}`, payload);
            } catch (error) {
              console.error(`Error updating specification ${specName}:`, error);
              hasError = true;
            }
          } else {
            const specToCreate = categorySpecs.find(spec => spec.name === specName);
            if (specToCreate) {
              const payload = {
                product_id: state.updateProductId,
                specification_id: parseInt(specificationId),
                value,
              };
              try {
                await axios.post('https://back-texnotech.onrender.com/p_specification', payload);
              } catch (error) {
                console.error(`Error adding new specification ${specName}:`, error);
                hasError = true;
              }
            }
          }
        }
      }
      if (!hasError) {
        setState(prev => ({ ...prev, isUpdateProductSpecificationsModalOpen: false }));
        fetchProducts(state.currentPage, state.itemsPerPage, state.searchTerm);
      }
    } catch (error) {
      console.error('Error fetching or updating specifications:', error);
      hasError = true;
    }
  }, [state.productSpecificationsDict, state.updateProductId, state.productCategoryId, state.currentPage, state.itemsPerPage, state.searchTerm]);

  const handleCategoryChange = useCallback((e) => setState(prev => ({ ...prev, productCategoryId: e.target.value })), []);
  const handleBrandChange = useCallback((e) => setState(prev => ({ ...prev, productBrandId: e.target.value })), []);

  const uploadMainImage = useCallback(async (file, productId) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadResponse = await fetch("https://back-texnotech.onrender.com/files", { method: "POST", body: formData });
      if (!uploadResponse.ok) throw new Error("Image upload failed.");
      const imageLink = await uploadResponse.json();
      const imagePayload = { image_link: imageLink };
      const dbResponse = await fetch(`https://back-texnotech.onrender.com/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imagePayload),
      });
      if (!dbResponse.ok) throw new Error("Failed to add image to the database.");
      setState(prev => ({ ...prev, productImageLink: imageLink }));
      fetchProducts(state.currentPage, state.itemsPerPage, state.searchTerm);
    } catch (error) {
      console.error("Error uploading main image:", error);
    }
  }, [state.currentPage, state.itemsPerPage, state.searchTerm]);

  const uploadAndAddImage = useCallback(async (file, productId) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadResponse = await fetch("https://back-texnotech.onrender.com/files", { method: "POST", body: formData });
      if (!uploadResponse.ok) throw new Error("Image upload failed.");
      const imageLink = await uploadResponse.json();
      const imagePayload = { image_link: imageLink, product_id: productId };
      const dbResponse = await fetch("https://back-texnotech.onrender.com/images/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imagePayload),
      });
      if (!dbResponse.ok) throw new Error("Failed to add image to the database.");
      setState(prev => ({ ...prev, extraImages: [...prev.extraImages, { image_link: imageLink, product_id: productId }] }));
    } catch (error) {
      console.error("Error uploading extra image:", error);
    }
  }, []);

  const handleDeleteExtraImage = useCallback(async (id) => {
    try {
      const response = await fetch(`https://back-texnotech.onrender.com/images/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_id: id }),
      });
      if (response.ok) {
        setState(prev => ({
          ...prev,
          extraImages: prev.extraImages.filter(image => image.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }, []);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    setState(prev => ({ ...prev, uploadedFiles: [...prev.uploadedFiles, ...files] }));
  }, []);

  const handleOpenAddCategoryModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddCategoryModalOpen: true }));
  }, []);

  const handleCloseAddCategoryModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddCategoryModalOpen: false }));
  }, []);

  const handleCategoryAdded = useCallback((newCategory) => {
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, []);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <ProductTableHeader
        searchTerm={state.searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        handleOpenAddProductModal={handleOpenAddProductModal}
        handleOpenBrandModal={handleOpenAddBrandModal}
        handleOpenAddCategoryModal={handleOpenAddCategoryModal}
        handleOpenAddSpecificationModal={handleOpenAddSpecificationModal}
        handleRefreshProducts={handleRefreshProducts}
      />

      <AddProductModal
        isOpen={state.isAddProductModalOpen}
        onClose={handleCloseAddProductModal}
        onProductAdded={handleProductAdded}
        categories={state.categories}
        brands={state.brands}
      />
      <AddProductSpecificationsModal
        isOpen={state.isAddProductSpecificationsModalOpen}
        onClose={() => setState(prev => ({ ...prev, isAddProductSpecificationsModalOpen: false }))}
        productSpecifications={state.productSpecifications}
        productSpecificationsDict={state.productSpecificationsDict}
        onSpecificationChange={handleProductSpecificationInput}
        uploadedFiles={state.uploadedFiles}
        uploadStatus={state.uploadStatus}
        onFileChange={handleFileChange}
        onSubmit={handleAddProductSpecifications}
        isUploadComplete={state.isUploadComplete}
      />
      <AddCategoryModal
        isOpen={state.isAddCategoryModalOpen}
        onClose={handleCloseAddCategoryModal}
        onCategoryAdded={handleCategoryAdded}
        categories={state.categories}
      />
      <AddSpecificationModal
        isOpen={state.isAddSpecificationModalOpen}
        onClose={handleCloseAddSpecificationModal}
        categories={state.categories}
      />
      <AddBrandModal
        isOpen={state.isAddBrandModalOpen}
        onClose={handleCloseAddBrandModal}
        onBrandAdded={handleBrandAdded}
      />

      {state.isLoading ? (
        <div className="text-gray-300 text-center py-4">Loading products...</div>
      ) : state.products.length === 0 ? (
        <div className="text-gray-300 text-center py-4">No products found</div>
      ) : (
        <ProductTableContent
          products={state.products}
          categories={state.categories}
          handleSelectUpdateProduct={handleSelectUpdateProduct}
          handleUpdateStatusProduct={handleUpdateStatusProduct}
        />
      )}

      <div className="flex justify-between items-center mt-4">
        <div className="text-gray-400">
          Showing {(state.currentPage - 1) * state.itemsPerPage + 1} to{' '}
          {Math.min(state.currentPage * state.itemsPerPage, state.totalItems)} of{' '}
          {state.totalItems} products
        </div>
        <div className="flex items-center gap-2">
          <select
            value={state.itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="bg-gray-700 text-gray-300 rounded-md p-1"
          >
            {state.itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option} per page
              </option>
            ))}
          </select>
          <button
            onClick={() => handlePageChange(state.currentPage - 1)}
            disabled={state.currentPage === 1}
            className="p-2 rounded-md bg-gray-700 text-gray-300 disabled:opacity-50 hover:bg-gray-600"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-1">
            {(() => {
              const { pages, showLeftEllipsis, showRightEllipsis } = getPageNumbers();
              return (
                <>
                  {showLeftEllipsis && (
                    <span className="px-3 py-1 text-gray-300">...</span>
                  )}
                  {pages.map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md ${
                        state.currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  {showRightEllipsis && (
                    <span className="px-3 py-1 text-gray-300">...</span>
                  )}
                </>
              );
            })()}
          </div>
          <button
            onClick={() => handlePageChange(state.currentPage + 1)}
            disabled={state.currentPage === state.totalPages}
            className="p-2 rounded-md bg-gray-700 text-gray-300 disabled:opacity-50 hover:bg-gray-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <UpdateProductModal
        isOpen={state.isUpdateProductModalOpen}
        onClose={() => setState(prev => ({ ...prev, isUpdateProductModalOpen: false }))}
        productData={{
          productName: state.productName,
          productModel: state.productModel,
          productPrice: state.productPrice,
          productDiscount: state.productDiscount,
          productStock: state.productStock,
          productKeywords: state.productKeywords,
          productId: state.productId,
          productCategoryId: state.productCategoryId,
          productBrandId: state.productBrandId,
          isSuperOffer: state.isSuperOffer,
          productImageLink: state.productImageLink,
        }}
        categories={state.categories}
        brands={state.brands}
        handleUpdateProduct={handleUpdateProduct}
        handleCategoryChange={handleCategoryChange}
        handleBrandChange={handleBrandChange}
        uploadMainImage={uploadMainImage}
        uploadAndAddImage={uploadAndAddImage}
        handleDeleteExtraImage={handleDeleteExtraImage}
        extraImages={state.extraImages}
        setState={setState}
      />
      <UpdateProductSpecificationsModal
        isOpen={state.isUpdateProductSpecificationsModalOpen}
        onClose={() => setState(prev => ({ ...prev, isUpdateProductSpecificationsModalOpen: false }))}
        productSpecifications={state.productSpecifications}
        productSpecificationsDict={state.productSpecificationsDict}
        handleProductSpecificationInput={handleProductSpecificationInput}
        handleDeleteProductSpecification={handleDeleteProductSpecification}
        handleUpdateProductSpecifications={handleUpdateProductSpecifications}
      />
    </motion.div>
  );
};

export default ProductsTable;