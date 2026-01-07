import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const Home = () => {
  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4">
              Công nghệ hàng đầu cho bạn
            </h1>
            <p className="text-xl mb-8 text-gray-100">
              Khám phá bộ sưu tập laptop, PC và phụ kiện công nghệ chất lượng cao
            </p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              <span>Xem sản phẩm</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Laptop */}
            <Link
              to="/laptops"
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition"
            >
              <div className="h-64 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-6xl">💻</span>
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold mb-2">Laptop</h3>
                <p className="text-gray-600">Laptop gaming, văn phòng, đồ họa</p>
              </div>
            </Link>

            {/* PC */}
            <Link
              to="/pcs"
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition"
            >
              <div className="h-64 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <span className="text-6xl">🖥️</span>
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold mb-2">PC</h3>
                <p className="text-gray-600">Máy tính để bàn, PC gaming</p>
              </div>
            </Link>

            {/* Accessories */}
            <Link
              to="/accessories"
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition"
            >
              <div className="h-64 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-6xl">🖱️</span>
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold mb-2">Phụ kiện</h3>
                <p className="text-gray-600">Chuột, bàn phím, tai nghe...</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Giao hàng nhanh</h3>
              <p className="text-gray-600">Miễn phí vận chuyển toàn quốc</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Chính hãng</h3>
              <p className="text-gray-600">100% sản phẩm chính hãng</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Bảo hành</h3>
              <p className="text-gray-600">Bảo hành chính hãng 12-24 tháng</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

