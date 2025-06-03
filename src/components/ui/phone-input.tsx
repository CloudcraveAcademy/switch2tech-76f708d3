
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES, Country } from "@/utils/countries";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  defaultCountry?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Enter phone number",
  defaultCountry = "US"
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(c => c.code === defaultCountry) || COUNTRIES[0]
  );

  // Extract phone number without country code
  const getPhoneNumber = (fullValue: string) => {
    if (fullValue.startsWith(selectedCountry.phoneCode)) {
      return fullValue.substring(selectedCountry.phoneCode.length);
    }
    return fullValue;
  };

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      const phoneNumber = getPhoneNumber(value);
      onChange(country.phoneCode + phoneNumber);
    }
  };

  const handlePhoneChange = (phoneNumber: string) => {
    // Remove any non-digit characters except the plus sign
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    onChange(selectedCountry.phoneCode + cleanPhone);
  };

  return (
    <div className="flex">
      <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[140px] rounded-r-none border-r-0">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{selectedCountry.flag}</span>
              <span className="text-sm">{selectedCountry.phoneCode}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {COUNTRIES.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span className="text-muted-foreground">{country.phoneCode}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        placeholder={placeholder}
        value={getPhoneNumber(value)}
        onChange={(e) => handlePhoneChange(e.target.value)}
        className="rounded-l-none"
      />
    </div>
  );
};
