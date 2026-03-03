import { FiMoon, FiSun, FiGlobe } from 'react-icons/fi';
import { useUiStore } from '../store/uiStore';

const Settings = () => {
  const { theme, language, toggleTheme, setLanguage } = useUiStore();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Cài đặt</h1>

      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiMoon className="w-5 h-5 text-primary-600" />
          <span>Chế độ sáng / tối</span>
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Tùy chỉnh giao diện bảng điều khiển theo sở thích của bạn.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-800 transition-colors"
          >
            {theme === 'light' ? (
              <>
                <FiMoon className="w-4 h-4" />
                <span>Bật chế độ tối</span>
              </>
            ) : (
              <>
                <FiSun className="w-4 h-4" />
                <span>Bật chế độ sáng</span>
              </>
            )}
          </button>
          <span className="text-xs text-gray-500">
            Hiện tại: {theme === 'light' ? 'Giao diện sáng' : 'Giao diện tối'}
          </span>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiGlobe className="w-5 h-5 text-primary-600" />
          <span>Ngôn ngữ giao diện</span>
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Chọn ngôn ngữ hiển thị cho khu vực quản trị.
        </p>
        <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50 overflow-hidden">
          <button
            type="button"
            onClick={() => setLanguage('vi')}
            className={`px-4 py-2 text-sm font-medium ${language === 'vi'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            Tiếng Việt
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 text-sm font-medium ${language === 'en'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            English
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          * Hiện tại ngôn ngữ áp dụng cho menu và một phần giao diện. Bạn có thể mở rộng thêm cho toàn bộ admin panel sau.
        </p>
      </section>
    </div>
  );
};

export default Settings;

