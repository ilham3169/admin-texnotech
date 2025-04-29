import { motion } from "framer-motion";
import { ShoppingBag, Eye, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";

const OverviewCards = () => {
  const [orderCount, setOrderCount] = useState("0");

  useEffect(() => {
    fetch("https://back-texnotech.onrender.com/orders/num-orders")
      .then((response) => response.json())
      .then((data) => {
		console.log(data)
        setOrderCount(data.toString()); 
      })
      .catch((error) => {
        console.error("Error fetching order count:", error);
        setOrderCount("N/A"); 
      });
  }, []);

  const overviewData = [
    { name: "Orders", value: orderCount, change: 0, icon: ShoppingBag, isOrders: true }, 
    { name: "Page Views", value: "1,234,567", change: 0, icon: Eye },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {overviewData.map((item, index) => (
        <motion.div
          key={item.name}
          className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400">{item.name}</h3>
              <p className="mt-1 text-xl font-semibold text-gray-100">{item.value}</p>
            </div>
            <div
              className={`p-3 rounded-full bg-opacity-20 ${
                item.isOrders ? "bg-green-500" : item.change >= 0 ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <item.icon
                className={`size-6 ${
                  item.isOrders ? "text-green-500" : item.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              />
            </div>
          </div>
          
        </motion.div>
      ))}
    </div>
  );
};

export default OverviewCards;