"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Address from "@/models/Address";

type AddressData = {
  label?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  instructions?: string;
  isDefault?: boolean;
};

function validateAddressData(data: AddressData) {
  const label = data.label?.trim() || "Home";
  const fullName = data.fullName?.trim() || "";
  const phone = data.phone?.trim() || "";
  const address = data.address?.trim() || "";
  const city = data.city?.trim() || "";
  const state = data.state?.trim() || "";
  const pincode = data.pincode?.trim() || "";
  const instructions = data.instructions?.trim() || "";

  if (label.length < 1 || label.length > 50) {
    return {
      success: false as const,
      message: "Address label must be between 1 and 50 characters.",
    };
  }

  if (fullName.length < 2 || fullName.length > 100) {
    return {
      success: false as const,
      message: "Full name must be between 2 and 100 characters.",
    };
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    return {
      success: false as const,
      message: "Please enter a valid 10-digit phone number.",
    };
  }

  if (address.length < 5 || address.length > 300) {
    return {
      success: false as const,
      message: "Address must be between 5 and 300 characters.",
    };
  }

  if (city.length < 1 || city.length > 100) {
    return {
      success: false as const,
      message: "City must be between 1 and 100 characters.",
    };
  }

  if (state.length < 1 || state.length > 100) {
    return {
      success: false as const,
      message: "State must be between 1 and 100 characters.",
    };
  }

  if (!/^[0-9]{6}$/.test(pincode)) {
    return {
      success: false as const,
      message: "Please enter a valid 6-digit pincode.",
    };
  }

  if (instructions.length > 500) {
    return {
      success: false as const,
      message:
        "Delivery instructions must be 500 characters or less.",
    };
  }

  return {
    success: true as const,
    data: {
      label,
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      instructions,
      isDefault: data.isDefault === true,
    },
  };
}

export async function createAddress(data: AddressData) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        message: "Authentication required.",
      };
    }

    if (user.role !== "customer") {
      return {
        success: false,
        message: "Customer access required.",
      };
    }

    const validation = validateAddressData(data);

    if (!validation.success) {
      return validation;
    }

    const validatedData = validation.data;

    await connectDB();

    const existingAddressCount = await Address.countDocuments({
      customer: user.id,
    });

    if (validatedData.isDefault) {
      await Address.updateMany(
        {
          customer: user.id,
          isDefault: true,
        },
        {
          $set: {
            isDefault: false,
          },
        },
      );
    }

    const shouldBeDefault =
      validatedData.isDefault ||
      existingAddressCount === 0;

    await Address.create({
      customer: user.id,
      ...validatedData,
      isDefault: shouldBeDefault,
    });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");

    return {
      success: true,
      message: "Address saved successfully.",
    };
  } catch (error) {
    console.error("CREATE ADDRESS ERROR:", error);

    return {
      success: false,
      message:
        "Something went wrong while saving the address.",
    };
  }
}

export async function updateAddress(
  addressId: string,
  data: AddressData,
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        message: "Authentication required.",
      };
    }

    if (user.role !== "customer") {
      return {
        success: false,
        message: "Customer access required.",
      };
    }

    if (!addressId) {
      return {
        success: false,
        message: "Address ID is required.",
      };
    }

    const validation = validateAddressData(data);

    if (!validation.success) {
      return validation;
    }

    const validatedData = validation.data;

    await connectDB();

    const address = await Address.findOne({
      _id: addressId,
      customer: user.id,
    });

    if (!address) {
      return {
        success: false,
        message: "Address not found.",
      };
    }

    if (validatedData.isDefault) {
      await Address.updateMany(
        {
          customer: user.id,
          _id: { $ne: addressId },
          isDefault: true,
        },
        {
          $set: {
            isDefault: false,
          },
        },
      );
    }

    address.label = validatedData.label;
    address.fullName = validatedData.fullName;
    address.phone = validatedData.phone;
    address.address = validatedData.address;
    address.city = validatedData.city;
    address.state = validatedData.state;
    address.pincode = validatedData.pincode;
    address.instructions = validatedData.instructions;
    address.isDefault = validatedData.isDefault;

    await address.save();

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");

    return {
      success: true,
      message: "Address updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE ADDRESS ERROR:", error);

    return {
      success: false,
      message:
        "Something went wrong while updating the address.",
    };
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        message: "Authentication required.",
      };
    }

    if (user.role !== "customer") {
      return {
        success: false,
        message: "Customer access required.",
      };
    }

    if (!addressId) {
      return {
        success: false,
        message: "Address ID is required.",
      };
    }

    await connectDB();

    const address = await Address.findOne({
      _id: addressId,
      customer: user.id,
    });

    if (!address) {
      return {
        success: false,
        message: "Address not found.",
      };
    }

    const wasDefault = address.isDefault;

    await Address.deleteOne({
      _id: addressId,
      customer: user.id,
    });

    if (wasDefault) {
      const replacement = await Address.findOne({
        customer: user.id,
      }).sort({
        createdAt: -1,
      });

      if (replacement) {
        replacement.isDefault = true;
        await replacement.save();
      }
    }

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");

    return {
      success: true,
      message: "Address deleted successfully.",
    };
  } catch (error) {
    console.error("DELETE ADDRESS ERROR:", error);

    return {
      success: false,
      message:
        "Something went wrong while deleting the address.",
    };
  }
}

