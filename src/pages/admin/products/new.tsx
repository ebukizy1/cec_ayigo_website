import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { productService } from '@/services/productService';
import { getAuth } from "firebase/auth";
import { useEffect } from "react";


const CATEGORIES = [
  { value: "All", label: "All Categories" },
  { value: "Solar generators and solar kits", label: "Solar Generators & Kits" },
  { value: "Solar streetlights", label: "Solar Streetlights" },
  { value: "Solar Floodlights", label: "Solar Floodlights" },
  { value: "Solar fans", label: "Solar Fans" },
  { value: "Solar cameras", label: "Solar Cameras" },
  { value: "AI solar camera streetlight", label: "AI Solar Camera Streetlight" },
  { value: "Solar Flourescent lamps", label: "Solar Fluorescent Lamps" },
  { value: "Solar ceiling lamps", label: "Solar Ceiling Lamps" },
  { value: "Solar panels", label: "Solar Panels" },
  { value: "Lithium battery, lithium tubular battery", label: "Lithium Batteries" },
  { value: "Hybrid inverters", label: "Hybrid Inverters" }
];

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountedPrice: "",
    category: "",
    inStock: true,
    featured: false,
    features: [""],
    specifications: [{ key: "", value: "" }]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleSpecificationChange = (index: number, field: "key" | "value", value: string) => {
    const updatedSpecifications = [...formData.specifications];
    updatedSpecifications[index][field] = value;
    setFormData(prev => ({ ...prev, specifications: updatedSpecifications }));
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }]
    }));
  };

  const removeSpecification = (index: number) => {
    const updatedSpecifications = [...formData.specifications];
    updatedSpecifications.splice(index, 1);
    setFormData(prev => ({ ...prev, specifications: updatedSpecifications }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Limit to 4 images total
      const totalImages = imageFiles.length + newFiles.length;
      if (totalImages > 4) {
        toast.error("Maximum 4 images allowed");
        return;
      }
      
      setImageFiles(prev => [...prev, ...newFiles]);
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    const updatedFiles = [...imageFiles];
    const updatedPreviewUrls = [...imagePreviewUrls];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(updatedPreviewUrls[index]);
    
    updatedFiles.splice(index, 1);
    updatedPreviewUrls.splice(index, 1);
    
    setImageFiles(updatedFiles);
    setImagePreviewUrls(updatedPreviewUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (imageFiles.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload images to Firebase Storage
      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );
      
      // Convert specifications array to object
      const specificationsObject = formData.specifications.reduce((obj, item) => {
        if (item.key && item.value) {
          obj[item.key] = item.value;
        }
        return obj;
      }, {} as Record<string, string>);
      
      // Filter out empty features
      const filteredFeatures = formData.features.filter(feature => feature.trim() !== '');
      
      // Create product using productService
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined,
        category: formData.category,
        inStock: formData.inStock,
        featured: formData.featured,
        features: filteredFeatures,
        specifications: specificationsObject,
        images: imageUrls
      };
      await productService.createProduct(productData);
      
      // Show success message
      toast.success('Product created successfully!');
      
      // Clear form
      setFormData({
        name: '',
        description: '',
        price: '',
        discountedPrice: '',
        category: '',
        inStock: true,
        featured: false,
        features: [''],
        specifications: [{ key: '', value: '' }]
      });
      setImageFiles([]);
      setImagePreviewUrls([]);
      
      // Redirect to dashboard
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


useEffect(() => {
  const auth = getAuth();
  console.log("Current user:", auth.currentUser);

}, []);

  return ( 
    <>
      <Head>
        <title>Add New Product | Emax-Electrical - Shop Easy</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Solar Panel Kit 400W"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={handleCategoryChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Detailed product description"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Regular Price (#)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 599.99"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discountedPrice">Discounted Price (₦) (Optional)</Label>
                    <Input
                      id="discountedPrice"
                      name="discountedPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discountedPrice}
                      onChange={handleInputChange}
                      placeholder="e.g. 499.99"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="inStock"
                      checked={formData.inStock}
                      onCheckedChange={(checked) => handleSwitchChange("inStock", checked)}
                    />
                    <Label htmlFor="inStock">In Stock</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img 
                          src={url} 
                          alt={`Product image ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 rounded-full"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    {imagePreviewUrls.length < 4 && (
                      <label className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-gray-300 dark:border-gray-700 cursor-pointer hover:border-primary dark:hover:border-primary transition-colors">
                        <div className="flex flex-col items-center justify-center p-4">
                          <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Upload Image
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            (Max 4 images)
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFeature(index)}
                        disabled={formData.features.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={addFeature}
                  >
                    <Plus className="h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={spec.key}
                        onChange={(e) => handleSpecificationChange(index, "key", e.target.value)}
                        placeholder="Specification name"
                        className="flex-1"
                      />
                      <Input
                        value={spec.value}
                        onChange={(e) => handleSpecificationChange(index, "value", e.target.value)}
                        placeholder="Specification value"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSpecification(index)}
                        disabled={formData.specifications.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={addSpecification}
                  >
                    <Plus className="h-4 w-4" />
                    Add Specification
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Product...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}