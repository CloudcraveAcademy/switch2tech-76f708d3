import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteAccountRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId }: DeleteAccountRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get user email from auth.users
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserById(userId);
    
    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate deletion token
    const deletionToken = crypto.randomUUID();
    
    // Store deletion request in database
    const { error: insertError } = await supabaseClient
      .from('account_deletion_requests')
      .insert({
        user_id: userId,
        email: authUser.user.email,
        deletion_token: deletionToken,
      });

    if (insertError) {
      console.error("Error storing deletion request:", insertError);
      throw new Error("Failed to create deletion request");
    }

    // Create confirmation URL
    const confirmationUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/confirm-account-deletion?token=${deletionToken}`;

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "Switch2Tech <noreply@resend.dev>",
      to: [authUser.user.email],
      subject: "Confirm Account Deletion - Action Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Account Deletion Request</h1>
          <p>We received a request to delete your account. This action is permanent and cannot be undone.</p>
          
          <p><strong>What will be deleted:</strong></p>
          <ul>
            <li>Your profile and personal information</li>
            <li>Course enrollment records</li>
            <li>Assignment submissions and grades</li>
            <li>Discussion posts and comments</li>
            <li>All associated data</li>
          </ul>
          
          <p><strong>Important:</strong> If you are an instructor, your courses will remain active but your profile will be removed.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Confirm Account Deletion
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you did not request this deletion, please ignore this email or contact support immediately.
          </p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link in your browser:<br>
            ${confirmationUrl}
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Error sending email:", emailResponse.error);
      throw new Error("Failed to send confirmation email");
    }

    console.log(`Account deletion email sent to: ${authUser.user.email}`);

    return new Response(
      JSON.stringify({ 
        message: "Account deletion confirmation email sent",
        userId: userId,
        email: authUser.user.email
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
    console.error("Error in send-account-deletion-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);