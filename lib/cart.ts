import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import { getCurrentUser } from "@/lib/auth";

const CART_COOKIE = "poultry_cart";

export async function getCart() {
  await connectDB();

  const cookieStore = await cookies();

  const sessionId =
    cookieStore.get(CART_COOKIE)?.value;

  if (!sessionId) {
    return null;
  }

  const user = await getCurrentUser();

  const cartQuery = user
    ? {
        sessionId,
        user: user.id,
      }
    : {
        sessionId,
      };

  const cart = await Cart.findOne(cartQuery)
    .populate("items.product")
    .lean();

  if (!cart) {
    return null;
  }

  return {
    _id: String(cart._id),

    sessionId: String(
      cart.sessionId || ""
    ),

    items: cart.items.map(
      (item: any) => {
        const product = item.product;

        return {
          quantity: Number(
            item.quantity || 0
          ),

          product: product
            ? {
                _id: String(
                  product._id
                ),

                name: String(
                  product.name || ""
                ),

                slug: String(
                  product.slug || ""
                ),

                category: String(
                  product.category || ""
                ),

                description: String(
                  product.description || ""
                ),

                images:
                  Array.isArray(
                    product.images
                  )
                    ? product.images.map(
                        (image: unknown) =>
                          String(image)
                      )
                    : [],

                price: Number(
                  product.price || 0
                ),

                stock: Number(
                  product.stock || 0
                ),

                unit: String(
                  product.unit || ""
                ),

                sku: String(
                  product.sku || ""
                ),

                active:
                  product.active !==
                  false,

                featured:
                  product.featured === true,
              }
            : null,
        };
      }
    ),
  };
}
