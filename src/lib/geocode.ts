export interface Address {
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    const data = await response.json();
    if (data && data.address) {
      const address: Address = data.address;
      // Build a formatted address string, prioritizing more specific details.
      const addressParts = [
        address.road,
        address.neighbourhood,
        address.suburb,
        address.city,
        address.postcode,
        address.state,
      ];
      return addressParts.filter(Boolean).join(', ');
    }
    return 'Could not find address for this location.';
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return 'Failed to fetch address details.';
  }
}
