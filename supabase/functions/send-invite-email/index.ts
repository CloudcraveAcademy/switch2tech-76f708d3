import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    // Get the instructor ID from the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header found');
    }

    // Parse the JWT to get user info
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Create invitation record in the database
    const { data: invitation, error: inviteError } = await supabase
      .from('course_invitations')
      .insert({
        email: email,
        first_name: firstName,
        last_name: lastName,
        message: message,
        instructor_name: instructorName,
        instructor_id: user.id,
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

    // Send invitation email using Resend
    const studentName = firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Student';
    const personalMessage = message ? `\n\nPersonal message from ${instructorName}:\n"${message}"` : '';
    
    const emailResponse = await resend.emails.send({
      from: "Course Platform <onboarding@resend.dev>",
      to: [email],
      subject: `You're invited to join a course by ${instructorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Course Invitation</h2>
          
          <p>Hello ${studentName},</p>
          
          <p>You've been invited by <strong>${instructorName}</strong> to join their course!</p>
          
          ${personalMessage ? `<div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">${personalMessage}</p>
          </div>` : ''}
          
          <p>To get started:</p>
          <ol>
            <li>Create an account on our platform</li>
            <li>Browse available courses</li>
            <li>Enroll in courses that interest you</li>
          </ol>
          
          <div style="margin: 30px 0;">
            <a href="${supabaseUrl.replace('https://', 'https://').replace('.supabase.co', '.lovableproject.com')}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Get Started
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            ${instructorName}<br>
            The Learning Platform Team
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Error sending email:', emailResponse.error);
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log('✅ Email sent successfully:', emailResponse);

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