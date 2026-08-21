import type { Artwork, ShippingMethod, ShippingSettings } from '@/types/domain';

export function resolveShippingMethod(artwork: Artwork, settings: ShippingSettings): ShippingMethod {
  return artwork.shippingMethodOverride ?? settings.defaultMethod;
}

export function shippingMethodLabel(method: ShippingMethod, settings: ShippingSettings): string {
  switch (method) {
    case 'included':
      return 'Shipping included in the price';
    case 'flat_rate':
      return settings.flatRateCents
        ? `Flat-rate shipping: R ${(settings.flatRateCents / 100).toLocaleString('en-ZA')}`
        : 'Flat-rate shipping';
    case 'collection':
      return settings.collectionNote || 'Available for collection';
    case 'quote_required':
    default:
      return 'Shipping quote required — you will be contacted with a cost before payment is finalised';
  }
}
