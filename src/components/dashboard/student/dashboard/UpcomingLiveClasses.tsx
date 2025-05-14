
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video } from "lucide-react";
import { formatDate, formatDistanceToNow } from "@/lib/utils";
import { LiveClassSchedule } from "../LiveClassSchedule";

const UpcomingLiveClasses = () => {
  const { user } = useAuth();

  // We're using the LiveClassSchedule component directly
  return <LiveClassSchedule />;
};

export default UpcomingLiveClasses;
