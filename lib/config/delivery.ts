function getNumberFromEnv(
  name: string,
  fallback: number
): number {
  const value = Number(process.env[name]);

  if (!Number.isFinite(value) || value < 0) {
    return fallback;
  }

  return value;
}

const deliveryFee = getNumberFromEnv(
  "DELIVERY_FEE",
  50
);

const freeDeliveryThreshold = getNumberFromEnv(
  "FREE_DELIVERY_THRESHOLD",
  1000
);

const minimumOrderAmount = getNumberFromEnv(
  "MINIMUM_ORDER_AMOUNT",
  0
);

const serviceablePincodes =
  process.env.SERVICEABLE_PINCODES
    ?.split(",")
    .map((pincode) => pincode.trim())
    .filter(Boolean) || [];

export const deliveryConfig = {
  deliveryFee,
  freeDeliveryThreshold,
  minimumOrderAmount,
  serviceablePincodes,
};

export function calculateDeliveryFee(
  subtotal: number
): number {
  if (
    subtotal >=
    deliveryConfig.freeDeliveryThreshold
  ) {
    return 0;
  }

  return deliveryConfig.deliveryFee;
}

export function isPincodeServiceable(
  pincode: string
): boolean {
  if (
    deliveryConfig.serviceablePincodes.length === 0
  ) {
    return true;
  }

  return deliveryConfig.serviceablePincodes.includes(
    pincode
  );
}