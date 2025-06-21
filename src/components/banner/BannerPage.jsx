import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus, Upload, Save, X } from 'lucide-react';

const BannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    cover: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const API_BASE = 'https://back-texnotech.onrender.com';
//   http://127.0.0.1:8000/files


  // Fetch banners from backend
  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/api/banners`);
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      } else {
        throw new Error('Failed to fetch banners');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await fetch(`https://back-texnotech.onrender.com/files`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data; // Adjust based on your API response
        return imageUrl        
      }
      throw new Error('Upload failed');
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const saveBanner = async () => {
    try {
      let imageUrl = formData.cover;

      // Upload new image if selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      console.log(imageUrl)

      const bannerData = {
        ...formData,
        cover: imageUrl
      };

      const url = editingBanner 
        ? `${API_BASE}/api/banners/${editingBanner.id}`
        : `${API_BASE}/api/banners`;
      
      const method = editingBanner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
      });

      if (response.ok) {
        await fetchBanners();
        closeModal();
      }

      
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  // Delete banner
  const deleteBanner = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/banners/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBanners();
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  // Modal handlers
  const openModal = (banner = null) => {
    setEditingBanner(banner);
    setFormData(banner || { title: '', desc: '', cover: '' });
    setSelectedFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setFormData({ title: '', desc: '', cover: '' });
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, cover: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <motion.div
            className='mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className='text-3xl font-bold text-gray-100 mb-2'>Banner Management</h1>
            <p className='text-gray-400'>Manage your website banners and promotions</p>
          </motion.div>

          <motion.button
            className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
          >
            <Plus size={20} />
            Add New Banner
          </motion.button>
        </div>

        {/* Banners Grid */}
        {isLoading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {banners.map((banner) => (
              <motion.div
                key={banner.id}
                className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className='relative mb-4'>
                  <img
                    src={banner.cover}
                    alt={banner.title}
                    className='w-full h-48 object-cover rounded-lg'
                  />
                  <div className='absolute top-2 right-2 flex gap-2'>
                    <button
                      onClick={() => openModal(banner)}
                      className='bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition duration-200'
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className='bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition duration-200'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className='text-xl font-semibold text-gray-100 mb-2'>{banner.title}</h3>
                <p className='text-gray-400 text-sm line-clamp-3'>{banner.desc}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div 
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
            onClick={closeModal}
          >
            <motion.div
              className='bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-100'>
                  {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                </h2>
                <button
                  onClick={closeModal}
                  className='text-gray-400 hover:text-gray-200 transition duration-200'
                >
                  <X size={24} />
                </button>
              </div>

              <div className='space-y-4'>
                {/* Image Upload */}
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Banner Image
                  </label>
                  <div 
                    className='border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-500 transition duration-200'
                    onClick={triggerFileInput}
                  >
                    {formData.cover ? (
                      <div className='relative'>
                        <img
                          src={formData.cover}
                          alt='Preview'
                          className='w-full h-32 object-cover rounded-lg mx-auto'
                        />
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({ ...prev, cover: '' }));
                            setSelectedFile(null);
                          }}
                          className='absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition duration-200'
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className='py-4'>
                        <Upload className='mx-auto h-12 w-12 text-gray-400 mb-2' />
                        <p className='text-gray-400'>Click to upload image</p>
                      </div>
                    )}
                  </div>
                  <input
                    id='file-input'
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Title */}
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Title
                  </label>
                  <input
                    type='text'
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Enter banner title'
                  />
                </div>

                {/* Description */}
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Description
                  </label>
                  <textarea
                    value={formData.desc}
                    onChange={(e) => setFormData(prev => ({ ...prev, desc: e.target.value }))}
                    className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    rows='3'
                    placeholder='Enter banner description'
                  />
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3 pt-4'>
                  <button
                    onClick={saveBanner}
                    disabled={uploading || !formData.title}
                    className='flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2'
                  >
                    {uploading ? (
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    ) : (
                      <Save size={16} />
                    )}
                    {uploading ? 'Saving...' : 'Save Banner'}
                  </button>
                  <button
                    onClick={closeModal}
                    className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BannersPage;