
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PaymentGatewaysManager = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Payment Gateways Manager</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Payment Gateways</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Payment gateways management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentGatewaysManager;
