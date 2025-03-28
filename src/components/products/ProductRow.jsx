import React from 'react';
import { motion } from 'framer-motion';
import { Edit } from 'lucide-react';
import { ToggleLeft, ToggleRight } from 'phosphor-react';

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

export default ProductRow;
