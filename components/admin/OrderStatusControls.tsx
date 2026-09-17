"use client";

import { useState } from "react";

import { updateOrderStatus } from "@/lib/order-actions";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Ready for Delivery",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
] as const;

const PAYMENT_STATUSES = [
  "Pending",
  "Paid",
  "Failed",
  "Refunded",
] as const;

type Props = {
  orderId: string;
  initialOrderStatus: string;
  initialPaymentStatus: string;
};

export function OrderStatusControls({
  orderId,
  initialOrderStatus,
  initialPaymentStatus,
}: Props) {
  const [orderStatus, setOrderStatus] =
    useState(initialOrderStatus);

  const [paymentStatus, setPaymentStatus] =
    useState(initialPaymentStatus);

  const [savingOrder, setSavingOrder] =
    useState(false);

  const [savingPayment, setSavingPayment] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function saveOrderStatus() {
    setSavingOrder(true);
    setMessage("");
    setError("");

    try {
      const result =
        await updateOrderStatus(
          orderId,
          orderStatus,
          undefined
        );

      if (!result.success) {
        setError(
          result.message ||
            "Unable to update order status."
        );
        return;
      }

      setMessage(
        "Order status updated successfully."
      );

      if (result.orderStatus) {
        setOrderStatus(
          result.orderStatus
        );
      }

      if (result.paymentStatus) {
        setPaymentStatus(
          result.paymentStatus
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update order status."
      );
    } finally {
      setSavingOrder(false);
    }
  }

  async function savePaymentStatus() {
    setSavingPayment(true);
    setMessage("");
    setError("");

    try {
      const result =
        await updateOrderStatus(
          orderId,
          undefined,
          paymentStatus
        );

      if (!result.success) {
        setError(
          result.message ||
            "Unable to update payment status."
        );
        return;
      }

      setMessage(
        "Payment status updated successfully."
      );

      if (result.orderStatus) {
        setOrderStatus(
          result.orderStatus
        );
      }

      if (result.paymentStatus) {
        setPaymentStatus(
          result.paymentStatus
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update payment status."
      );
    } finally {
      setSavingPayment(false);
    }
  }

  return (
    <div className="border-t p-6">
      <h3 className="mb-5 text-lg font-bold text-gray-900">
        Manage Order
      </h3>

      {message && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Status */}
        <div>
          <label
            htmlFor={`order-status-${orderId}`}
            className="mb-2 block text-sm font-bold text-gray-900"
          >
            Order Status
          </label>

          <select
            id={`order-status-${orderId}`}
            value={orderStatus}
            onChange={(event) =>
              setOrderStatus(
                event.target.value
              )
            }
            disabled={savingOrder}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            {ORDER_STATUSES.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            onClick={saveOrderStatus}
            disabled={savingOrder}
            className="mt-3 w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingOrder
              ? "Saving..."
              : "Save Order Status"}
          </button>
        </div>

        {/* Payment Status */}
        <div>
          <label
            htmlFor={`payment-status-${orderId}`}
            className="mb-2 block text-sm font-bold text-gray-900"
          >
            Payment Status
          </label>

          <select
            id={`payment-status-${orderId}`}
            value={paymentStatus}
            onChange={(event) =>
              setPaymentStatus(
                event.target.value
              )
            }
            disabled={savingPayment}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            {PAYMENT_STATUSES.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            onClick={savePaymentStatus}
            disabled={savingPayment}
            className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingPayment
              ? "Saving..."
              : "Save Payment Status"}
          </button>
        </div>
      </div>
    </div>
  );
}