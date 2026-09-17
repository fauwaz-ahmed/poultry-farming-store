import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2).max(160),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum(["chickens","poultry-feed","poultry-medicines","farm-equipment"]),
  description: z.string().min(10).max(10000),
  price: z.number().nonnegative(),
  discountPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative(),
  unit: z.string().min(1).max(50),
  sku: z.string().min(1).max(80),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  brand: z.string().max(120).optional(),
  subcategory: z.string().max(120).optional(),
  images: z.array(z.string().url()).max(10).default([]),
  specifications: z.record(z.string()).optional(),
  details: z.record(z.unknown()).optional()
});

export const checkoutSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email(),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/),
  instructions: z.string().max(500).optional(),
  paymentMethod: z.enum(["cod","online"])
});