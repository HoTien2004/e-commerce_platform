// Danh sách categories cho dropdown trong admin panel
export const PRODUCT_CATEGORIES = [
  'PC Gaming',
  'PC Văn phòng',
  'PC Workstation',
  'PC MINI',
  'Laptop gaming',
  'Laptop văn phòng',
  'Màn hình',
  'Loa máy tính',
  'Giá treo',
  'Tai nghe',
  'Chuột',
  'Bàn phím',
  'Pad chuột',
  'Linh kiện máy tính',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

