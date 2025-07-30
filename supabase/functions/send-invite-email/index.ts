import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  message: string;
  instructorName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, message, instructorName }: InviteEmailRequest = await req.json();

    console.log('📧 Sending invite email to:', email);
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // For now, we'll create a simple invitation record in the database
    // In a real implementation, you would integrate with an email service like Resend
    const { data: invitation, error: inviteError } = await supabase
      .from('course_invitations')
      .insert({
        email: email,
        first_name: firstName,
        last_name: lastName,
        message: message,
        instructor_name: instructorName,
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      throw inviteError;
    }

    console.log('✅ Invitation created successfully:', invitation);

    // TODO: Integrate with email service (Resend) to actually send the email
    // For now, we're just creating the database record
    console.log('📨 Email would be sent to:', email, 'with invitation details');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation sent successfully',
        invitationId: invitation.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);