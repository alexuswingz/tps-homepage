'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import { RiPlantLine, RiLeafLine } from 'react-icons/ri';
import Link from 'next/link';

interface PlantIdentification {
  name: string;
  probability: number;
  details: {
    common_names: string[];
    scientific_name: string;
    family: string;
    genus: string;
    care_level: string;
    growth_info: {
      soil_ph?: string;
      light?: string;
      atmospheric_humidity?: string;
      soil_nutrient?: string;
    };
  };
  image_url: string;
}

interface RecommendedProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  link: string;
}

const NutrientsPage = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [identifiedPlant, setIdentifiedPlant] = useState<PlantIdentification | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const searchPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    setIsSearching(true);
    setError(null);
    setIdentifiedPlant(null);
    setRecommendedProducts([]);

    try {
      console.log('Preparing to submit plant image for identification');
      
      // Create FormData object
      const formData = new FormData();
      
      // Add the image file
      if (selectedImage) {
        formData.append('image', selectedImage);
        console.log('Image added to form data:', selectedImage.name, selectedImage.type, selectedImage.size);
      }

      // Send request to identify plant API
      console.log('Sending request to identify plant API');
      const response = await fetch('/api/identify-plant', {
        method: 'POST',
        body: formData,
      });

      console.log('Response received:', response.status);
      
      const data = await response.json();
      
      if (!data.success) {
        // API returned an error
        console.error('API error:', data.error);
        throw new Error(data.error || 'Failed to identify plant');
      }
      
      console.log('Parsed API response');
      
      if (data.result) {
        console.log('Plant identified:', data.result.name);
        
        // Show fallback notice if applicable
        if (data.fallback) {
          setError('Note: Using demo data. The plant identification service is currently unavailable.');
        }
        
        setIdentifiedPlant(data.result);
        
        // Fetch product recommendations based on identified plant
        console.log('Fetching product recommendations');
        const recommendationsResponse = await fetch('/api/get-recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plantName: data.result.name,
          }),
        });

        if (recommendationsResponse.ok) {
          const recommendationsData = await recommendationsResponse.json();
          console.log('Recommendations received:', recommendationsData.products?.length || 0);
          setRecommendedProducts(recommendationsData.products);
        } else {
          console.error('Failed to get recommendations:', recommendationsResponse.status);
          // Continue even if recommendations fail
        }
      } else {
        throw new Error('No plant identification results returned');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to identify plant. Please try again.';
      setError(errorMessage);
      console.error('Error in plant identification process:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FDF6EF] to-white">
      {/* Hero Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Find Your Plant's Perfect Nutrients
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a photo of your plant, and we'll analyze its needs to recommend the best nutrients for optimal growth
          </p>
        </motion.div>

        {/* Search Form */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 mb-12 max-w-4xl mx-auto">
          <form onSubmit={searchPlant} className="space-y-8">
            {/* Image Upload Zone */}
            <div className="relative">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive ? 'border-[#4CAF50] bg-[#4CAF50]/5' : 'border-gray-300 hover:border-[#4CAF50] hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={300}
                      height={300}
                      className="mx-auto rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearImage();
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-all duration-200"
                    >
                      <FiX className="text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <FiUploadCloud className="text-5xl text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        Drag & drop your plant photo here
                      </p>
                      <p className="text-gray-500">or click to browse</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSearching || !selectedImage}
              className={`w-full py-4 px-6 rounded-2xl text-white font-medium text-lg transition-all duration-200 ${
                isSearching || !selectedImage
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#4CAF50] hover:bg-[#43A047] transform hover:-translate-y-1'
              }`}
            >
              {isSearching ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                'Identify Plant'
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 text-center"
            >
              <div className="text-red-600 font-medium text-lg mb-2">{error}</div>
              <p className="text-gray-700">
                Please ensure your image clearly shows the plant, with good lighting and focus.
                The plant identification service works best with close-up images of leaves or distinctive features.
              </p>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    clearImage();
                    setError(null);
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200"
                >
                  Try Another Image
                </button>
              </div>
            </motion.div>
          )}

          {identifiedPlant && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Plant Information Card */}
              <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {identifiedPlant.image_url && (
                    <div className="w-full md:w-1/3">
                      <div className="relative aspect-square rounded-2xl overflow-hidden">
                        <Image
                          src={identifiedPlant.image_url}
                          alt={identifiedPlant.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div className="w-full md:w-2/3 space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {identifiedPlant.name}
                      </h2>
                      <p className="text-gray-500 italic">
                        {identifiedPlant.details.scientific_name}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <RiPlantLine className="text-[#4CAF50]" />
                          <span className="font-medium">Care Level</span>
                        </div>
                        <p className="text-gray-900">{identifiedPlant.details.care_level}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <RiLeafLine className="text-[#4CAF50]" />
                          <span className="font-medium">Family</span>
                        </div>
                        <p className="text-gray-900">{identifiedPlant.details.family}</p>
                      </div>
                    </div>
                    {identifiedPlant.details.growth_info && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Growth Requirements</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.entries(identifiedPlant.details.growth_info).map(([key, value]) => (
                            value && (
                              <div key={key} className="bg-gray-50 rounded-xl p-4">
                                <p className="text-gray-600 capitalize mb-1">
                                  {key.replace(/_/g, ' ')}
                                </p>
                                <p className="text-gray-900 font-medium">{value}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommended Products */}
              {recommendedProducts.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Recommended Products
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                      >
                        <Link href={product.link} className="block">
                          <div className="relative aspect-square">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <RiPlantLine className="text-gray-400 text-5xl" />
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">
                              {product.name}
                            </h4>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-[#4CAF50]">
                                ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                              </span>
                              <span
                                className="px-4 py-2 bg-[#4CAF50] text-white rounded-xl hover:bg-[#43A047] transition-colors duration-200"
                              >
                                View Details
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-8 text-center">
                  <RiPlantLine className="text-4xl text-[#4CAF50] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    We couldn't find specific products for this plant. Please check our 
                    <Link href="/shop" className="text-[#4CAF50] font-medium mx-1 hover:underline">
                      shop
                    </Link>
                    for our full range of plant care products.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default NutrientsPage; 