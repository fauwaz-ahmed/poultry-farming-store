type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Ready for Delivery"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

type Props = {
  status: string;
};

const statuses: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Processing",
  "Ready for Delivery",
  "Out for Delivery",
  "Delivered",
];

export function OrderStatusTimeline({
  status,
}: Props) {
  if (status === "Cancelled") {
    return (
      <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-lg">
            ✕
          </div>

          <div>
            <p className="font-bold text-red-800">
              Order Cancelled
            </p>

            <p className="mt-1 text-sm text-red-700">
              This order has been cancelled.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = statuses.indexOf(
    status as OrderStatus
  );

  const activeIndex =
    currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="mt-5 rounded-xl border bg-gray-50 p-4 sm:p-5">
      <p className="mb-4 text-sm font-bold text-gray-900">
        Order Progress
      </p>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[650px] items-start">
          {statuses.map((item, index) => {
            const completed = index <= activeIndex;
            const isCurrent = index === activeIndex;
            const isLast =
              index === statuses.length - 1;

            return (
              <div
                key={item}
                className="flex flex-1 items-start"
              >
                <div className="flex min-w-0 flex-1 flex-col items-center">
                  <div
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold",
                      completed
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-300 bg-white text-gray-400",
                      isCurrent
                        ? "ring-4 ring-green-100"
                        : "",
                    ].join(" ")}
                  >
                    {completed ? "✓" : index + 1}
                  </div>

                  <p
                    className={[
                      "mt-2 text-center text-xs font-semibold leading-4",
                      completed
                        ? "text-green-700"
                        : "text-gray-400",
                    ].join(" ")}
                  >
                    {item}
                  </p>
                </div>

                {!isLast && (
                  <div
                    className={[
                      "mt-4 h-0.5 flex-1",
                      index < activeIndex
                        ? "bg-green-600"
                        : "bg-gray-300",
                    ].join(" ")}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Current status:{" "}
        <span className="font-semibold text-gray-700">
          {status}
        </span>
      </p>
    </div>
  );
}
