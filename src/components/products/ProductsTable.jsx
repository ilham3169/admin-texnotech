import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';


const ProductsTable = () => {
  const modalRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [productName, setProductName] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [productBrandId, setProductBrandId] = useState('');
  const [productModel, setProductModel] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDiscount, setProductDiscount] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productKeywords, setProductKeywords] = useState('');
  const [isSuperOffer, setIsSuperOffer] = useState(false);

  const [productSpecifications, setProductSpecifications] = useState([]);
  const [isNextModalIsOpen, setIsNextModalIsOpen] = useState(false);

  const [specificationValues, setSpecificationValues] = useState({});
  const [debounceTimers, setDebounceTimers] = useState({});

  const [productSpecificationsDict, setProductSpecificationsDict] = useState({});

  const [addedProductId, setAddedProductId] = useState(null)

  useEffect(() => {
    axios
      .get('https://back-texnotech.onrender.com/categories')
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });

    axios
      .get('https://back-texnotech.onrender.com/brands')
      .then((response) => {
        setBrands(response.data);
      })
      .catch((error) => {
        console.error('Error fetching brands:', error);
      });

    fetch('https://back-texnotech.onrender.com/products')
      .then((response) => response.json())
      .then((data) => {

        setFilteredProducts(data);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
    });  

  }, []);

  

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
        }
      }
    });   
    setIsNextModalIsOpen(false);
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

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const productPayload = {
      name: productName,
      category_id: parseInt(productCategoryId),
      num_product: parseInt(productStock),
      image_link: 'createdfrompanel',
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
      const response = await axios.post(
        'https://back-texnotech.onrender.com/products/add',
        productPayload
      );
      setAddedProductId(response.data.id)

      setIsModalOpen(false);
      handleCategorySpecifications();
      setIsNextModalIsOpen(true);
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

  return (
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
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Product
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
                  {product.category_id}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {product.num_product}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {product.sales}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button className="text-indigo-400 hover:text-indigo-300 mr-2">
                    <Edit size={18} />
                  </button>
                  <button className="text-red-400 hover:text-red-300">
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
                    {categories.map((category) => (
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
                    >
                      Finish
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProductsTable;