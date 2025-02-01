import { motion } from "framer-motion";

import Header from "../components/common/Header";

import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesTrendChart from "../components/products/SalesTrendChart";
import ProductsTable from "../components/products/ProductsTable";

const ProductsPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Products' />
			
			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>				

				<ProductsTable />

			</main>
		</div>
	);
};
export default ProductsPage;
