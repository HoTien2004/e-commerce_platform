import { FiBookOpen, FiCalendar, FiUser } from 'react-icons/fi';

const News = () => {
  // Mock news data
  const newsArticles = [
    {
      id: 1,
      title: 'Xu hướng laptop gaming 2024: RTX 40 series và chip mới nhất',
      excerpt: 'Tổng hợp các mẫu laptop gaming hàng đầu năm 2024 với card đồ họa RTX 40 series và bộ xử lý thế hệ mới.',
      author: 'TechStore Editorial',
      date: '15/01/2024',
      category: 'Laptop',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    },
    {
      id: 2,
      title: 'PC Workstation cho designer: Cấu hình tối ưu năm 2024',
      excerpt: 'Hướng dẫn chọn cấu hình PC workstation phù hợp cho công việc đồ họa, render video và 3D modeling.',
      author: 'TechStore Editorial',
      date: '12/01/2024',
      category: 'PC',
      image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800',
    },
    {
      id: 3,
      title: 'So sánh màn hình gaming: QHD vs 4K cho game thủ',
      excerpt: 'Phân tích chi tiết về màn hình QHD và 4K, giúp bạn chọn màn hình phù hợp với nhu cầu gaming.',
      author: 'TechStore Editorial',
      date: '10/01/2024',
      category: 'Màn hình',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
    },
    {
      id: 4,
      title: 'Tai nghe gaming: Công nghệ mới và xu hướng 2024',
      excerpt: 'Tìm hiểu về các công nghệ âm thanh mới trong tai nghe gaming và những mẫu đáng chú ý năm 2024.',
      author: 'TechStore Editorial',
      date: '08/01/2024',
      category: 'Phụ kiện',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FiBookOpen className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Tin tức công nghệ</h1>
          </div>
          <p className="text-gray-600">
            Cập nhật những tin tức mới nhất về công nghệ, sản phẩm và xu hướng trong ngành
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded">
                    {article.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                  {article.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <FiUser className="w-4 h-4" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiCalendar className="w-4 h-4" />
                    <span>{article.date}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
            Xem thêm tin tức
          </button>
        </div>
      </div>
    </div>
  );
};

export default News;

