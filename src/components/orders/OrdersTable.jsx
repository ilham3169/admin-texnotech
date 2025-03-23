import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Eye, X, Trash2, RefreshCcw } from "lucide-react";

import axios from 'axios';


const OrdersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productDetails, setProductDetails] = useState({});

  const [deleteOrderId, setDeleteOrderId] = useState(null)
  const [isDeleteOrderModalOpen, setIsDeleteOrderModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await fetch("https://back-texnotech.onrender.com/orders");
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchProductDetails = async () => {
    if (!selectedOrder || !selectedOrder.order_items) return;
    const details = {};
    await Promise.all(
      selectedOrder.order_items.map(async (item) => {
        try {
          const response = await fetch(`https://back-texnotech.onrender.com/products/${item.product_id}`);
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

  useEffect(() => {
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
      const response = await fetch(`https://back-texnotech.onrender.com/orders/${orderId}/payment`, {
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
	  const response = await fetch(`https://back-texnotech.onrender.com/orders/${orderId}/status`, {
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

  const handleSelectDeleteOrder = async (order_id) => {
    setDeleteOrderId(order_id)
    setIsDeleteOrderModalOpen(true)
  }

  const handleDeleteOrder = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.delete(
        `https://back-texnotech.onrender.com/orders/${deleteOrderId}`,
        {
          headers: {
            'Content-Type': 'application/json', 
          },
        }
      );
      setIsDeleteOrderModalOpen(false)

    } catch (error) {
      console.error('Error deleting order:', error);
    }
  }

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
          <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <h2 className="text-xl font-semibold text-gray-100">Sifarişlərin siyahısı</h2>
            <button
              onClick={fetchOrders}
              className=" hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Sifarişləri axtar..."
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
                  Sifariş ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Müştəri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Cəmi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ödəniş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tarix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fəaliyyətlər
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
                    {order.total_price} AZN
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
                      {
                        order.status === "delivered"
                        ? "çatdırılmışdır"
                        : order.status === "processing"
                        ? "davam edir"
                        : order.status === "shipped"
                        ? "göndərildi"
                        : order.status === "pending"
                        ? "gözləyir"
                        : order.status === "canceled"
                        ? "ləğv edildi"
                        : "none"
                      }
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
                      {order.payment_status === "paid"
                        ? "ödənilmişdir"
                        : "ödənilməmişdir"}
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
                    <button className="text-red-400 hover:text-red-300"
                      onClick={() => handleSelectDeleteOrder(order.id)}
                    >
                      <Trash2 size={18} />
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
                Sifariş #{selectedOrder.id}
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
                  <span className="font-semibold text-indigo-300">Müştəri:</span>
                  <br />
                  {selectedOrder.name} {selectedOrder.surname}
                </p>
                <p>
                  <span className="font-semibold text-indigo-300">Telefon:</span>
                  <br />
                  {selectedOrder.phone_number}
                </p>
                <p>
                  <span className="font-semibold text-indigo-300">Cəmi:</span>
                  <br />
                  <span className="text-green-400">{selectedOrder.total_price} AZN</span>
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
                      {
                        selectedOrder.status === "delivered"
                        ? "çatdırılmışdır"
                        : selectedOrder.status === "processing"
                        ? "davam edir"
                        : selectedOrder.status === "shipped"
                        ? "göndərildi"
                        : selectedOrder.status === "pending"
                        ? "gözləyir"
                        : selectedOrder.status === "canceled"
                        ? "ləğv edildi"
                        : "none"
                      }
					          </span>
                  </span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className="ml-2 bg-gray-700 text-white text-xs font-medium py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {
                        status === "delivered"
                        ? "çatdırılmışdır"
                        : status === "processing"
                        ? "davam edir"
                        : status === "shipped"
                        ? "göndərildi"
                        : status === "pending"
                        ? "gözləyir"
                        : status === "canceled"
                        ? "ləğv edildi"
                        : "none"
                      }
                      </option>
                    ))}
                  </select>
                </p>
                <p className="flex items-center justify-between">
                  <span>
                    <span className="font-semibold text-indigo-300">Ödəniş:</span>
                    <br />
                    <span
                      className={`${
                        selectedOrder.payment_status === "unpaid"
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {selectedOrder.payment_status === "paid"
                        ? "ödənilmişdir"
                        : "ödənilməmişdir"}

                      {selectedOrder.payment_method === "cash"
                        ? " (nağd)"
                        : " (kart)"}  
                    </span>
                  </span>
                  {selectedOrder.payment_status === "unpaid" && (
                    <button
                      onClick={() => markAsPaid(selectedOrder.id)}
                      className="ml-2 bg-green-600 text-white text-xs font-medium py-1 px-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Ödənilib
                    </button>
                  )}
                </p>
                <p>
                  <span className="font-semibold text-indigo-300">Tarix:</span>
                  <br />
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>

              {/* Ordered Products */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-indigo-300 mb-3">
                  Sifarişin Məhsullar
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
                            Say: {item.quantity} | Vahid Qiymət: ₼ 
                            { product.price || item.price_at_purchase}
                          </p>
                        </div>
                        <p className="text-sm text-green-400">
                        ₼ { (product.price || item.price_at_purchase) * item.quantity}
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
              Bağla
            </button>
          </motion.div>
        </motion.div>
      )}

      {isDeleteOrderModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsDeleteOrderModalOpen(false)}
        >
          <motion.div
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>

              <h2 className="text-xl font-semibold text-gray-100 mb-4" style={{textAlign: "center"}}>
                Silinməni təsdiqləyin
              </h2>

              <form onSubmit={handleDeleteOrder}>
                <div className="grid grid-cols-2 gap-4" style={{justifyContent: "center", display: "flex"}}>

                  <div className="flex gap-4" >
                    <button
                      type="button"
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                      onClick={() => setIsDeleteOrderModalOpen(false)}
                    >
                      Bağla
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                    >
                      Təsdiqlə
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default OrdersTable;