
export interface Country {
  code: string;
  name: string;
  phoneCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', phoneCode: '+1', flag: '🇺🇸' },
  { code: 'NG', name: 'Nigeria', phoneCode: '+234', flag: '🇳🇬' },
  { code: 'GB', name: 'United Kingdom', phoneCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', phoneCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', phoneCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', phoneCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', phoneCode: '+33', flag: '🇫🇷' },
  { code: 'IN', name: 'India', phoneCode: '+91', flag: '🇮🇳' },
  { code: 'ZA', name: 'South Africa', phoneCode: '+27', flag: '🇿🇦' },
  { code: 'KE', name: 'Kenya', phoneCode: '+254', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', phoneCode: '+233', flag: '🇬🇭' },
  { code: 'EG', name: 'Egypt', phoneCode: '+20', flag: '🇪🇬' },
  { code: 'BR', name: 'Brazil', phoneCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', phoneCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', phoneCode: '+54', flag: '🇦🇷' },
  { code: 'JP', name: 'Japan', phoneCode: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', phoneCode: '+86', flag: '🇨🇳' },
  { code: 'KR', name: 'South Korea', phoneCode: '+82', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', phoneCode: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', phoneCode: '+60', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', phoneCode: '+66', flag: '🇹🇭' },
  { code: 'PH', name: 'Philippines', phoneCode: '+63', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', phoneCode: '+62', flag: '🇮🇩' },
  { code: 'VN', name: 'Vietnam', phoneCode: '+84', flag: '🇻🇳' },
  { code: 'ES', name: 'Spain', phoneCode: '+34', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', phoneCode: '+39', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', phoneCode: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', phoneCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', phoneCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', phoneCode: '+43', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', phoneCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', phoneCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', phoneCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', phoneCode: '+358', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', phoneCode: '+48', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', phoneCode: '+420', flag: '🇨🇿' },
  { code: 'PT', name: 'Portugal', phoneCode: '+351', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', phoneCode: '+30', flag: '🇬🇷' },
  { code: 'TR', name: 'Turkey', phoneCode: '+90', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', phoneCode: '+7', flag: '🇷🇺' },
  { code: 'UAE', name: 'United Arab Emirates', phoneCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', phoneCode: '+966', flag: '🇸🇦' },
  { code: 'IL', name: 'Israel', phoneCode: '+972', flag: '🇮🇱' },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find(country => country.code === code);
};

export const getCountryByName = (name: string): Country | undefined => {
  return COUNTRIES.find(country => country.name.toLowerCase() === name.toLowerCase());
};
