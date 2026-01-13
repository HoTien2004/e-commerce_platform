import { useState, useMemo } from 'react';
import { FiMapPin, FiPlus, FiCheck, FiTrash2, FiEdit2 } from 'react-icons/fi';
import AddressAutocomplete from './AddressAutocomplete';
import toast from 'react-hot-toast';
import type { UserAddress } from '../services/profileService';

interface AddressManagerProps {
  addresses: UserAddress[];
  onAddAddress: (address: string) => Promise<void>;
  onUpdateAddress: (id: string, address: string) => Promise<void>;
  onDeleteAddress: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const AddressManager = ({
  addresses,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefault,
  isLoading = false,
}: AddressManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState('');

  // Sort addresses: default address first
  const sortedAddresses = useMemo(() => {
    return [...addresses].sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return 0;
    });
  }, [addresses]);

  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ');
      return;
    }

    try {
      await onAddAddress(newAddress.trim());
      setNewAddress('');
      setIsAdding(false);
      toast.success('Thêm địa chỉ thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thêm địa chỉ thất bại');
    }
  };

  const handleUpdateAddress = async (id: string) => {
    if (!editingAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ');
      return;
    }

    try {
      await onUpdateAddress(id, editingAddress.trim());
      setEditingId(null);
      setEditingAddress('');
      toast.success('Cập nhật địa chỉ thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật địa chỉ thất bại');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const address = addresses.find((addr) => addr._id === id);
    if (address?.isDefault) {
      toast.error('Không thể xóa địa chỉ mặc định');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return;
    }

    try {
      await onDeleteAddress(id);
      toast.success('Xóa địa chỉ thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xóa địa chỉ thất bại');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await onSetDefault(id);
      toast.success('Đặt địa chỉ mặc định thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đặt địa chỉ mặc định thất bại');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          <FiMapPin className="inline w-4 h-4 mr-1 mb-1" />
          Địa chỉ
        </label>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            <FiPlus className="w-4 h-4" />
            Thêm địa chỉ mới
          </button>
        )}
      </div>

      {/* Add new address form */}
      {isAdding && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="space-y-3">
            <AddressAutocomplete
              value={newAddress}
              onChange={setNewAddress}
              placeholder="Nhập địa chỉ mới..."
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddAddress}
                disabled={isLoading}
                className="btn-primary text-sm py-1.5 px-3"
              >
                {isLoading ? 'Đang thêm...' : 'Thêm'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewAddress('');
                }}
                className="btn-ghost text-sm py-1.5 px-3"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address list */}
      <div className="space-y-2">
        {sortedAddresses.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Chưa có địa chỉ nào</p>
        ) : (
          sortedAddresses.map((addr) => (
            <div
              key={addr._id}
              className={`p-3 border rounded-lg ${
                addr.isDefault ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-white'
              }`}
            >
              {editingId === addr._id ? (
                <div className="space-y-2">
                  <AddressAutocomplete
                    value={editingAddress}
                    onChange={setEditingAddress}
                    placeholder="Nhập địa chỉ..."
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateAddress(addr._id!)}
                      disabled={isLoading}
                      className="btn-primary text-sm py-1 px-2"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditingAddress('');
                      }}
                      className="btn-ghost text-sm py-1 px-2"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900">{addr.address}</span>
                      {addr.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                          <FiCheck className="w-3 h-3" />
                          Mặc định
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr._id!)}
                        disabled={isLoading}
                        className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="Đặt làm mặc định"
                      >
                        <FiCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(addr._id!);
                        setEditingAddress(addr.address);
                      }}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Chỉnh sửa"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr._id!)}
                        disabled={isLoading}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddressManager;

