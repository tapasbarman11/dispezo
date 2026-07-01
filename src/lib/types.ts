export type OnboardingStep = 1 | 2 | 3;

export interface OnboardingData {
  // Step 1 – Profile
  countryCode: string;
  phoneNumber: string;
  otpSent: boolean;
  otp: string;
  otpVerified: boolean;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  // Step 2 – Business
  businessName: string;
  businessType: string;
  website: string;
  // Step 3 – WhatsApp
  whatsappConnected: boolean;
}

export const INITIAL_DATA: OnboardingData = {
  countryCode: '+91',
  phoneNumber: '',
  otpSent: false,
  otp: '',
  otpVerified: false,
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  businessName: '',
  businessType: '',
  website: '',
  whatsappConnected: false,
};

export const COUNTRY_CODES = [
  { code: '+91', label: '+91', country: 'IN' },
  { code: '+1', label: '+1', country: 'US/CA' },
  { code: '+44', label: '+44', country: 'GB' },
  { code: '+971', label: '+971', country: 'AE' },
  { code: '+65', label: '+65', country: 'SG' },
  { code: '+60', label: '+60', country: 'MY' },
  { code: '+61', label: '+61', country: 'AU' },
  { code: '+49', label: '+49', country: 'DE' },
  { code: '+33', label: '+33', country: 'FR' },
  { code: '+81', label: '+81', country: 'JP' },
  { code: '+55', label: '+55', country: 'BR' },
  { code: '+27', label: '+27', country: 'ZA' },
  { code: '+234', label: '+234', country: 'NG' },
];

export const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'United Arab Emirates',
  'Singapore', 'Malaysia', 'Australia', 'Germany', 'France', 'Canada',
  'Japan', 'Brazil', 'South Africa', 'Nigeria', 'Other',
];

export const BUSINESS_TYPES = [
    { id: "ecommerce", label: "E-Commerce", icon: "🛒" },
  { id: "finance", label: "Finance", icon: "🏦" },
  { id: "healthcare", label: "Healthcare", icon: "🏥" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "realestate", label: "Real Estate", icon: "🏘️" },
  { id: "beauty", label: "Beauty & Salon", icon: "💅" },
  { id: "restaurant", label: "Restaurant", icon: "🍽️" },
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "retail", label: "Retail Store", icon: "🏬" },
  { id: "fitness", label: "Fitness", icon: "🏋️" },
  { id: "automotive", label: "Automotive", icon: "🚗" },
  { id: "professional", label: "Professional Services", icon: "💼" },
  { id: "technology", label: "Technology", icon: "💻" },
  { id: "manufacturing", label: "Manufacturing", icon: "🏭" },
  { id: "other", label: "Other", icon: "⚡" },
];