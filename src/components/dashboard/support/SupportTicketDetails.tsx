
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SupportTicketDetails = () => {
  const { ticketId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Support Ticket Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ticket ID: {ticketId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Support ticket details will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTicketDetails;
