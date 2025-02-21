import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Eye, X } from "lucide-react";

const OrdersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productDetails, setProductDetails] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("https://texnotech.store/orders");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!selectedOrder || !selectedOrder.order_items) return;
      const details = {};
      await Promise.all(
        selectedOrder.order_items.map(async (item) => {
          try {
            const response = await fetch(`https://texnotech.store/products/${item.product_id}`);
            if (!response.ok) throw new Error(`Failed to fetch product ${item.product_id}`);
            const productData = await response.json();
            details[item.product_id] = productData;
          } catch (error) {
            console.error(`Error fetching product ${item.product_id}:`, error);
            details[item.product_id] = { name: "Unknown Product", price: item.price_at_purchase };
          }
        })
      );
      setProductDetails(details);
    };
    fetchProductDetails();
  }, [selectedOrder]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = orders.filter(
      (order) =>
        order.id.toString().includes(term) ||
        `${order.name} ${order.surname}`.toLowerCase().includes(term)
    );
    setFilteredOrders(filtered);
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
    setProductDetails({});
  };

  const markAsPaid = async (orderId) => {
    try {
      const response = await fetch(`https://texnotech.store/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payment_status: "paid" }),
      });
      if (!response.ok) throw new Error("Failed to update payment status");
      const updatedOrder = await response.json();
      setSelectedOrder(updatedOrder);
      setOrders(orders.map((order) => (order.id === orderId ? updatedOrder : order)));
      setFilteredOrders(
        filteredOrders.map((order) => (order.id === orderId ? updatedOrder : order))
      );
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to mark as paid. Please try again.");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
	try {
	  const response = await fetch(`https://texnotech.store/orders/${orderId}/status`, {
		method: "PATCH",
		headers: {
		  "Content-Type": "application/json",
		},
		body: JSON.stringify({ status: newStatus }),
	  });
	  if (!response.ok) throw new Error("Failed to update order status");
	  const updatedOrder = await response.json();
	  setSelectedOrder(updatedOrder);
	  setOrders(orders.map((order) => (order.id === orderId ? updatedOrder : order)));
	  setFilteredOrders(
		filteredOrders.map((order) => (order.id === orderId ? updatedOrder : order))
	  );
	} catch (error) {
	  console.error("Error updating order status:", error);
	  alert("Failed to update status. Please try again.");
	}
  };

  const statusOptions = ["pending", "processing", "shipped", "delivered", "canceled"];
  
  return (
    <>
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Order List</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide divide-gray-700">
              {filteredOrders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                    {order.name} {order.surname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                    ${order.total_price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
					<span
						className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
						order.status === "delivered"
							? "bg-green-100 text-green-800"
							: order.status === "processing"
							? "bg-yellow-100 text-yellow-800"
							: order.status === "shipped"
							? "bg-blue-100 text-blue-800"
							: order.status === "pending"
							? "bg-gray-100 text-gray-800"
							: order.status === "canceled"
							? "bg-red-100 text-red-800"
							: "bg-gray-100 text-gray-800" // Default case
						}`}
					>
						{order.status}
					</span>
					</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.payment_status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.created_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button
                      onClick={() => openModal(order)}
                      className="text-indigo-400 hover:text-indigo-300 mr-2"
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {isModalOpen && selectedOrder && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-700"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Order #{selectedOrder.id}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Order Details */}
            <div className="space-y-4 text-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <p>
                  <span className="font-semibold text-indigo-300">Customer:</span>
                  <br />
                  {selectedOrder.name} {selectedOrder.surname}
                </p>
                <p>
                  <span className="font-semibold text-indigo-300">Phone:</span>
                  <br />
                  {selectedOrder.phone_number}
                </p>
                <p>
                  <span className="font-semibold text-indigo-300">Total:</span>
                  <br />
                  <span className="text-green-400">${selectedOrder.total_price}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>
                    <span className="font-semibold text-indigo-300">Status:</span>
                    <br />
                    <span
						className={`px-2 py-1 rounded-full text-xs font-medium ${
							selectedOrder.status === "delivered"
							? "bg-green-500/20 text-green-300"
							: selectedOrder.status === "processing"
							? "bg-yellow-500/20 text-yellow-300"
							: selectedOrder.status === "shipped"
							? "bg-blue-500/20 text-blue-300"
							: selectedOrder.status === "pending"
							? "bg-gray-500/20 text-gray-300"
							: selectedOrder.status === "canceled"
							? "bg-red-500/20 text-red-300"
							: "bg-gray-500/20 text-gray-300" // Default case
						}`}
					>
					{selectedOrder.status}
					</span>
                  </span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className="ml-2 bg-gray-700 text-white text-xs font-medium py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </p>
                <p className="flex items-center justify-between">
                  <span>
                    <span className="font-semibold text-indigo-300">Payment:</span>
                    <br />
                    <span
                      className={`${
                        selectedOrder.payment_status === "unpaid"
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {selectedOrder.payment_status} ({selectedOrder.payment_method})
                    </span>
                  </span>
                  {selectedOrder.payment_status === "unpaid" && (
                    <button
                      onClick={() => markAsPaid(selectedOrder.id)}
                      className="ml-2 bg-green-600 text-white text-xs font-medium py-1 px-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Mark as Paid
                    </button>
                  )}
                </p>
                <p>
                  <span className="font-semibold text-indigo-300">Date:</span>
                  <br />
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>

              {/* Ordered Products */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-indigo-300 mb-3">
                  Ordered Products
                </h4>
                <div className="space-y-4 max-h-40 overflow-y-auto pr-2">
                  {selectedOrder.order_items.map((item) => {
                    const product = productDetails[item.product_id] || {};
                    return (
                      <div
                        key={item.id}
                        className="flex items-center bg-gray-700/50 p-3 rounded-lg"
                      >
                        {product.image_link && (
                          <img
                            src={product.image_link}
                            alt={product.name || "Product"}
                            className="w-12 h-12 object-cover rounded-md mr-3"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-100">
                            {product.name || "Loading..."}
                          </p>
                          <p className="text-xs text-gray-400">
                            Qty: {item.quantity} | Unit Price: $
                            {product.price || item.price_at_purchase}
                          </p>
                        </div>
                        <p className="text-sm text-green-400">
                          ${(product.price || item.price_at_purchase) * item.quantity}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              Close Details
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default OrdersTable;