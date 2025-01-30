import { motion } from "framer-motion";
import { Edit, Search, Trash2, Plus } from "lucide-react";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PRODUCT_DATA = [
  { id: 1, name: "Wireless Earbuds", category: "Electronics", price: 59.99, stock: 143, sales: 1200 },
  { id: 2, name: "Leather Wallet", category: "Accessories", price: 39.99, stock: 89, sales: 800 },
  { id: 3, name: "Smart Watch", category: "Electronics", price: 199.99, stock: 56, sales: 650 },
  { id: 4, name: "Yoga Mat", category: "Fitness", price: 29.99, stock: 210, sales: 950 },
  { id: 5, name: "Coffee Maker", category: "Home", price: 79.99, stock: 78, sales: 720 },
];

const ProductsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(PRODUCT_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    axios.get('https://back-texnotech.onrender.com/categories')
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });

	axios.get('https://back-texnotech.onrender.com/brands')
      .then((response) => {
        setBrands(response.data);
      })
      .catch((error) => {
        console.error("Error fetching brands:", error);
      });
	  

    if (isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isModalOpen]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = PRODUCT_DATA.filter(
      (product) => product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  };

  const handleAddProduct = () => {
    setIsModalOpen(false);
  };

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className='flex items-center mb-6' style={{gap: "2%"}}>
        <h2 className='text-xl font-semibold text-gray-100'>Product List</h2>

        <div className='relative'>
          <input
            type='text'
            placeholder='Search products...'
            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            onChange={handleSearch}
            value={searchTerm}
          />
          <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
        </div>

        <button 
          onClick={() => setIsModalOpen(true)} 
          className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2'
        >
          <Plus size={18} />
          Add Product
        </button>

       
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-700'>
          <thead>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Category
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Price
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Stock
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Sales
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>

          <tbody className='divide-y divide-gray-700'>
            {filteredProducts.map((product) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center'>
                  <img
                    src='https://images.unsplash.com/photo-1627989580309-bfaf3e58af6f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d2lyZWxlc3MlMjBlYXJidWRzfGVufDB8fDB8fHww'
                    alt='Product img'
                    className='size-10 rounded-full'
                  />
                  {product.name}
                </td>

                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                  {product.category}
                </td>

                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                  ${product.price.toFixed(2)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{product.stock}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{product.sales}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                  <button className='text-indigo-400 hover:text-indigo-300 mr-2'>
                    <Edit size={18} />
                  </button>
                  <button className='text-red-400 hover:text-red-300'>
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <motion.div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <div className='grid grid-cols-2 gap-4'>

                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>Produktun Adı</label>
                  <input
                    type='text'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Produktun adını yazın'
                  />
                </div>

                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>Kategoriyanın adı</label>
                  <select
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='' disabled selected>
                      Kategoriyanı seçin
                    </option>
                    {categories.sort((a, b) => a.name.localeCompare(b.name)).map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-300 mb-2'>Brendin adı</label>
					<select className='bg-gray-700 text-white placeholder-gray-400 rounded-lg w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' > 
						<option value='' disabled selected>
						Brendi seçin
						</option>

						{brands.sort((a, b) => a.name.localeCompare(b.name)).map((brand) => (
							<option key={brand.id} value={brand.name}>
								{brand.name}
							</option>
						))}
					</select>
				</div>

				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-300 mb-2'>Modelin adı</label>
					<input
						type='text'
						className='bg-gray-700 text-white placeholder-gray-400 rounded-lg w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						placeholder='Modelin adın yazın '
					/>
				</div>

				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-300 mb-2'>Qiymət</label>
					<input
						type='number'
						className='bg-gray-700 text-white placeholder-gray-400 rounded-lg w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						placeholder='Qiymət yazın'
					/>
				</div>
				
				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-300 mb-2'>Endirim (faiz)</label>
					<input
						type='text'
						className='bg-gray-700 text-white placeholder-gray-400 rounded-lg w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						placeholder='Endirim ( məs : 5 )'
					/>
				</div>

				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-300 mb-2'>Stok sayı</label>
					<input
						type='number'
						className='bg-gray-700 text-white placeholder-gray-400 rounded-lg w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						placeholder='Stok sayını yazın'
					/>
				</div>

				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-300 mb-2'>Axtarış açar sözü</label>
					<input
						type='text'
						className='bg-gray-700 text-white placeholder-gray-400 rounded-lg w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						placeholder='Axtarış üçün açar söz yazın'
					/>
				</div>

			</div>

					
			<div className="mb-4 flex items-center gap-2">
				<input
					type="checkbox"
					id="superOffer"
					className="w-5 h-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
				/>
				<label htmlFor="superOffer" className="text-sm font-medium text-gray-300">
					Süper Təklifdir?
				</label>
			</div>

                <div className='flex justify-end gap-2'>
                  <button
                    type='button'
                    onClick={() => setIsModalOpen(false)}
                    className='bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-200'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200'
                  >
                    Add Product
                  </button>
                </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProductsTable;
