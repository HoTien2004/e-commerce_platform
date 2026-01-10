import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiX, FiUpload, FiTrash2 } from 'react-icons/fi';
import { productService, Product, CreateProductData } from '../services/productService';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  originalPrice: z.number().min(0).optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  stock: z.number().min(0, 'Tồn kho phải lớn hơn hoặc bằng 0').default(0),
  status: z.enum(['active', 'inactive', 'out_of_stock', 'discontinued']).default('active'),
  tags: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<Array<{ url: string; publicId?: string; isPrimary: boolean }>>(
    product?.images || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      shortDescription: product?.shortDescription || '',
      price: product?.price || 0,
      originalPrice: product?.originalPrice || undefined,
      category: product?.category || '',
      brand: product?.brand || '',
      stock: product?.stock || 0,
      status: product?.status || 'active',
      tags: product?.tags?.join(', ') || '',
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        brand: product.brand,
        stock: product.stock,
        status: product.status,
        tags: product.tags?.join(', ') || '',
      });
      setImages(product.images || []);
    }
  }, [product, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const fileArray = Array.from(files);
      const response = await productService.uploadImages(fileArray);
      const newImages = response.data.map((img, index) => ({
        ...img,
        isPrimary: images.length === 0 && index === 0,
      }));
      setImages([...images, ...newImages]);
      toast.success('Tải ảnh thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải ảnh');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index: number) => {
    setImages(
      images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);
      const productData: CreateProductData = {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price,
        originalPrice: data.originalPrice,
        category: data.category,
        brand: data.brand,
        stock: data.stock,
        status: data.status,
        tags: data.tags ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
        images: images,
      };

      if (product) {
        await productService.updateProduct(product._id, productData);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await productService.createProduct(productData);
        toast.success('Tạo sản phẩm thành công!');
      }

      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thương hiệu</label>
              <input {...register('brand')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá gốc</label>
              <input
                type="number"
                {...register('originalPrice', { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <input {...register('category')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tồn kho</label>
              <input
                type="number"
                {...register('stock', { valueAsNumber: true })}
                className={errors.stock ? 'border-red-500' : ''}
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select {...register('status')}>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="out_of_stock">Hết hàng</option>
                <option value="discontinued">Ngừng kinh doanh</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (phân cách bằng dấu phẩy)</label>
              <input {...register('tags')} placeholder="ví dụ: laptop, gaming, premium" />
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả ngắn</label>
            <textarea
              {...register('shortDescription')}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  {img.isPrimary && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                      Chính
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(index)}
                      className="opacity-0 group-hover:opacity-100 text-white text-xs px-2 py-1 bg-primary-600 rounded hover:bg-primary-700"
                    >
                      Đặt làm chính
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="opacity-0 group-hover:opacity-100 text-white p-2 bg-red-600 rounded hover:bg-red-700"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
              <FiUpload className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {uploadingImages ? 'Đang tải...' : 'Tải ảnh lên'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImages}
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang lưu...' : product ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;

