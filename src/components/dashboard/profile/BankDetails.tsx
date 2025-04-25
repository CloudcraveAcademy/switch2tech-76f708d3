
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ProfileData } from "@/hooks/useProfileData";

interface BankDetailsProps {
  profileData: ProfileData;
  onBankDetailsChange: (field: string, value: string) => void;
  onVerifyBankAccount: () => Promise<any>;
}

const PAYSTACK_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "United Bank for Africa", code: "033" },
  { name: "Zenith Bank", code: "057" },
  { name: "Sterling Bank", code: "232" },
  { name: "Wema Bank", code: "035" },
  { name: "Union Bank", code: "032" },
  { name: "Fidelity Bank", code: "070" },
  { name: "Ecobank", code: "050" },
  { name: "Stanbic IBTC", code: "221" }
];

const PAYOUT_FREQUENCIES = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "On-Demand", value: "on-demand" }
];

const BankDetails: React.FC<BankDetailsProps> = ({ profileData, onBankDetailsChange, onVerifyBankAccount }) => {
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(false);

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

  const handleVerification = async () => {
    if (!profileData.bank_name || !profileData.account_number) {
      toast({
        title: "Missing information",
        description: "Please provide both bank name and account number before verification.",
        variant: "destructive"
      });
      return;
    }

    try {
      setVerifying(true);
      await onVerifyBankAccount();
      toast({
        title: "Verification successful",
        description: "Your bank account has been verified successfully."
      });
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Failed to verify bank account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
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
            <div className="mt-1 flex items-center justify-between">
              <Badge className={getVerificationStatusColor(profileData.bank_verification_status)}>
                {profileData.bank_verification_status?.charAt(0).toUpperCase()}
                {profileData.bank_verification_status?.slice(1) || 'Pending'}
              </Badge>

              {profileData.bank_verification_status !== 'verified' && (
                <Button 
                  size="sm" 
                  onClick={handleVerification} 
                  disabled={verifying || !profileData.bank_name || !profileData.account_number}
                >
                  {verifying ? "Verifying..." : "Verify Account"}
                </Button>
              )}
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
