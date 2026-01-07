import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">TechStore</h3>
            <p className="text-sm">
              Cửa hàng công nghệ hàng đầu, chuyên cung cấp laptop, PC và phụ kiện chính hãng.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Danh mục</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/laptops" className="hover:text-white transition">
                  Laptop
                </Link>
              </li>
              <li>
                <Link to="/pcs" className="hover:text-white transition">
                  PC
                </Link>
              </li>
              <li>
                <Link to="/accessories" className="hover:text-white transition">
                  Phụ kiện
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <div className="space-y-2 text-sm">
              <p>Email: support@techstore.com</p>
              <p>Hotline: 1900-xxxx</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="hover:text-white transition">
                  <FiFacebook className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition">
                  <FiTwitter className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition">
                  <FiInstagram className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition">
                  <FiMail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 TechStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

