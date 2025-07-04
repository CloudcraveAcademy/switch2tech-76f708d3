
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SupportTicketDetails = () => {
  const { ticketId } = useParams();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Support Ticket Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Details for ticket: {ticketId}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTicketDetails;
