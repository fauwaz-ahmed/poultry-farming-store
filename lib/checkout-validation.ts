export type CheckoutData = {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  instructions?: string;
};

export function validateCheckoutData(
  data: CheckoutData
) {
  const fullName =
    data.fullName?.trim() || "";

  const phone =
    data.phone?.trim() || "";

  const email =
    data.email?.trim().toLowerCase() || "";

  const address =
    data.address?.trim() || "";

  const city =
    data.city?.trim() || "";

  const state =
    data.state?.trim() || "";

  const pincode =
    data.pincode?.trim() || "";

  const instructions =
    data.instructions?.trim() || "";

  if (!fullName) {
    return {
      success: false,
      message: "Full name is required.",
    };
  }

  if (fullName.length < 2 || fullName.length > 100) {
    return {
      success: false,
      message:
        "Full name must be between 2 and 100 characters.",
    };
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    return {
      success: false,
      message:
        "Please enter a valid 10-digit phone number.",
    };
  }

  if (email) {
    if (
      email.length > 150 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return {
        success: false,
        message:
          "Please enter a valid email address.",
      };
    }
  }

  if (!address) {
    return {
      success: false,
      message: "Address is required.",
    };
  }

  if (
    address.length < 5 ||
    address.length > 300
  ) {
    return {
      success: false,
      message:
        "Address must be between 5 and 300 characters.",
    };
  }

  if (!city) {
    return {
      success: false,
      message: "City is required.",
    };
  }

  if (city.length > 100) {
    return {
      success: false,
      message:
        "City must be 100 characters or less.",
    };
  }

  if (!state) {
    return {
      success: false,
      message: "State is required.",
    };
  }

  if (state.length > 100) {
    return {
      success: false,
      message:
        "State must be 100 characters or less.",
    };
  }

  if (!/^[0-9]{6}$/.test(pincode)) {
    return {
      success: false,
      message:
        "Please enter a valid 6-digit pincode.",
    };
  }

  if (instructions.length > 500) {
    return {
      success: false,
      message:
        "Delivery instructions must be 500 characters or less.",
    };
  }

  return {
    success: true,
    data: {
      fullName,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      instructions,
    },
  };
}