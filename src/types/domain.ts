export type AvailabilityStatus =
  | 'draft'
  | 'gallery_only'
  | 'available'
  | 'reserved'
  | 'sold'
  | 'private_collection';
export type PublishingStatus = 'draft' | 'published' | 'archived';
export type ShippingMethod = 'included' | 'flat_rate' | 'collection' | 'quote_required';

export interface Category {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
}

export type ArtworkImageRole = 'detail' | 'signature' | 'side_angle' | 'lifestyle_illustrative';

export interface ArtworkImage {
  id: string;
  imagePath: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  role: ArtworkImageRole;
}

export interface Artwork {
  id: string;
  rank: number;
  slug: string;
  publicTitle: string;
  workingDescription: string | null;
  publicDescription: string | null;
  category: Category | null;
  widthCm: number | null;
  heightCm: number | null;
  medium: string | null;
  surface: string | null;
  framed: boolean | null;
  priceCents: number | null;
  availabilityStatus: AvailabilityStatus;
  publishingStatus: PublishingStatus;
  isFeatured: boolean;
  isHero: boolean;
  isNew: boolean;
  displayOrder: number | null;
  primaryImagePath: string | null;
  primaryImageWidth: number | null;
  primaryImageHeight: number | null;
  altText: string | null;
  shippingMethodOverride: ShippingMethod | null;
  additionalImages: ArtworkImage[];
  createdAt: string;
  updatedAt: string;

  /** Short teaser shown on gallery/card views; falls back to a truncated publicDescription. */
  shortCardCopy: string | null;
  /** Overrides the generated <title> for this artwork's page when set. */
  seoTitle: string | null;
  /** Trust facts — null means "not yet known," never assumed. */
  signed: boolean | null;
  varnished: boolean | null;
  certificateOfAuthenticity: boolean | null;
}

/** Admin-only view — includes internal business fields. Never sent to public pages. */
export interface ArtworkAdmin extends Artwork {
  adminEdited: boolean;
  internalLaunchPriority: string | null;
  internalSellabilityTier: string | null;
  internalSellingNote: string | null;
  internalNotes: string | null;
  /** The pre-consolidation category name (e.g. "Coastal / Waves"), kept for internal reference only. */
  internalCategoryTag: string | null;
  titleNeedsArtistApproval: boolean;
  copyNeedsArtistApproval: boolean;
}

export interface ArtistProfileSettings {
  name: string;
  professionalDescription: string;
  basedIn: string;
  commissionsOpen: boolean;
  introLine: string;
  bioParagraphs: string[];
  signatureName: string;
  studioImagePath: string | null;
  studioImageAlt: string | null;
}

export interface ContactSettings {
  phoneDisplay: string;
  phoneLink: string;
  email: string;
  emailLink: string;
  facebookUrl: string;
  facebookLabel: string;
  instagramUrl: string;
  instagramHandle: string;
  instagramLabel: string;
  location: string;
}

export interface HomepageCopySettings {
  eyebrow: string;
  headline: string;
  supportingCopy: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  commissionsCtaLabel: string;
  commissionsCtaHref: string;
}

export interface ShippingSettings {
  defaultMethod: ShippingMethod;
  flatRateCents: number | null;
  collectionNote: string | null;
  reservationMinutes: number;
  quoteApprovedReservationMinutes: number;
}

export interface PoliciesSettings {
  needsCompletion: boolean;
  privacyPolicy: string;
  terms: string;
  shippingCollection: string;
  returnsRefunds: string;
  copyright: string;
  lastUpdated: string;
}

export interface SeoSettings {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
}

export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'quote_required'
  | 'reserved'
  | 'awaiting_payment'
  | 'paid'
  | 'sold'
  | 'cancelled'
  | 'expired'
  | 'refunded';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingMethod: ShippingMethod;
  shippingAddress: Record<string, string> | null;
  artworkPriceCents: number;
  shippingCents: number | null;
  totalCents: number | null;
  payfastPaymentId: string | null;
  payfastPfPaymentId: string | null;
  createdAt: string;
  expiresAt: string | null;
}
