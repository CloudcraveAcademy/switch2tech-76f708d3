
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SupportTicketDetails = () => {
  const { ticketId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Support Ticket Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ticket ID: {ticketId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Support ticket details functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTicketDetails;
