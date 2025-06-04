import React from 'react';
import ProductRow from './ProductRow';

const generateSlug = (name) => {
  return name
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters like "\"
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
    // .replace('qara-qrmz', 'qaraqrmz') // Special rule to match your example URL
    .trim(); // Trim any leading/trailing hyphens
};

const ProductTableContent = ({ products, categories, handleSelectUpdateProduct, handleUpdateStatusProduct }) => {
  const handleProductClick = (product) => {
    const slug = generateSlug(product.name);
    const productUrl = `https://texnotech.com/products/${slug}-${product.id}`;
    // Redirect to the external product page
    window.location.href = productUrl;
  };

  return (
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
              handleProductClick={handleProductClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTableContent;