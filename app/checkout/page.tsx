import Link from "next/link";
import { redirect } from "next/navigation";

import { getCart } from "@/lib/cart";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Address from "@/models/Address";

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "customer") {
    redirect("/login?next=/checkout");
  }

  const cart = await getCart();

  if (!cart || !cart.items || cart.items.length === 0) {
    redirect("/cart");
  }

  await connectDB();

  const savedAddresses = await Address.find({
    customer: user.id,
  })
    .sort({
      isDefault: -1,
      createdAt: -1,
    })
    .lean();

  const addresses = savedAddresses.map((address: any) => ({
    id: address._id.toString(),
    fullName: String(address.fullName || ""),
    phone: String(address.phone || ""),
    address: String(address.address || ""),
    city: String(address.city || ""),
    state: String(address.state || ""),
    pincode: String(address.pincode || ""),
    instructions: String(address.instructions || ""),
    isDefault: Boolean(address.isDefault),
  }));

  const items = cart.items.map((item: any) => ({
    productId: String(item.product?._id),
    name: String(item.product?.name || ""),
    price: Number(item.product?.price || 0),
    quantity: Number(item.quantity || 0),
    image: String(item.product?.images?.[0] || ""),
  }));

  const subtotal = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const deliveryFee = subtotal >= 1000 ? 0 : 100;
  const discount = 0;
  const grandTotal = subtotal + deliveryFee - discount;

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <Link
            href="/cart"
            className="text-sm font-medium text-green-700 hover:underline"
          >
            ← Back to Cart
          </Link>

          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="mt-2 text-gray-600">
            Enter your delivery details and place your Cash on Delivery order.
          </p>
        </div>

        <CheckoutForm
          items={items}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          discount={discount}
          grandTotal={grandTotal}
          customer={{
            name: user.name,
            phone: user.phone,
            email: user.email,
          }}
          savedAddresses={addresses}
        />
      </div>
    </main>
  );
}