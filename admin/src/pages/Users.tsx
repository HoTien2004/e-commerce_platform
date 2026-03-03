import { useState, useEffect } from 'react';
import { userService, type User } from '../services/userService';
import { FiSearch, FiTrash2 } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'user' | 'admin'>('all');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserName, setDeleteUserName] = useState<string>('');
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    userId: string;
    newRole: 'user' | 'admin';
    name: string;
  } | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [currentPage, selectedRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers({
        page: currentPage,
        limit: 15,
        search: searchTerm || undefined,
        role: selectedRole === 'all' ? undefined : selectedRole,
      });
      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadUsers();
  };

  const handleOpenRoleChange = (user: User, newRole: 'user' | 'admin') => {
    if (user.role === newRole) return;
    const name = `${user.firstName} ${user.lastName}`.trim() || user.email;
    setPendingRoleChange({
      userId: user._id,
      newRole,
      name,
    });
  };

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    try {
      setIsUpdatingRole(true);
      const { userId, newRole } = pendingRoleChange;
      const response = await userService.updateUserRole(userId, newRole);
      if (response.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: response.data.user.role } : u)),
        );
        toast.success('Cập nhật vai trò người dùng thành công!');
      }
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật vai trò người dùng');
    } finally {
      setIsUpdatingRole(false);
      setPendingRoleChange(null);
    }
  };

  const handleConfirmDelete = (user: User) => {
    setDeleteUserId(user._id);
    setDeleteUserName(`${user.firstName} ${user.lastName}`.trim() || user.email);
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      const response = await userService.deleteUser(deleteUserId);
      if (response.success) {
        setUsers((prev) => prev.filter((u) => u._id !== deleteUserId));
        toast.success('Xóa người dùng thành công!');
      } else {
        toast.error(response.message || 'Không thể xóa người dùng');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa người dùng');
    } finally {
      setDeleteUserId(null);
      setDeleteUserName('');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo email, tên..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value as 'all' | 'user' | 'admin');
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tất cả</option>
              <option value="user">Người dùng</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <FiSearch className="w-4 h-4" />
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Không tìm thấy người dùng nào
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số điện thoại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.firstName}
                              className="h-10 w-10 rounded-full mr-3"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-gray-600 font-medium">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            {user.gender && (
                              <div className="text-sm text-gray-500">{user.gender}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleOpenRoleChange(user, e.target.value as 'user' | 'admin')}
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                            user.role === 'admin'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          <option value="user">Người dùng</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleConfirmDelete(user)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
              <div className="text-sm text-gray-700">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteUserId}
        title="Xóa người dùng"
        message={
          deleteUserId
            ? `Bạn có chắc chắn muốn xóa người dùng "${deleteUserName}"? Hành động này không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setDeleteUserId(null);
          setDeleteUserName('');
        }}
      />

      <ConfirmModal
        isOpen={!!pendingRoleChange}
        title="Cập nhật vai trò người dùng"
        message={
          pendingRoleChange
            ? `Bạn có chắc muốn đổi vai trò của "${pendingRoleChange.name}" thành ${
                pendingRoleChange.newRole === 'admin' ? 'Quản trị viên' : 'Người dùng'
              }?`
            : ''
        }
        confirmLabel={isUpdatingRole ? 'Đang cập nhật...' : 'Cập nhật'}
        cancelLabel="Hủy"
        onConfirm={handleConfirmRoleChange}
        onCancel={() => {
          if (!isUpdatingRole) {
            setPendingRoleChange(null);
          }
        }}
      />
    </div>
  );
};

export default Users;

