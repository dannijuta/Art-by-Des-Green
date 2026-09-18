import { z } from 'zod';

export const enquiryReasons = [
  'availability',
  'purchase',
  'commission',
  'shipping',
  'general',
] as const;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  reason: z.enum(enquiryReasons, { message: 'Please choose a reason for your enquiry.' }),
  artworkId: z.string().uuid().optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Please add a short message (at least 10 characters).').max(4000),
  consent: z
    .union([z.literal('on'), z.literal('true'), z.boolean()])
    .refine((v) => v === 'on' || v === 'true' || v === true, {
      message: 'Please confirm you are happy for us to contact you about this enquiry.',
    }),
  honeypot: z.string().max(0, 'Spam detected.').optional().or(z.literal('')),
});

export const commissionFormSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  preferredContactMethod: z.string().trim().max(60).optional().or(z.literal('')),
  subject: z.string().trim().min(5, 'Please tell Des a little about the subject or idea.').max(2000),
  preferredDimensions: z.string().trim().max(120).optional().or(z.literal('')),
  budgetRange: z.string().trim().max(120).optional().or(z.literal('')),
  desiredCompletionDate: z.string().trim().max(120).optional().or(z.literal('')),
  additionalInfo: z.string().trim().max(4000).optional().or(z.literal('')),
  consent: z
    .union([z.literal('on'), z.literal('true'), z.boolean()])
    .refine((v) => v === 'on' || v === 'true' || v === true, {
      message: 'Please confirm you are happy for us to contact you about this commission.',
    }),
  honeypot: z.string().max(0, 'Spam detected.').optional().or(z.literal('')),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const artworkAvailabilityStatuses = ['draft', 'gallery_only', 'available', 'reserved', 'sold'] as const;
export const artworkPublishingStatuses = ['draft', 'published', 'archived'] as const;
export const shippingMethods = ['included', 'flat_rate', 'collection', 'quote_required'] as const;

export const artworkAdminSchema = z.object({
  publicTitle: z.string().trim().min(1, 'Title is required.').max(200),
  workingDescription: z.string().trim().max(400).optional().or(z.literal('')),
  publicDescription: z.string().trim().max(4000).optional().or(z.literal('')),
  categoryId: z.string().optional().or(z.literal('')),
  widthCm: z.string().optional().or(z.literal('')),
  heightCm: z.string().optional().or(z.literal('')),
  medium: z.string().trim().max(120).optional().or(z.literal('')),
  surface: z.string().trim().max(120).optional().or(z.literal('')),
  framed: z.enum(['yes', 'no', 'unknown']).optional(),
  priceRand: z.string().optional().or(z.literal('')),
  availabilityStatus: z.enum(artworkAvailabilityStatuses),
  publishingStatus: z.enum(artworkPublishingStatuses),
  isFeatured: z.union([z.literal('on'), z.boolean()]).optional(),
  isHero: z.union([z.literal('on'), z.boolean()]).optional(),
  isNew: z.union([z.literal('on'), z.boolean()]).optional(),
  shippingMethodOverride: z.enum(shippingMethods).optional().or(z.literal('')),
  altText: z.string().trim().max(300).optional().or(z.literal('')),
});

export const checkoutFormSchema = z.object({
  artworkId: z.string().uuid(),
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  addressLine1: z.string().trim().max(200).optional().or(z.literal('')),
  addressLine2: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().max(120).optional().or(z.literal('')),
  postalCode: z.string().trim().max(20).optional().or(z.literal('')),
  province: z.string().trim().max(120).optional().or(z.literal('')),
  country: z.string().trim().max(120).optional().or(z.literal('')),
  consent: z
    .union([z.literal('on'), z.literal('true'), z.boolean()])
    .refine((v) => v === 'on' || v === 'true' || v === true, {
      message: 'Please confirm you agree to proceed with this purchase.',
    }),
  honeypot: z.string().max(0, 'Spam detected.').optional().or(z.literal('')),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type CommissionFormInput = z.infer<typeof commissionFormSchema>;
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
