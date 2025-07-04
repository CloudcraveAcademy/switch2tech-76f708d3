
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PaymentGatewaysManager = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Manage payment gateways</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentGatewaysManager;
