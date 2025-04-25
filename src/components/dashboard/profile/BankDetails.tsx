
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProfileData } from "@/hooks/useProfileData";

interface BankDetailsProps {
  profileData: ProfileData;
  onBankDetailsChange: (field: string, value: string) => void;
}

const PAYSTACK_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "United Bank for Africa", code: "033" },
  { name: "Zenith Bank", code: "057" }
  // Add more banks as needed
];

const PAYOUT_FREQUENCIES = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "On-Demand", value: "on-demand" }
];

const BankDetails: React.FC<BankDetailsProps> = ({ profileData, onBankDetailsChange }) => {
  const getVerificationStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Account Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Select
              value={profileData.bank_name || ''}
              onValueChange={(value) => onBankDetailsChange('bank_name', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                {PAYSTACK_BANKS.map((bank) => (
                  <SelectItem key={bank.code} value={bank.name}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={profileData.account_number || ''}
              onChange={(e) => onBankDetailsChange('account_number', e.target.value)}
              placeholder="Enter your account number"
              maxLength={10}
            />
          </div>

          <div>
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              value={profileData.account_name || ''}
              disabled
              placeholder="Auto-filled after verification"
            />
          </div>

          <div>
            <Label>Verification Status</Label>
            <div className="mt-1">
              <Badge className={getVerificationStatusColor(profileData.bank_verification_status)}>
                {profileData.bank_verification_status?.charAt(0).toUpperCase()}
                {profileData.bank_verification_status?.slice(1) || 'Pending'}
              </Badge>
            </div>
          </div>

          <div>
            <Label>Payout Frequency</Label>
            <Select
              value={profileData.payout_frequency || 'monthly'}
              onValueChange={(value) => onBankDetailsChange('payout_frequency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payout frequency" />
              </SelectTrigger>
              <SelectContent>
                {PAYOUT_FREQUENCIES.map((frequency) => (
                  <SelectItem key={frequency.value} value={frequency.value}>
                    {frequency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {profileData.paystack_recipient_code && (
            <div>
              <Label>Recipient Code</Label>
              <Input
                value={profileData.paystack_recipient_code}
                disabled
                className="bg-gray-50"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BankDetails;
