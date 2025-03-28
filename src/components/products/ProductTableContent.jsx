import React from 'react';
import ProductRow from './ProductRow';


const ProductTableContent = ({ products, categories, handleSelectUpdateProduct, handleUpdateStatusProduct }) => (
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
        {products.map(product => (
          <ProductRow
            key={product.id}
            product={product}
            categories={categories}
            handleSelectUpdateProduct={handleSelectUpdateProduct}
            handleUpdateStatusProduct={handleUpdateStatusProduct}
          />
        ))}
      </tbody>
    </table>
  </div>
);

export default ProductTableContent;
