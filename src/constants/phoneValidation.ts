export const PHONE_LENGTHS: Record<string, number | number[]> = {
  '+998': [7, 9], // Uzbekistan (User requested 7, standard is 9)
  '+1': 10,  // USA/Canada
  '+44': 10, // UK
  '+7': 10,  // Russia/Kazakhstan
  '+971': 9, // UAE
  '+966': 9, // Saudi Arabia
  '+90': 10, // Turkey
  '+49': [10, 11], // Germany
  '+33': 9,  // France
  '+39': 10, // Italy
  '+34': 9,  // Spain
  '+81': 10, // Japan
  '+82': 10, // South Korea
  '+86': 11, // China
  '+91': 10, // India
  '+61': 9,  // Australia
  '+64': [8, 9, 10], // New Zealand
  '+27': 9,  // South Africa
  '+55': [10, 11], // Brazil
  '+52': 10, // Mexico
  '+54': 10, // Argentina
  '+92': 10, // Pakistan
  '+880': 10, // Bangladesh
  '+62': [9, 10, 11], // Indonesia
  '+63': 10, // Philippines
  '+66': 9,  // Thailand
  '+84': 9,  // Vietnam
  '+60': [9, 10], // Malaysia
  '+65': 8,  // Singapore
  '+31': 9,  // Netherlands
  '+41': 9,  // Switzerland
  '+46': [7, 8, 9], // Sweden
  '+47': 8,  // Norway
  '+45': 8,  // Denmark
  '+358': [5, 6, 7, 8, 9, 10, 11, 12], // Finland (very variable)
  '+351': 9, // Portugal
  '+30': 10, // Greece
  '+32': 9,  // Belgium
  '+43': [10, 11], // Austria
  '+48': 9,  // Poland
  '+420': 9, // Czech Republic
  '+36': 9,  // Hungary
  '+40': 9,  // Romania
  '+380': 9, // Ukraine
};

export const validatePhoneNumber = (countryCode: string, number: string): boolean => {
  const cleanNumber = number.replace(/\D/g, '');
  const expectedLength = PHONE_LENGTHS[countryCode];
  
  if (!expectedLength) return cleanNumber.length >= 7 && cleanNumber.length <= 15; // Fallback for unknown codes
  
  if (Array.isArray(expectedLength)) {
    return expectedLength.includes(cleanNumber.length);
  }
  
  return cleanNumber.length === expectedLength;
};
