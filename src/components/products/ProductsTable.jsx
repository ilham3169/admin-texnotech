import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Plus, RefreshCcw } from 'lucide-react';

import AddProductModal from "./modals/AddProductModal.jsx";
import AddCategoryModal from './modals/AddCategoryModal.jsx'; 
import AddSpecificationModal from './modals/AddSpecificationModal.jsx';
import AddBrandModal from './modals/AddBrandModal.jsx'; 
import AddProductSpecificationsModal from "./modals/AddProductSpecificationsModal.jsx";

import UpdateProductModal from "./modals/UpdateProductModal.jsx";
import UpdateProductSpecificationsModal from "./modals/UpdateProductSpecificationsModal.jsx";

import ProductTableContent from './ProductTableContent.jsx'
import ProductTableHeader from "./ProductTableHeader.jsx";


const ProductsTable = () => {

  const [state, setState] = useState({
    // Modals' status variables
    isAddProductModalOpen: false,
    isAddProductSpecificationsModalOpen: false,
    isAddCategoryModalOpen: false,
    isAddSpecificationModalOpen: false,
    isAddBrandModalOpen: false,

    searchTerm: "",

    products: [],
    filteredProducts: [],

    categories: [],

    brands: [],

    // Update product variables
    updateProductId: null,
    isUpdateProductModalOpen: false,
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

    extraImages: [],

    addedProductId: null,
    productSpecifications: [],
    productSpecificationsDict: {},
    isUpdateProductSpecificationsModalOpen: false,
    isAddProductSuccessModalOpen: false,

    uploadedFiles: [],
    uploadStatus: {},
    isUploadComplete: false,

    specificationValues: {},

  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, brandsRes, productsRes] = await Promise.all([
          axios.get('https://back-texnotech.onrender.com/categories'),
          axios.get('https://back-texnotech.onrender.com/brands'),
          axios.get('https://back-texnotech.onrender.com/products'),
        ]);
        setState(prev => ({
          ...prev,
          categories: categoriesRes.data.sort((a, b) => a.name.localeCompare(b.name)),
          brands: brandsRes.data.sort((a, b) => a.name.localeCompare(b.name)),
          products: productsRes.data,
          filteredProducts: productsRes.data,
        }));
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const filtered = state.products.filter(product =>
      product.name.toLowerCase().includes(state.searchTerm.toLowerCase())
    );
    setState(prev => ({ ...prev, filteredProducts: filtered }));
  }, [state.searchTerm, state.products]);


  // Handlers for Add Product Modal
  const handleOpenAddProductModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddProductModalOpen: true }));
  }, []);

  const handleCloseAddProductModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddProductModalOpen: false , isAddProductSpecificationsModalOpen: true}));
  }, []);

  const handleProductAdded = useCallback(async (newProduct) => {
    setState(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
      filteredProducts: [...prev.filteredProducts, newProduct],
      addedProductId: newProduct.id,
      productCategoryId: newProduct.category_id,
    }));

    await handleCategorySpecifications();
  }, []);

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

  // Handlers for Add Specification Modal
  const handleOpenAddSpecificationModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddSpecificationModalOpen: true }));
  }, []);

  const handleCloseAddSpecificationModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddSpecificationModalOpen: false }));
  }, []);

  // Handle for Add Brand Modal
  const handleOpenAddBrandModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddBrandModalOpen: true }));
  }, []);

  const handleCloseAddBrandModal = useCallback(() => {
    setState(prev => ({ ...prev, isAddBrandModalOpen: false }))
  }, [])
  
  const handleBrandAdded = useCallback((newBrand) => {
    setState(prev => ({
      ...prev,
      brands: [...prev.brands, newBrand].sort((a, b) => a.name.localeCompare(b.name)),
    }))
  }, [])

  const handleSelectUpdateProductSpecifications = useCallback(async (product_id) => {
    
    try {
      
      const product = state.filteredProducts.find(p => p.id === product_id);
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

  }, [state.filteredProducts]);

  // Handlers for Update Product Modal
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
  
  const   handleUpdateStatusProduct = useCallback(async (product) => {
    const is_active = !product.is_active;
    try {
      await axios.put(`https://back-texnotech.onrender.com/products/${product.id}`, { is_active });
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

      await axios.put(`https://back-texnotech.onrender.com/products/${state.updateProductId}`, payload);

      setState(prev => ({ ...prev, isUpdateProductModalOpen: false }));
      
      await handleSelectUpdateProductSpecifications(state.productId);

    } catch (error) {
      console.error('Error updating product:', error);
    }

  }, [state, handleSelectUpdateProductSpecifications]);

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

    } catch (error) {
      console.error("Error uploading main image:", error);
    }

  }, []);

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
      if (error.status == 404){
        console.error("Specification doesn't exist.")
      }
      else {
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
                value 
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
      }

    } catch (error) {
      console.error('Error fetching or updating specifications:', error);
      hasError = true;
    }

  }, [state.productSpecificationsDict, state.updateProductId, state.productCategoryId]);


  // Handlers for Add Category Modal
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


  // Placeholder handlers (replace with your logic
  const handleSearch = useCallback((e) => {
    const term = e.target.value;
    setState(prev => ({
      ...prev,
      searchTerm: term,
    }));
  }, []);

  const handleRefreshProducts = useCallback(async () => {
    try {

      await axios.delete('https://back-texnotech.onrender.com/others/cache/clear');
      const response = await axios.get('https://back-texnotech.onrender.com/products');
      setState(prev => ({ ...prev, products: response.data, filteredProducts: response.data, searchTerm: "" }));
    
    } catch (error) {
      console.error('Error refreshing products:', error);
    }

  }, []);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    setState(prev => ({ ...prev, uploadedFiles: [...prev.uploadedFiles, ...files] }));
  }, []);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >

      {/* Table Header */}
      <ProductTableHeader
        searchTerm={state.searchTerm}
        handleSearch={handleSearch}
        handleOpenAddProductModal={handleOpenAddProductModal}
        handleOpenBrandModal={handleOpenAddBrandModal}
        handleOpenAddCategoryModal={handleOpenAddCategoryModal}
        handleOpenAddSpecificationModal={handleOpenAddSpecificationModal}
        handleRefreshProducts={handleRefreshProducts}
      />

      {/* Add Modals */}
      <AddProductModal
        isOpen={state.isAddProductModalOpen}
        onClose={handleCloseAddProductModal}
        onProductAdded={handleProductAdded}
        categories={state.categories}
        brands={state.brands}
      />

      <AddProductSpecificationsModal
        isOpen={state.isAddProductSpecificationsModalOpen}
        onClose={() => setState((prev) => ({ ...prev, isAddProductSpecificationsModalOpen: false }))}
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

      <ProductTableContent
        products={state.filteredProducts}
        categories={state.categories}
        handleSelectUpdateProduct={handleSelectUpdateProduct}
        handleUpdateStatusProduct={handleUpdateStatusProduct}
      />

      {/* Update Modals */}
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