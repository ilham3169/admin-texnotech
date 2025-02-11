import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Plus, Edit, Trash2, AlertTriangle, DollarSign, Package, TrendingUp, RefreshCcw } from 'lucide-react';
import StatCard from "../common/StatCard";


const ProductsTable = () => {
  const modalRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  let totalNumProducts = 0
  let newNumProducts = 0
  let superNumProducts = 0
  let priceTotalProducts = 0
  
  const [deleteProductId, setDeleteProductId] = useState(null)
  const [updateProductId, setUpdateProductId] = useState(null)

  const [productName, setProductName] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [productBrandId, setProductBrandId] = useState('');
  const [productModel, setProductModel] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDiscount, setProductDiscount] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productKeywords, setProductKeywords] = useState('');
  const [productImageLink, setProductImageLink] = useState('')
  const [isSuperOffer, setIsSuperOffer] = useState(false);
  const [productId, setProductId] = useState('');

  const [productSpecifications, setProductSpecifications] = useState([]);

  const [isNextModalIsOpen, setIsNextModalIsOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [isUpdateProductModalOpen, setIsUpdateProductModalOpen] = useState(false)

  const [specificationValues, setSpecificationValues] = useState({});
  const [debounceTimers, setDebounceTimers] = useState({});

  const [productSpecificationsDict, setProductSpecificationsDict] = useState({});

  const [addedProductId, setAddedProductId] = useState(null)

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({});
  const [isUploadComplete, setIsUploadComplete] = useState(false); 

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);


  const [uploadedFile, setUploadedFile] = useState(null);

  const [extraImages, setExtraImages] = useState([]);

  const [zoomedImage, setZoomedImage] = useState(null);

  const [mainImageZoomed, setMainImageZoomed] = useState(null);
  const [extraImageZoomed, setExtraImageZoomed] = useState(null);


  
  const uploadMainImage = async (file, productId) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadResponse = await fetch("https://back-texnotech.onrender.com/files", {
        method: "POST",
        body: formData,
      });
  
      if (!uploadResponse.ok) {
        throw new Error("Image upload failed.");
      }
  
      const uploadResult = await uploadResponse.json();
      const imageLink = uploadResult
    
      const imagePayload = {
        image_link: imageLink,
      };
  
      const dbResponse = await fetch(`http://127.0.0.1:8000/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(imagePayload),
      });
  
      if (!dbResponse.ok) {
        throw new Error("Failed to add image to the database.");
      }
  
      const dbResult = await dbResponse.json();
      console.log("Image added to database:", dbResult);
  
    } catch (error) {
      console.error("Error in uploading and adding image:", error);
    }

  }


  const uploadAndAddImage = async (file, productId) => {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const uploadResponse = await fetch("https://back-texnotech.onrender.com/files", {
        method: "POST",
        body: formData,
      });
  
      if (!uploadResponse.ok) {
        throw new Error("Image upload failed.");
      }
  
      const uploadResult = await uploadResponse.json();
      const imageLinkAdditional = uploadResult // Assuming the response contains the image link
  
      console.log(`Image uploaded successfully: ${imageLinkAdditional}`);
  
      // Step 2: Add image to the database with product_id
      const imagePayload = {
        image_link: imageLinkAdditional,
        product_id: productId,
      };
  
      const dbResponse = await fetch("https://back-texnotech.onrender.com/images/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(imagePayload),
      });
  
      if (!dbResponse.ok) {
        throw new Error("Failed to add image to the database.");
      }
  
      const dbResult = await dbResponse.json();
      console.log("Image added to database:", dbResult);
  
    } catch (error) {
      console.error("Error in uploading and adding image:", error);
    }
  };


  useEffect(() => {

    fetch(`https://back-texnotech.onrender.com/images`)
      .then((response) => response.json())
      .then((data) => setExtraImages(data)) 
      .catch((error) => console.error("Error fetching images:", error));
  }, []);

  
  
  const handleDeleteExtraImage = async (id) => {
    try {
      const response = await fetch(`https://back-texnotech.onrender.com/images/${id}`, {
        method: 'DELETE',  
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_id: id}), 
      });
  
      if (response.ok) {
        setExtraImages((prevImages) =>
          prevImages.filter((image) => image.id !== id)
        );
      } else {
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };
  

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImageLink(reader.result); // Update the image preview
      };
      reader.readAsDataURL(file);
    }
  };


  const handleFileChangex = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const clearInputFields = () => {
    setProductName('');
    setProductCategoryId('');
    setProductBrandId('');
    setProductModel('');
    setProductPrice('');
    setProductDiscount('');
    setProductStock('');
    setProductKeywords('');
    setProductImageLink('');
    setIsSuperOffer(false);
    setProductSpecificationsDict({});
    setUploadedFiles([]);
    setUploadStatus({});
    setIsUploadComplete(false);
    setProductId('');
  };

  const handleAddProductClick = () => {
    clearInputFields();
    setIsModalOpen(true);
  };




  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const filesArray = Array.from(files);
      setUploadedFiles((prevFiles) => [...prevFiles, ...filesArray]);
    }
  };


  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) {
      alert("No files to upload.");
      return;
    }

    setUploadStatus({});
    setIsUploadComplete(false); 


    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("https://back-texnotech.onrender.com/files", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const result = await response.json();
        console.log(`Upload successful for ${file.name}:`, result);

        // -- //

        const imagePayload = {
          image_link: result, 
          product_id: addedProductId, 
        };


        const dbResponse = await fetch("https://back-texnotech.onrender.com/images/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(imagePayload),
        });

        if (!dbResponse.ok) {
          throw new Error(`Failed to add image to database for ${file.name}`);
        }

        const dbResult = await dbResponse.json();
        console.log(`Image added to database for ${file.name}:`, dbResult);

        setUploadStatus((prevStatus) => ({
          ...prevStatus,
          [file.name]: { success: true, message: "Upload and database update successful" },
        }));
        

      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);

        setUploadStatus((prevStatus) => ({
          ...prevStatus,
          [file.name]: { success: false, message: error.message },
        }));
      }
    }

    setIsUploadComplete(true); 

  };



  useEffect(() => {
    axios
      .get('https://back-texnotech.onrender.com/categories')
      .then((response) => {
        setCategories(response.data.sort(
          (obj1, obj2) => obj1.name.localeCompare(obj2.name)));
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });

    axios
      .get('https://back-texnotech.onrender.com/brands')
      .then((response) => {
        setBrands(response.data.sort(
          (obj1, obj2) => obj1.name.localeCompare(obj2.name)));
      })
      .catch((error) => {
        console.error('Error fetching brands:', error);
      });

    handleProductsFetch()

  }, []);
  

  const handleProductsFetch = () => {
    fetch('https://back-texnotech.onrender.com/products')
    .then((response) => response.json())
    .then((data) => {
      setFilteredProducts(data);
    })
    .catch((error) => {
      console.error('Error fetching categories:', error);
    });  
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  };

  const handleCategorySpecifications = async () => {
    axios
      .get('https://back-texnotech.onrender.com/categories/values/' + productCategoryId)
      .then((response) => {
        setProductSpecifications(response.data);
        let newDict = {};
        response.data.forEach(item => {
          newDict[item.id] = "";
        });
        setProductSpecificationsDict(newDict);
        })
        .catch((error) => {
          console.error('Error fetching brands:', error);
        });
    };

  const handleAddProductSpecifications = async (e) => {
    e.preventDefault();

    const entries = Object.entries(productSpecificationsDict);
    let hasError = false;


    entries.forEach(async item  => {
      if (item[1].length > 0) {
        const productPayload = {
          product_id: addedProductId,
          specification_id: item[0],
          value: item[1],
        };
  
        try {
          const response = await axios.post(
            'https://back-texnotech.onrender.com/p_specification',
            productPayload
          );
    
        } catch (error) {
          console.error('Error adding product:', error);
          hasError = true;
        }
      }
    });   
    
    if (!hasError) {
      setIsNextModalIsOpen(false);
      setIsSuccessModalOpen(true);
    }

  };

  const handleProductSpecificationInput = (value, id) => {
    if (debounceTimers[id]) {
      clearTimeout(debounceTimers[id]);
    }

    const timer = setTimeout(() => {
      setSpecificationValues((prevValues) => ({
        ...prevValues,
        [id]: value,
      }));
      productSpecificationsDict[id] = value;
    }, 500);


    setDebounceTimers((prevTimers) => ({
      ...prevTimers,
      [id]: timer,
    }));

  };

  const handleSelectDeleteProduct = async (product_id) => {
    setDeleteProductId(product_id)
    setIsDeleteProductModalOpen(true)
  }

  const handleDeleteProduct = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.delete(
        `https://back-texnotech.onrender.com/products/${deleteProductId}`,
        {
          headers: {
            'Content-Type': 'application/json', 
          },
        }
      );
      setIsDeleteProductModalOpen(false)

    } catch (error) {
      console.error('Error adding product:', error);
    }
  }

  const handleSelectUpdateProduct = async (product) => {
    setUpdateProductId(product.id)
    setIsUpdateProductModalOpen(true)

    setProductName(product.name)
    setProductCategoryId(product.category_id)
    setProductStock(product.num_product)
    setProductImageLink(product.image_link)
    setProductBrandId(product.brend_id)
    setProductModel(product.model_name)
    setProductDiscount(product.discount)
    setProductKeywords(product.search_string)
    setIsSuperOffer(product.is_super)
    setProductPrice(product.price)
    setProductId(product.id)
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    const productPayload = {
      name: productName,
      id: parseInt(productId),
      category_id: parseInt(productCategoryId),
      num_product: parseInt(productStock),
      image_link: productImageLink,
      brend_id: parseInt(productBrandId),
      model_name: productModel,
      discount: parseInt(productDiscount),
      search_string: productKeywords,
      author_id: 1,
      is_super: isSuperOffer,
      is_new: true,
      price: parseInt(productPrice)
    };

    try {
      const response = await axios.put(
        'https://back-texnotech.onrender.com/products/' + updateProductId,
        productPayload
      );

      setIsUpdateProductModalOpen(false)
    } catch (error) {
      console.error('Error updating product:', error);
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const productPayload = {
      name: productName,
      category_id: parseInt(productCategoryId),
      num_product: parseInt(productStock),
      image_link: "createdfrompanel",
      brend_id: parseInt(productBrandId),
      model_name: productModel,
      discount: parseInt(productDiscount),
      search_string: productKeywords,
      author_id: 1, // Static for now
      is_super: isSuperOffer,
      is_new: true,
      price: parseInt(productPrice),
    };


    try {
      if (!uploadedFile) {
        console.log("No file uploaded.");
      } else {
        console.log("Uploaded File:", uploadedFile);
    
        const formData = new FormData();
        formData.append("file", uploadedFile); 
        formData.append("fileName", uploadedFile.name);
        formData.append("fileSize", uploadedFile.size);
    
        try {
          const response = await fetch("https://back-texnotech.onrender.com/files", {
            method: "POST",
            body: formData,
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
    
          const result = await response.json();
          productPayload.image_link = result;

          console.log("File uploaded successfully:", result);
        } catch (error) {
          console.log("Error uploading the file:", error);
        }
      }
    } catch (error) {
      console.log("Error printing the first photo:", error);
    }
      

    try {
      const response = await axios.post(
        'https://back-texnotech.onrender.com/products/add',
        productPayload
      );
      setAddedProductId(response.data.id)

      setIsModalOpen(false);
      handleCategorySpecifications();
      setIsNextModalIsOpen(true);

      setUploadedFile(null)
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleCategoryChange = (e) => {
    setProductCategoryId(e.target.value);
  };

  const handleBrandChange = (e) => {
    setProductBrandId(e.target.value);
  };

  if (filteredProducts) {

    filteredProducts.forEach((product) => {
      totalNumProducts += product.num_product
      priceTotalProducts += product.price
      if (product.is_new) {
        newNumProducts += 1
      }
      if (product.is_super) {
        superNumProducts += 1
      }
    })
  }



  return (
    
    <>
      <motion.div
        className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
					<StatCard name='Total Products' icon={Package} value={totalNumProducts} color='#6366F1' />
					<StatCard name='New Products' icon={TrendingUp} value={newNumProducts} color='#10B981' />
					<StatCard name='Super Products' icon={AlertTriangle} value={superNumProducts} color='#F59E0B' />
					<StatCard name='Total Price' icon={DollarSign} value={priceTotalProducts} color='#EF4444' />
				</motion.div>
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center mb-6" style={{ gap: '2%' }}>
          <h2 className="text-xl font-semibold text-gray-100">Product List</h2>

          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleSearch}
              value={searchTerm}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          <button
            onClick={() => handleAddProductClick()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Product
          </button>

          <button
            onClick={handleProductsFetch}
            className=" hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
          >
            <RefreshCcw size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {filteredProducts ? 
              filteredProducts.map((product) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center">
                    <img
                      src={product.image_link}
                      alt="Product img"
                      className="size-10 rounded-full"
                    />
                    {product.name}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {categories.find(category => category.id === product.category_id)?.name || 'Unknown'} ({product.category_id})
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {product.price.toFixed(2)} AZN
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {product.num_product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {product.sales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button className="text-indigo-400 hover:text-indigo-300 mr-2"
                      onClick={() => handleSelectUpdateProduct(product)}
                    >
                      <Edit size={18} />
                    </button>
                    <button className="text-red-400 hover:text-red-300"
                      onClick={() => handleSelectDeleteProduct(product.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              )) : <></>}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-100 mb-4">
                Add New Product
              </h2>
              <form onSubmit={handleAddProduct}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={productCategoryId}
                      onChange={handleCategoryChange}
                      required
                    >
                      <option value="">Select</option>
                      {categories.filter(
                        (category) =>
                          category.id > 17
                      ).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Brand
                    </label>
                    <select
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={productBrandId}
                      onChange={handleBrandChange}
                      required
                    >
                      <option value="">Select</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={productModel}
                      onChange={(e) => setProductModel(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Discount
                    </label>
                    <input
                      type="number"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={productDiscount}
                      onChange={(e) => setProductDiscount(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={productStock}
                      onChange={(e) => setProductStock(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Keywords
                    </label>
                    <input
                      type="text"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={productKeywords}
                      onChange={(e) => setProductKeywords(e.target.value)}
                    />
                  </div>

                  <div className="mb-4 col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Product Image
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      onChange={handleFileChangex}
                    />
                    
                    {uploadedFile && (
                      <div className="mt-4 flex items-center space-x-2">
                        <img
                          src={URL.createObjectURL(uploadedFile)}
                          alt={uploadedFile.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
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
                    <span className="ml-2 text-sm text-gray-300">Super Offer</span>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isNextModalIsOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNextModalIsOpen(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-100 mb-4">
                  Fill up specifications
                </h2>
                <form onSubmit={handleAddProductSpecifications}>
                  <div className="grid grid-cols-2 gap-4">
                    {productSpecifications.map((specification, index) => (
                      <div className="mb-4" key={index}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {specification.name}
                        </label>
                        <input
                          type="text"
                          className="bg-gray-700 text-white rounded-lg p-2 w-full"
                          onChange={(e) =>
                            handleProductSpecificationInput(e.target.value, specification.id)
                          }
                        />
                      </div>
                    ))}

                    <div className="mb-4 col-span-2">

                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Upload Product Images
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="bg-gray-700 text-white rounded-lg p-2 w-full"
                        onChange={handleFileChange}
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
                                    uploadStatus[file.name].success
                                      ? "text-green-500"
                                      : "text-red-500"
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
                        onClick={() => setIsNextModalIsOpen(false)}
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                        onClick={uploadFiles}
                      >
                        Finish
                      </button>
                    </div>
                  </div>
                </form>

                {isUploadComplete && (
                  <div className="mt-4 text-green-500 text-sm">
                    All photos have been uploaded successfully!
                  </div>
                )}


              </div>
            </motion.div>
          </motion.div>
        )}
        
        {isDeleteProductModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDeleteProductModalOpen(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              style={{maxWidth: "14%"}}
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-100 mb-4" style={{textAlign: "center"}}>
                  Confirm deletion
                </h2>
                <form onSubmit={handleDeleteProduct}>
                  <div className="grid grid-cols-2 gap-4">

                    <div className="flex gap-4">
                      <button
                        type="button"
                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                        onClick={() => setIsDeleteProductModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}


        {isSuccessModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSuccessModalOpen(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-100 mb-4">
                Product Has Been Added
              </h2>
              <p className="text-gray-300 mb-4">
                The product and its specifications have been successfully added.
              </p>
              <div className="flex justify-end">
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                  onClick={() => setIsSuccessModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isUpdateProductModalOpen && (

          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsUpdateProductModalOpen(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Update Product</h2>
              <form onSubmit={handleUpdateProduct}>
                <div className="grid grid-cols-2 gap-4">
                  {[ 
                    { label: "Product Name", type: "text", value: productName, onChange: setProductName },
                    { label: "Model", type: "text", value: productModel, onChange: setProductModel },
                    { label: "Price", type: "number", value: productPrice, onChange: setProductPrice },
                    { label: "Discount", type: "number", value: productDiscount, onChange: setProductDiscount },
                    { label: "Stock", type: "number", value: productStock, onChange: setProductStock },
                    { label: "Keywords", type: "text", value: productKeywords, onChange: setProductKeywords },
                    { label: "Id", type: "number", value: productId, onChange: setProductId }
                  ].map(({ label, type, value, onChange }) => (
                    <div key={label} className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
                      <input
                        type={type}
                        className="bg-gray-700 text-white rounded-lg p-2 w-full"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        required
                      />
                    </div>
                  ))}

                  {[ 
                    { label: "Category", value: productCategoryId, onChange: handleCategoryChange, options: categories },
                    { label: "Brand", value: productBrandId, onChange: handleBrandChange, options: brands }
                  ].map(({ label, value, onChange, options }) => (
                    <div key={label} className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
                      <select
                        className="bg-gray-700 text-white rounded-lg p-2 w-full"
                        value={value}
                        onChange={onChange}
                        required
                      >
                        <option value="">Select</option>
                        {options.map((option) => (
                          <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={isSuperOffer}
                      onChange={() => setIsSuperOffer(!isSuperOffer)}
                      className="text-indigo-600"
                    />
                    <span className="ml-2 text-sm text-gray-300">Super Offer</span>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-100 mb-4">Product Related Images</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Main Page Photo</label>
                    <div className="flex items-center gap-4 w-50">
                      
                      {productImageLink && (
                          <img 
                            src={productImageLink} 
                            alt="Product Preview" 
                            className="w-20 h-20 rounded-lg object-cover cursor-pointer" 
                            onClick={() => {
                              setMainImageZoomed(productImageLink);  // Set the main image
                              setExtraImageZoomed(null);  // Clear extra image selection
                              setIsImageModalOpen(true);  // Open modal
                            }}
                          />
                      )}

                      <input
                        type="file"
                        className="bg-gray-700 text-white rounded-lg p-2 w-30"
                        style={{width: "100%"}}
                        onChange={(event) => uploadMainImage(event.target.files[0], productId)}
                      />
                    </div>
                  </div>


                <h1 className="block text-sm font-medium text-gray-300 mb-2">Additional Product Images</h1>

                <div className="mb-4">
                  <div className="mt-4 flex flex-wrap gap-6">
                    {extraImages.filter(image => image.product_id === productId).length === 0 && (
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          className="bg-gray-700 text-white rounded-lg p-1 w-25"
                          onChange={(event) => uploadAndAddImage(event.target.files[0], productId)}
                        />
                      </div>
                    )}

                    {extraImages
                      .filter(image => image.product_id === productId)
                      .map((image, index) => (
                        <div className="flex items-center gap-2 w-50" key={index}>
                          <div className="w-20">
                            {/* Image preview */}
                            <img
                              src={image.image_link}
                              alt={`Extra Image ${index + 1}`}
                              className="h-20 rounded-lg object-cover cursor-pointer"
                              onClick={(event) => {
                                event.stopPropagation();
                                setExtraImageZoomed(image.image_link);  // Set clicked extra image
                                setMainImageZoomed(null);  // Clear main image selection
                                setIsImageModalOpen(true);  // Open modal
                              }}
                              />
                          </div>

                          <div className="flex items-center gap-4 w-30">
                            <input
                              type="file"
                              className="bg-gray-700 text-white rounded-lg p-1"
                              style={{width: "100%"}}
                              onChange={(event) => uploadAndAddImage(event.target.files[0], productId)}
                            />
                          </div>

                          <span
                            onClick={() => {
                              const isConfirmed = window.confirm("Are you sure you want to delete this image?");
                              if (isConfirmed) {
                                handleDeleteExtraImage(image.id);
                              }
                            }}
                            className="text-red-500 cursor-pointer"
                          >
                            &#10006;
                          </span>
                          
                        </div>


                      ))}
                  </div>
                </div>


                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                    onClick={() => setIsUpdateProductModalOpen(false)}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                  >
                    Update
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}        
      </motion.div>

      {isImageModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsImageModalOpen(false)}
        >
          <motion.img
            src={mainImageZoomed || extraImageZoomed}  // Use the image based on selection
            alt="Zoomed Image"
            className="max-w-full max-h-full rounded-lg"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking on image
          />
        </motion.div>
      )}
        


    </>
  );
};

export default ProductsTable;