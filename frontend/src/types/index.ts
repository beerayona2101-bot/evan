export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatar?: string;
  token?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
  description: string;
  shortDescription?: string;
  detailedDescription?: string;
  price: number;
  discountPrice?: number;
  mrp?: number;
  discountPercentage?: number;
  category: string;
  fit?: string;
  sizes: string[];
  colors: string[];
  material?: string;
  weight?: string;
  countryOfOrigin?: string;
  washCare?: string;
  sku: string;
  stock: number;
  images: string[];
  hoverImage?: string;
  galleryImages?: string[];
  rating: number;
  numReviews: number;
  tags?: string[];
  frequentlyBoughtTogether?: string[];
  isFeatured: boolean;
  trending?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  fabric: string;
  blousePiece?: string;
  borderType?: string;
  palluStyle?: string;
  workType?: string;
  occasion?: string;
  sareeLength?: string;
  sareeWidth?: string;
  sareeWeight?: string;
  pattern?: string;
  clothType?: string;
  comfortLevel?: string;
  threadMaterial?: string;
  colorDetails?: string;
  transparency?: string;
  drapeStyle?: string;
  status?: 'active' | 'inactive';
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  banner?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'HIDDEN' | 'ARCHIVED';
  isLive: boolean;
  featured: boolean;
  displayOrder: number;
  productCount: number;
  seoTitle?: string;
  seoDescription?: string;
  parentCategory?: string | Category;
  createdBy?: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  _id?: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface OrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  size: string;
  color: string;
  product: string;
}

export interface Order {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  orderItems: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  cancelledBy?: 'Customer' | 'Admin';
  cancelReason?: string;
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Out For Delivery' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface Review {
  _id: string;
  user: string;
  userName: string;
  userAvatar?: string;
  product: string;
  rating: number;
  comment: string;
  createdAt: string;
}
