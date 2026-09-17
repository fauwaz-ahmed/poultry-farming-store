export type CategorySlug = "chickens" | "poultry-feed" | "poultry-medicines" | "farm-equipment";
export type OrderStatus = "Pending"|"Confirmed"|"Processing"|"Ready for Delivery"|"Out for Delivery"|"Delivered"|"Cancelled";
export type PaymentStatus = "Pending"|"Paid"|"Failed"|"Refunded";

export interface ProductDTO {
  _id: string; name: string; slug: string; category: CategorySlug;
  description: string; images: string[]; price: number; discountPrice?: number;
  stock: number; unit: string; sku: string; brand?: string;
  subcategory?: string; specifications?: Record<string,string>;
  active: boolean; featured: boolean; details?: Record<string, unknown>;
}