import { useEffect, useState } from "react";
import { CheckCircle, Clock, DollarSign, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import DailyOrders from "../components/orders/DailyOrders";
import OrderDistribution from "../components/orders/OrderDistribution";
import OrdersTable from "../components/orders/OrdersTable";

const OrdersPage = () => {
	const [orders, setOrders] = useState([]);
	const [orderStats, setOrderStats] = useState({
		totalOrders: "0",
		pendingOrders: "0",
		completedOrders: "0",
		totalRevenue: "$0",
	});

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const response = await fetch("https://texnotech.store/orders");
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				const data = await response.json();
				setOrders(data);

				const totalOrders = data.length;
				const pendingOrders = data.filter(order => order.status === "pending").length;
				const completedOrders = data.filter(order => order.status === "completed").length;
				const totalRevenue = ` ${31}`;

				setOrderStats({
					totalOrders: totalOrders.toString(),
					pendingOrders: pendingOrders.toString(),
					completedOrders: completedOrders.toString(),
					totalRevenue: `$${totalRevenue.toLocaleString()}`,
				});
			} catch (error) {
				console.error("Error fetching orders:", error);
			}
		};

		fetchOrders();
	}, []);

	return (
		<div className='flex-1 relative z-10 overflow-auto'>
			<Header title="Sifarişlər" />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name='Ümumi Sifarişlər Sayı' icon={ShoppingBag} value={orderStats.totalOrders} color='#6366F1' />
					<StatCard name='Gözləyən Sifarişlərin Sayı' icon={Clock} value={orderStats.pendingOrders} color='#F59E0B' />
					<StatCard
						name='Tamamlanmış Sifarişlər Sayı'
						icon={CheckCircle}
						value={orderStats.completedOrders}
						color='#10B981'
					/>
					<StatCard name='Ümumi Gəlir' icon={DollarSign} value={orderStats.totalRevenue} color='#EF4444' />
				</motion.div>

				<OrdersTable orders={orders} />

			</main>
		</div>
	);
};

export default OrdersPage;