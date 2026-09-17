import Link from "next/link";

type OrderSuccessPageProps = {
  searchParams: Promise<{
    orderNumber?: string;
  }>;
};

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const params = await searchParams;

  const orderNumber =
    params.orderNumber || "";

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-xl px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Order Placed Successfully!
          </h1>

          <p className="mt-3 text-gray-600">
            Thank you for your order. Your order
            has been received successfully.
          </p>

          {orderNumber && (
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Order Number
              </p>

              <p className="mt-1 text-xl font-bold text-gray-900">
                {orderNumber}
              </p>
            </div>
          )}

          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-left">
            <p className="font-semibold text-green-900">
              Payment Method: Cash on Delivery
            </p>

            <p className="mt-1 text-sm text-green-800">
              Please keep the required cash ready when
              your order is delivered.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {orderNumber && (
              <Link
                href={`/account/orders/${orderNumber}`}
                className="rounded-lg bg-farm-700 px-6 py-3 font-semibold text-white hover:bg-farm-800"
              >
                View Order Details
              </Link>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/account/orders"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                My Orders
              </Link>

              <Link
                href="/"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}