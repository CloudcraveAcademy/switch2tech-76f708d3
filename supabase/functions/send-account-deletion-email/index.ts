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
      from: "onboarding@resend.dev",
      to: [authUser.user.email],
      subject: "Confirm Account Deletion - Action Required",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Deletion Request - Switch2Tech</title>
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://acmfhyqvqdhnmmnblrdh.supabase.co/storage/v1/object/public/avatars/46f46751-2285-4ad6-9c49-da2565a6ffbd.png" 
                   alt="Switch2Tech Academy" 
                   style="height: 60px; width: auto;" />
            </div>
            
            <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h1 style="color: #dc2626; margin-top: 0; text-align: center;">Account Deletion Request</h1>
              <p style="font-size: 16px; line-height: 1.6;">We received a request to delete your account. This action is permanent and cannot be undone.</p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #991b1b;">What will be deleted:</p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Your profile and personal information</li>
                  <li>Course enrollment records</li>
                  <li>Assignment submissions and grades</li>
                  <li>Discussion posts and comments</li>
                  <li>All associated data</li>
                </ul>
              </div>
              
              <p style="font-weight: bold; color: #991b1b; margin: 20px 0;">Important: If you are an instructor, your courses will remain active but your profile will be removed.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" 
                   style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Confirm Account Deletion
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; text-align: center;">
                This link will expire in 24 hours. If you did not request this deletion, please ignore this email or contact support immediately at 
                <a href="mailto:support@switch2tech.net" style="color: #2563eb;">support@switch2tech.net</a>
              </p>
              
              <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
                If the button doesn't work, copy and paste this link in your browser:<br>
                <a href="${confirmationUrl}" style="color: #2563eb; word-break: break-all;">${confirmationUrl}</a>
              </p>
            </div>
            
            <footer style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
              <p>© 2024 Switch2Tech Academy. All rights reserved.</p>
            </footer>
          </body>
        </html>
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