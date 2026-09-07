import { z } from 'zod';

export interface Address {
  id: string;
  fullName: string;
  mobileNumber: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  isDefault?: boolean;
}

export const addressFormSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name is too long'),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City name is too long'),
  addressLine1: z
    .string()
    .min(5, 'Flat/House No. must be at least 5 characters')
    .max(150, 'Address is too long'),
  addressLine2: z
    .string()
    .max(150, 'Address line 2 is too long')
    .optional(),
  landmark: z
    .string()
    .max(100, 'Landmark is too long')
    .optional(),
  state: z
    .string()
    .min(2, 'Please select a state')
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;

export interface CartItemProduct {
  id: string;
  name: string;
  service: string;
  price: number;
  originalPrice: number;
  discount: number | string;
  image: string;
}

export interface CartItemEntry {
  product: CartItemProduct;
  quantity: number;
}
