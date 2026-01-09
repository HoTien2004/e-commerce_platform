import { Link } from 'react-router-dom';
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
} from 'react-icons/fi';

const Footer = () => {
  return (
    <>
      {/* Newsletter / ngăn cách body và footer */}
      <div className="bg-secondary-900 text-white border-t border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Nhận tin mới nhất</h3>
            <p className="text-base text-secondary-100">
              Đăng ký email để không bỏ lỡ khuyến mãi và sản phẩm mới.
            </p>
          </div>
          <form className="w-full lg:w-auto lg:min-w-[420px] flex flex-col sm:flex-row sm:flex-nowrap gap-3">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="w-full sm:flex-1 sm:w-auto rounded-lg border border-border bg-white px-4 py-3 text-base text-foreground shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 placeholder:text-muted"
              required
            />
            <button type="submit" className="btn-primary sm:flex-none sm:w-auto w-full text-base px-6 py-3 whitespace-nowrap">
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      <footer className="bg-background text-secondary-800 mt-auto border-t border-border text-base">
        <div className="max-w-[1200px] mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 items-start">
            {/* About */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary-600">TechStore</h3>
              <p className="text-base leading-relaxed text-secondary-700">
                Cửa hàng công nghệ chuyên laptop, PC, màn hình và phụ kiện chính hãng. Cam kết sản phẩm
                chất lượng, bảo hành rõ ràng và hỗ trợ tận tâm.
              </p>
              <p className="mt-3 text-base text-secondary-600 inline-flex items-center gap-2">
                <FiMapPin className="w-5 h-5 text-secondary-700" />
                123 Tech Street, Quận 1, TP. Hồ Chí Minh
              </p>
              <p className="text-base text-secondary-600 inline-flex items-center gap-2">
                <FiClock className="w-5 h-5 text-secondary-700" />
                8:30 - 21:30 (Thứ 2 - Chủ nhật)
              </p>
              <div className="mt-6">
                <img
                  src="https://res.cloudinary.com/dxf5tsrif/image/upload/v1767777773/bct2_payqs9.png"
                  alt="Đã thông báo Bộ Công Thương"
                  className="h-16 w-auto object-contain"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xl font-semibold mb-3 text-foreground">Danh mục</h4>
              <ul className="space-y-2.5 text-base">
                <li>
                  <Link to="/laptops" className="text-secondary-700 hover:text-primary-600 transition-colors">
                    Laptop chính hãng
                  </Link>
                </li>
                <li>
                  <Link to="/pcs" className="text-secondary-700 hover:text-primary-600 transition-colors">
                    PC chính hãng
                  </Link>
                </li>
                <li>
                  <Link to="/accessories" className="text-secondary-700 hover:text-primary-600 transition-colors">
                    Phụ kiện chính hãng
                  </Link>
                </li>
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h4 className="text-xl font-semibold mb-3 text-foreground">Chính sách</h4>
              <ul className="space-y-2.5 text-base">
                <li>
                  <Link to="/warranty" className="text-secondary-700 hover:text-primary-600 transition-colors">
                    Bảo hành & đổi trả
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-secondary-700 hover:text-primary-600 transition-colors">
                    Giao hàng & thanh toán
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-secondary-700 hover:text-primary-600 transition-colors">
                    Bảo mật thông tin
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-secondary-700 hover:text-primary-600 transition-colors">
                    Điều khoản sử dụng
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xl font-semibold mb-3 text-foreground">Liên hệ</h4>
              <div className="space-y-2.5 text-base">
                <p className="inline-flex items-center gap-2">
                  <FiMail className="w-5 h-5 text-secondary-700" />
                  support@techstore.com
                </p>
                <p className="inline-flex items-center gap-2">
                  <FiPhone className="w-5 h-5 text-secondary-700" />
                  Hotline: 1900-xxxx
                </p>
                <p className="inline-flex items-center gap-2">
                  <FiPhone className="w-5 h-5 text-secondary-700" />
                  Zalo: 0909 999 999
                </p>
                <p className="inline-flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-secondary-700" />
                  Hỗ trợ 8:30 - 21:30 mỗi ngày
                </p>
                <div className="flex items-center space-x-3 mt-3">
                  <a href="#" className="text-secondary-700 hover:text-primary-600 transition-colors" aria-label="Facebook">
                    <FiFacebook className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-secondary-700 hover:text-primary-600 transition-colors" aria-label="Twitter">
                    <FiTwitter className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-secondary-700 hover:text-primary-600 transition-colors" aria-label="Instagram">
                    <FiInstagram className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-secondary-700 hover:text-primary-600 transition-colors" aria-label="Email">
                    <FiMail className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-0 pt-4 flex items-center justify-center text-sm md:text-base text-secondary-600">
          <p className="text-center leading-relaxed pb-4">
            &copy; Copyright © 2026 Bản quyền của Công ty cổ phẩn TechStore Việt Nam - Trụ sở: 123 Tech
            Street, Quận 1, TP. Hồ Chí Minh.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;

