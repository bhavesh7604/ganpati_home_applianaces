export type Category = { id: string; slug: string; name: string; description: string | null; sort_order: number };

export type Product = {
  id: string; slug: string; sku: string | null; name: string; brand: string | null;
  category_id: string | null; description: string | null; features: string[];
  specs: Record<string, string>; options_label: string; options: string[]; size_info: string | null;
  price: number | null; mrp: number | null; stock: number | null; images: string[];
  is_active: boolean; is_featured: boolean; created_at: string;
  category?: { id: string; slug: string; name: string } | null;
};

export type OrderItem = { id: string; name: string; sku: string | null; option: string | null; unit_price: number; quantity: number };
export type Order = {
  id: string; order_no: string; customer_name: string; phone: string; email: string | null;
  address_line: string; city: string; state: string; pincode: string; notes: string | null;
  payment_method: string; status: string; subtotal: number; shipping_fee: number; total: number;
  created_at: string; order_items?: OrderItem[];
};
