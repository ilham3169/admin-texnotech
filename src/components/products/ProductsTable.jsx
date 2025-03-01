import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Plus, Edit, AlertTriangle, DollarSign, Package, TrendingUp, RefreshCcw } from 'lucide-react';
import StatCard from "../common/StatCard";
import { ToggleLeft, ToggleRight } from 'phosphor-react';

// Memoized Product Row Component
const ProductRow = React.memo(({ product, categories, handleSelectUpdateProduct, handleUpdateStatusProduct }) => (
  <motion.tr
    key={product.id}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center">
      <img src={product.image_link} alt="Product img" className="size-10 rounded-full" />
      {product.name}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
      {categories.find(category => category.id === product.category_id)?.name || 'Unknown'} ({product.category_id})
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.price.toFixed(2)} AZN</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.num_product}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.sales || 0}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
      <button className="text-indigo-400 hover:text-indigo-300 mr-2" onClick={() => handleSelectUpdateProduct(product)}>
        <Edit size={28} />
      </button>
      <button
        className={`${product.is_active ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-gray-300'}`}
        onClick={() => handleUpdateStatusProduct(product)}
        title={product.is_active ? 'Disable Product' : 'Enable Product'}
      >
        {product.is_active ? <ToggleLeft size={28} /> : <ToggleRight size={28} />}
      </button>
    </td>
  </motion.tr>
));

const ProductsTable = () => {
  const modalRef = useRef(null);

  // Consolidated state for modals and forms
  const [state, setState] = useState({
    isBrandModalOpen: false,
    nameBrand: "",
    searchTerm: "",
    products: [],
    filteredProducts: [],
    isModalOpen: false,
    categories: [],
    brands: [],
    deleteProductId: null,
    updateProductId: null,
    productName: "",
    productCategoryId: "",
    productBrandId: "",
    productModel: "",
    productPrice: "",
    productDiscount: "",
    productStock: "",
    productKeywords: "",
    productImageLink: "",
    isSuperOffer: false,
    productId: "",
    productSpecifications: [],
    isNextModalIsOpen: false,
    isDeleteProductModalOpen: false,
    isUpdateProductModalOpen: false,
    isUpdateProductSpecificationsModalOpen: false,
    specificationValues: {},
    productSpecificationsDict: {},
    addedProductId: null,
    uploadedFiles: [],
    uploadStatus: {},
    isUploadComplete: false,
    isSuccessModalOpen: false,
    isImageModalOpen: false,
    uploadedFile: null,
    extraImages: [],
    zoomedImage: null,
    mainImageZoomed: null,
    extraImageZoomed: null,
  });

  // Stats memoized
  const stats = useMemo(() => {
    return state.products.reduce(
      (acc, product) => {
        acc.totalNumProducts += product.num_product;
        acc.priceTotalProducts += product.price * product.num_product;
        if (product.is_new) acc.newNumProducts += 1;
        if (product.is_super) acc.superNumProducts += 1;
        return acc;
      },
      { totalNumProducts: 0, newNumProducts: 0, superNumProducts: 0, priceTotalProducts: 0 }
    );
  }, [state.products]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, brandsRes, productsRes, imagesRes] = await Promise.all([
          axios.get('https://texnotech.store/categories'),
          axios.get('https://texnotech.store/brands'),
          axios.get('https://texnotech.store/products'),
          axios.get('https://texnotech.store/images'),
        ]);
        setState(prev => ({
          ...prev,
          categories: categoriesRes.data.sort((a, b) => a.name.localeCompare(b.name)),
          brands: brandsRes.data.sort((a, b) => a.name.localeCompare(b.name)),
          products: productsRes.data,
          filteredProducts: productsRes.data,
          extraImages: imagesRes.data,
        }));
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchData();
  }, []);

  // Memoized handlers
  const handleSearch = useCallback((e) => {
    const term = e.target.value.toLowerCase();
    setState(prev => ({
      ...prev,
      searchTerm: term,
      filteredProducts: prev.products.filter(
        product => product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term)
      ),
    }));
  }, []);

  const handleRefreshProducts = useCallback(async () => {
    try {
      await axios.delete('https://texnotech.store/others/cache/clear');
      const response = await axios.get('https://texnotech.store/products');
      setState(prev => ({ ...prev, products: response.data, filteredProducts: response.data }));
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  }, []);

  const uploadMainImage = useCallback(async (file, productId) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadResponse = await fetch("https://texnotech.store/files", { method: "POST", body: formData });
      if (!uploadResponse.ok) throw new Error("Image upload failed.");
      const imageLink = await uploadResponse.json();
      const imagePayload = { image_link: imageLink };
      const dbResponse = await fetch(`https://texnotech.store/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imagePayload),
      });
      if (!dbResponse.ok) throw new Error("Failed to add image to the database.");
      setState(prev => ({ ...prev, productImageLink: imageLink }));
    } catch (error) {
      console.error("Error uploading main image:", error);
    }
  }, []);

  const uploadAndAddImage = useCallback(async (file, productId) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadResponse = await fetch("https://texnotech.store/files", { method: "POST", body: formData });
      if (!uploadResponse.ok) throw new Error("Image upload failed.");
      const imageLink = await uploadResponse.json();
      const imagePayload = { image_link: imageLink, product_id: productId };
      const dbResponse = await fetch("https://texnotech.store/images/add", {
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
      const response = await fetch(`https://texnotech.store/images/${id}`, {
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

  const handleFileChangex = useCallback((e) => {
    const file = e.target.files[0];
    if (file) setState(prev => ({ ...prev, uploadedFile: file }));
  }, []);

  const clearInputFields = useCallback(() => {
    setState(prev => ({
      ...prev,
      productName: '', productCategoryId: '', productBrandId: '', productModel: '', productPrice: '', productDiscount: '',
      productStock: '', productKeywords: '', productImageLink: '', isSuperOffer: false, productSpecificationsDict: {},
      uploadedFiles: [], uploadStatus: {}, isUploadComplete: false, productId: '',
    }));
  }, []);

  const handleAddProductClick = useCallback(() => {
    clearInputFields();
    setState(prev => ({ ...prev, isModalOpen: true }));
  }, [clearInputFields]);

  const handleAddBrandClick = useCallback(() => {
    setState(prev => ({ ...prev, nameBrand: "", isBrandModalOpen: true }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    setState(prev => ({ ...prev, uploadedFiles: [...prev.uploadedFiles, ...files] }));
  }, []);

  const uploadFiles = useCallback(async () => {
    if (!state.uploadedFiles.length) {
      alert("No files to upload.");
      return;
    }
    setState(prev => ({ ...prev, uploadStatus: {}, isUploadComplete: false }));
    for (const file of state.uploadedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("https://texnotech.store/files", { method: "POST", body: formData });
        if (!response.ok) throw new Error(`Upload failed for ${file.name}`);
        const result = await response.json();
        const imagePayload = { image_link: result, product_id: state.addedProductId };
        const dbResponse = await fetch("https://texnotech.store/images/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(imagePayload),
        });
        if (!dbResponse.ok) throw new Error(`Failed to add image to database for ${file.name}`);
        setState(prev => ({
          ...prev,
          uploadStatus: { ...prev.uploadStatus, [file.name]: { success: true, message: "Upload successful" } },
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          uploadStatus: { ...prev.uploadStatus, [file.name]: { success: false, message: error.message } },
        }));
      }
    }
    setState(prev => ({ ...prev, isUploadComplete: true }));
  }, [state.uploadedFiles, state.addedProductId]);

  const handleCategorySpecifications = useCallback(async () => {
    try {
      const response = await axios.get(`https://texnotech.store/categories/values/${state.productCategoryId}`);
      const specs = response.data;
      const newDict = specs.reduce((acc, item) => ({ ...acc, [item.id]: "" }), {});
      setState(prev => ({ ...prev, productSpecifications: specs, productSpecificationsDict: newDict }));
    } catch (error) {
      console.error('Error fetching specifications:', error);
    }
  }, [state.productCategoryId]);

  const handleUpdateProductSpecifications = useCallback(async (e) => {
    e.preventDefault();
    const entries = Object.entries(state.productSpecificationsDict);
    let hasError = false;
  
    try {
      // Fetch existing product specifications for the current product
      console.log(`Trying to update product - ${state.updateProductId}`);
      const existingSpecsResponse = await axios.get(`https://texnotech.store/p_specification/values/${state.updateProductId}`);
      const existingSpecs = existingSpecsResponse.data || [];
      console.log('Existing specs structure:', JSON.stringify(existingSpecs, null, 2));
  
      // Fetch all specifications for the product's category to map names to specification_ids
      const categorySpecsResponse = await axios.get(`https://texnotech.store/categories/values/${state.productCategoryId}`);
      const categorySpecs = categorySpecsResponse.data || [];
      console.log('Category specs structure:', JSON.stringify(categorySpecs, null, 2));
  
      // Create a map of specification_id to name for easy lookup
      const specIdToNameMap = categorySpecs.reduce((acc, spec) => {
        acc[spec.id] = spec.name;
        return acc;
      }, {});
  
      for (const [specificationId, value] of entries) {
        if (value) { // Only update if there's a value
          // Find the name of the specification using specificationId from state.productSpecificationsDict
          const specName = specIdToNameMap[parseInt(specificationId)];
          if (!specName) {
            console.warn(`No name found for specification_id ${specificationId}`);
            continue;
          }
  
          // Find the existing product_specification record for this product by matching the specification name
          const specRecord = existingSpecs.find(spec => spec.name === specName);
  
          if (specRecord && specRecord.id) { // If the record exists, use its p_specification_id
            console.log(`Found existing spec for name ${specName}, p_spec_id: ${specRecord.id}`);
            const payload = { product_id: state.updateProductId, value };
            try {
              await axios.put(`https://texnotech.store/p_specification/${specRecord.id}`, payload);
            } catch (error) {
              console.error(`Error updating specification ${specName}:`, error);
              hasError = true;
            }
          } else {
            console.log(`No existing spec found for name ${specName}, creating new one`);
            // If no existing record is found, create a new one
            const specToCreate = categorySpecs.find(spec => spec.name === specName);
            if (specToCreate) {
              const payload = { 
                product_id: state.updateProductId, 
                specification_id: parseInt(specificationId), 
                value 
              };
              try {
                await axios.post('https://texnotech.store/p_specification', payload);
              } catch (error) {
                console.error(`Error adding new specification ${specName}:`, error);
                hasError = true;
              }
            } else {
              console.error(`Specification ${specName} not found in category specs`);
              hasError = true;
            }
          }
        }
      }
  
      if (!hasError) {
        setState(prev => ({ ...prev, isUpdateProductSpecificationsModalOpen: false }));
      }
    } catch (error) {
      console.error('Error fetching or updating specifications:', error);
      hasError = true;
    }
  }, [state.productSpecificationsDict, state.updateProductId, state.productCategoryId]);

  const handleAddProductSpecifications = useCallback(async (e) => {
    e.preventDefault();
    const entries = Object.entries(state.productSpecificationsDict);
    let hasError = false;
    const requests = entries.map(([id, value]) => {
      const payload = { product_id: state.addedProductId, specification_id: id, value };
      return axios.post('https://texnotech.store/p_specification', payload).catch(error => {
        console.error('Error adding specification:', error);
        hasError = true;
      });
    });
    await Promise.all(requests);
    if (!hasError) setState(prev => ({ ...prev, isNextModalIsOpen: false, isSuccessModalOpen: true }));
  }, [state.productSpecificationsDict, state.addedProductId]);

  const handleProductSpecificationInput = useCallback((value, id) => {
    setState(prev => ({
      ...prev,
      specificationValues: { ...prev.specificationValues, [id]: value },
      productSpecificationsDict: { ...prev.productSpecificationsDict, [id]: value },
    }));
  }, []);

  const handleSelectDeleteProduct = useCallback((product_id) => {
    setState(prev => ({ ...prev, deleteProductId: product_id, isDeleteProductModalOpen: true }));
  }, []);

  const handleDeleteProduct = useCallback(async (e) => {
    e.preventDefault();
    try {
      await axios.delete(`https://texnotech.store/products/${state.deleteProductId}`);
      setState(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== state.deleteProductId),
        filteredProducts: prev.filteredProducts.filter(p => p.id !== state.deleteProductId),
        isDeleteProductModalOpen: false,
      }));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }, [state.deleteProductId]);

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

  const handleSelectUpdateProductSpecifications = useCallback(async (product_id) => {
    try {
      const product = state.filteredProducts.find(p => p.id === product_id);
      const [specsRes, existingSpecsRes] = await Promise.all([
        axios.get(`https://texnotech.store/categories/values/${product.category_id}`),
        axios.get(`https://texnotech.store/p_specification/values/${product_id}`),
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
  }, [state.filteredProducts]);

  const handleUpdateStatusProduct = useCallback(async (product) => {
    const is_active = !product.is_active;
    try {
      await axios.put(`https://texnotech.store/products/${product.id}`, { is_active });
      setState(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === product.id ? { ...p, is_active } : p),
        filteredProducts: prev.filteredProducts.map(p => p.id === product.id ? { ...p, is_active } : p),
      }));
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  }, []);

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
      await axios.put(`https://texnotech.store/products/${state.updateProductId}`, payload);
      setState(prev => ({ ...prev, isUpdateProductModalOpen: false }));
      await handleSelectUpdateProductSpecifications(state.productId);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  }, [state, handleSelectUpdateProductSpecifications]);

  const handleAddBrand = useCallback(async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://texnotech.store/brands/add', { name: state.nameBrand });
      setState(prev => ({ ...prev, isBrandModalOpen: false }));
    } catch (error) {
      console.error('Error adding brand:', error);
    }
  }, [state.nameBrand]);

  const handleAddProduct = useCallback(async (e) => {
    e.preventDefault();
    let productPayload = {
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
    if (state.uploadedFile) {
      const formData = new FormData();
      formData.append("file", state.uploadedFile);
      try {
        const response = await fetch("https://texnotech.store/files", { method: "POST", body: formData });
        if (!response.ok) throw new Error("File upload failed");
        productPayload.image_link = await response.json();
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    try {
      const response = await axios.post('https://texnotech.store/products/add', productPayload);
      setState(prev => ({
        ...prev,
        addedProductId: response.data.id,
        isModalOpen: false,
        uploadedFile: null,
        isNextModalIsOpen: true,
      }));
      await handleCategorySpecifications();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  }, [state, handleCategorySpecifications]);

  const handleCategoryChange = useCallback((e) => setState(prev => ({ ...prev, productCategoryId: e.target.value })), []);
  const handleBrandChange = useCallback((e) => setState(prev => ({ ...prev, productBrandId: e.target.value })), []);

  return (
    <>
      <motion.div
        className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <StatCard name='Ümumi Məhsul Sayı' icon={Package} value={stats.totalNumProducts} color='#6366F1' />
        <StatCard name='Yeni Məhsullar Sayı' icon={TrendingUp} value={stats.newNumProducts} color='#10B981' />
        <StatCard name='Super Məhsullar Sayı' icon={AlertTriangle} value={stats.superNumProducts} color='#F59E0B' />
        <StatCard name='Ümumi Qiymət' icon={DollarSign} value={stats.priceTotalProducts} color='#EF4444' />
      </motion.div>

      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center mb-6" style={{ gap: '2%' }}>
          <h2 className="text-xl font-semibold text-gray-100">Məhsulların siyahısı</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Məhsulları axtar..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleSearch}
              value={state.searchTerm}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button
            onClick={handleAddProductClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
          >
            <Plus size={18} /> Məhsul əlavə et
          </button>
          <button
            onClick={handleAddBrandClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
          >
            <Plus size={18} /> Brend əlavə et
          </button>
          <button
            onClick={handleRefreshProducts}
            className="hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
          >
            <RefreshCcw size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kateqoriya</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Qiymət</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kəmiyyət</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Satış</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fəaliyyətlər</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {state.filteredProducts.map(product => (
                <ProductRow
                  key={product.id}
                  product={product}
                  categories={state.categories}
                  handleSelectUpdateProduct={handleSelectUpdateProduct}
                  handleUpdateStatusProduct={handleUpdateStatusProduct}
                />
              ))}
            </tbody>
          </table>
        </div>

        {state.isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setState(prev => ({ ...prev, isModalOpen: false }))}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto absolute top-4"
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Məhsul əlavə et</h2>
              <form onSubmit={handleAddProduct}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Məhsulun adı</label>
                    <input
                      type="text"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={state.productName}
                      onChange={e => setState(prev => ({ ...prev, productName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Kateqoriya</label>
                    <select
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={state.productCategoryId}
                      onChange={handleCategoryChange}
                      required
                    >
                      <option value="">Select</option>
                      {state.categories.filter(c => c.id > 17).map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Brend</label>
                    <select
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={state.productBrandId}
                      onChange={handleBrandChange}
                      required
                    >
                      <option value="">Select</option>
                      {state.brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                    <input
                      type="text"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={state.productModel}
                      onChange={e => setState(prev => ({ ...prev, productModel: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Qiymət</label>
                    <input
                      type="number"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={state.productPrice}
                      onChange={e => setState(prev => ({ ...prev, productPrice: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Endirimli Qiymət</label>
                    <input
                      type="number"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={state.productDiscount}
                      onChange={e => setState(prev => ({ ...prev, productDiscount: e.target.value }))}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Kəmiyyət</label>
                    <input
                      type="number"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={state.productStock}
                      onChange={e => setState(prev => ({ ...prev, productStock: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Açar sözlər</label>
                    <input
                      type="text"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={state.productKeywords}
                      onChange={e => setState(prev => ({ ...prev, productKeywords: e.target.value }))}
                    />
                  </div>
                  <div className="mb-4 col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Məhsul şəklini yüklə</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      onChange={handleFileChangex}
                    />
                    {state.uploadedFile && (
                      <div className="mt-4 flex items-center space-x-2">
                        <img src={URL.createObjectURL(state.uploadedFile)} alt={state.uploadedFile.name} className="w-16 h-16 object-cover rounded-lg" />
                        <span className="text-white text-sm">{state.uploadedFile.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={state.isSuperOffer}
                      onChange={() => setState(prev => ({ ...prev, isSuperOffer: !prev.isSuperOffer }))}
                      className="text-indigo-600"
                    />
                    <span className="ml-2 text-sm text-gray-300">Super Təklif</span>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                      onClick={() => setState(prev => ({ ...prev, isModalOpen: false }))}
                    >
                      Bağla
                    </button>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded">
                      Növbəti
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {state.isNextModalIsOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setState(prev => ({ ...prev, isNextModalIsOpen: false }))}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Spesifikasiyaları doldur</h2>
              <form onSubmit={handleAddProductSpecifications}>
                <div className="grid grid-cols-2 gap-4">
                  {state.productSpecifications.map((spec, index) => (
                    <div className="mb-4" key={index}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{spec.name}</label>
                      <input
                        type="text"
                        className="bg-gray-700 text-white rounded-lg p-2 w-full"
                        value={state.productSpecificationsDict[spec.id] || ""}
                        onChange={e => handleProductSpecificationInput(e.target.value, spec.id)}
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
                      onChange={handleFileChange}
                    />
                    <div className="mt-4 space-y-2">
                      {state.uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="w-12 h-12 object-cover rounded-lg" />
                          <div>
                            <span className="text-sm text-gray-300">{file.name}</span>
                            {state.uploadStatus[file.name] && (
                              <p className={`text-sm ${state.uploadStatus[file.name].success ? "text-green-500" : "text-red-500"}`}>
                                {state.uploadStatus[file.name].message}
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
                      onClick={() => setState(prev => ({ ...prev, isNextModalIsOpen: false }))}
                    >
                      Bağla
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                      onClick={uploadFiles}
                    >
                      Bitir
                    </button>
                  </div>
                </div>
              </form>
              {state.isUploadComplete && (
                <div className="mt-4 text-green-500 text-sm">Bütün şəkillər uğurla yükləndi!</div>
              )}
            </motion.div>
          </motion.div>
        )}

        {state.isDeleteProductModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setState(prev => ({ ...prev, isDeleteProductModalOpen: false }))}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-100 mb-4" style={{ textAlign: "center" }}>Silinməni təsdiqləyin</h2>
              <form onSubmit={handleDeleteProduct}>
                <div className="grid grid-cols-2 gap-4" style={{ justifyContent: "center", display: "flex" }}>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                      onClick={() => setState(prev => ({ ...prev, isDeleteProductModalOpen: false }))}
                    >
                      Bağla
                    </button>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded">
                      Təsdiqlə
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {state.isSuccessModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setState(prev => ({ ...prev, isSuccessModalOpen: false }))}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Məhsul əlavə edilib</h2>
              <p className="text-gray-300 mb-4">Məhsul və onun spesifikasiyası uğurla əlavə edildi.</p>
              <div className="flex justify-end">
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                  onClick={() => setState(prev => ({ ...prev, isSuccessModalOpen: false }))}
                >
                  Bağla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {state.isUpdateProductModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setState(prev => ({ ...prev, isUpdateProductModalOpen: false }))}
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
                    { label: "Məhsulun adı", type: "text", value: state.productName, onChange: v => setState(prev => ({ ...prev, productName: v })) },
                    { label: "Model", type: "text", value: state.productModel, onChange: v => setState(prev => ({ ...prev, productModel: v })) },
                    { label: "Qiymət", type: "number", value: state.productPrice, onChange: v => setState(prev => ({ ...prev, productPrice: v })) },
                    { label: "Endirim", type: "number", value: state.productDiscount, onChange: v => setState(prev => ({ ...prev, productDiscount: v })) },
                    { label: "Kəmiyyət", type: "number", value: state.productStock, onChange: v => setState(prev => ({ ...prev, productStock: v })) },
                    { label: "Açar sözlər", type: "text", value: state.productKeywords, onChange: v => setState(prev => ({ ...prev, productKeywords: v })) },
                    { label: "Id", type: "number", value: state.productId, onChange: v => setState(prev => ({ ...prev, productId: v })) },
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
                    { label: "Kateqoriya", value: state.productCategoryId, onChange: handleCategoryChange, options: state.categories },
                    { label: "Brend", value: state.productBrandId, onChange: handleBrandChange, options: state.brands },
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
                      checked={state.isSuperOffer}
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
                    {state.productImageLink && (
                      <img
                        src={state.productImageLink}
                        alt="Product Preview"
                        className="w-20 h-20 rounded-lg object-cover cursor-pointer"
                        onClick={() => setState(prev => ({ ...prev, mainImageZoomed: state.productImageLink, extraImageZoomed: null, isImageModalOpen: true }))}
                      />
                    )}
                    <input
                      type="file"
                      className="bg-gray-700 text-white rounded-lg p-2 w-30"
                      style={{ width: "100%" }}
                      onChange={e => uploadMainImage(e.target.files[0], state.productId)}
                    />
                  </div>
                </div>
                <h1 className="block text-sm font-medium text-gray-300 mb-2">Əlavə məhsul şəkilləri</h1>
                <div className="mb-4">
                  <div className="mt-4 flex flex-wrap gap-6">
                    {state.extraImages.filter(image => image.product_id === state.productId).length === 0 && (
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          className="bg-gray-700 text-white rounded-lg p-1 w-25"
                          onChange={e => uploadAndAddImage(e.target.files[0], state.productId)}
                        />
                      </div>
                    )}
                    {state.extraImages.filter(image => image.product_id === state.productId).map((image, index) => (
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
                        onChange={e => uploadAndAddImage(e.target.files[0], state.productId)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                    onClick={() => setState(prev => ({ ...prev, isUpdateProductModalOpen: false }))}
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
        )}

        {state.isImageModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setState(prev => ({ ...prev, isImageModalOpen: false }))}
          >
            <motion.img
              src={state.mainImageZoomed || state.extraImageZoomed}
              alt="Zoomed Image"
              className="max-w-full max-h-full rounded-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}

        {state.isBrandModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setState(prev => ({ ...prev, isBrandModalOpen: false }))}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Brend əlavə et</h2>
              <form onSubmit={handleAddBrand}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Brendin adı</label>
                    <input
                      type="text"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={state.nameBrand}
                      onChange={e => setState(prev => ({ ...prev, nameBrand: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                      onClick={() => setState(prev => ({ ...prev, isBrandModalOpen: false }))}
                      style={{ width: "100%" }}
                    >
                      Bağla
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                      style={{ width: "100%" }}
                    >
                      Bitir
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {state.isUpdateProductSpecificationsModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setState(prev => ({ ...prev, isUpdateProductSpecificationsModalOpen: false }))}
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
                  {state.productSpecifications.map((spec, index) => (
                    <div className="mb-4" key={index}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{spec.name}</label>
                      <input
                        type="text"
                        className="bg-gray-700 text-white rounded-lg p-2 w-full"
                        value={state.productSpecificationsDict[spec.id] || ""}
                        onChange={e => handleProductSpecificationInput(e.target.value, spec.id)}
                      />
                    </div>
                  ))}
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                      onClick={() => setState(prev => ({ ...prev, isUpdateProductSpecificationsModalOpen: false }))}
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
        )}
      </motion.div>
    </>
  );
};

export default ProductsTable;