import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        `<html><body><h1>Invalid Request</h1><p>Missing deletion token.</p></body></html>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find the deletion request
    const { data: deletionRequest, error: findError } = await supabaseClient
      .from('account_deletion_requests')
      .select('*')
      .eq('deletion_token', token)
      .eq('status', 'pending')
      .single();

    if (findError || !deletionRequest) {
      return new Response(
        `<html><body><h1>Invalid or Expired Link</h1><p>This deletion link is invalid or has already been used.</p></body></html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    // Check if token has expired
    const expiresAt = new Date(deletionRequest.expires_at);
    if (expiresAt < new Date()) {
      return new Response(
        `<html><body><h1>Link Expired</h1><p>This deletion link has expired. Please request a new one.</p></body></html>`,
        {
          status: 410,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    // Mark deletion request as confirmed
    const { error: updateError } = await supabaseClient
      .from('account_deletion_requests')
      .update({ 
        status: 'confirmed', 
        confirmed_at: new Date().toISOString() 
      })
      .eq('id', deletionRequest.id);

    if (updateError) {
      console.error("Error updating deletion request:", updateError);
      throw new Error("Failed to confirm deletion request");
    }

    // Start the deletion process
    await deleteUserData(supabaseClient, deletionRequest.user_id);

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Deletion Confirmed - Switch2Tech</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://acmfhyqvqdhnmmnblrdh.supabase.co/storage/v1/object/public/avatars/46f46751-2285-4ad6-9c49-da2565a6ffbd.png" 
                 alt="Switch2Tech Academy" 
                 style="height: 60px; width: auto;" />
          </div>
          
          <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #dc2626; margin-top: 0; text-align: center;">Account Deletion Confirmed</h1>
            <p style="font-size: 16px; line-height: 1.6;">Your account deletion has been confirmed and is being processed.</p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #991b1b;">What happens next:</p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Your account will be permanently deleted within 24 hours</li>
                <li>All your personal data will be removed from our systems</li>
                <li>You will no longer be able to access your account</li>
              </ul>
            </div>
            
            <p style="color: #666; margin-top: 30px; text-align: center; font-size: 14px;">
              If you change your mind, please contact our support team immediately at 
              <a href="mailto:support@switch2tech.net" style="color: #2563eb;">support@switch2tech.net</a>
            </p>
          </div>
          
          <footer style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
            <p>© 2024 Switch2Tech Academy. All rights reserved.</p>
          </footer>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 
          "Content-Type": "text/html; charset=utf-8", 
          ...corsHeaders 
        },
      }
    );

  } catch (error: any) {
    console.error("Error in confirm-account-deletion function:", error);
    return new Response(
      `<html><body><h1>Error</h1><p>An error occurred while processing your request. Please contact support.</p></body></html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );
  }
};

async function deleteUserData(supabaseClient: any, userId: string) {
  try {
    console.log(`Starting deletion process for user: ${userId}`);

    // Delete in order to respect foreign key constraints
    const tables = [
      'assignment_submissions',
      'quiz_submissions', 
      'course_ratings',
      'discussion_posts',
      'comments',
      'class_attendance',
      'enrollments',
      'certificates',
      'payment_transactions',
      'support_tickets',
      'ticket_responses',
      'instructor_payouts',
      'course_announcements',
      'course_materials',
      'lessons',
      'assignments',
      'quizzes',
      'quiz_questions',
      'discussion_boards',
      'class_sessions',
      'courses', // Delete courses last (instructor's courses)
      'user_profiles'
    ];

    // Delete data from each table
    for (const table of tables) {
      try {
        let deleteQuery;
        
        // Handle different user reference patterns
        if (table === 'courses') {
          deleteQuery = supabaseClient.from(table).delete().eq('instructor_id', userId);
        } else if (table === 'enrollments') {
          deleteQuery = supabaseClient.from(table).delete().eq('student_id', userId);
        } else if (table === 'instructor_payouts') {
          deleteQuery = supabaseClient.from(table).delete().eq('instructor_id', userId);
        } else if (table === 'course_announcements') {
          // Delete announcements for courses owned by the user
          const { data: userCourses } = await supabaseClient
            .from('courses')
            .select('id')
            .eq('instructor_id', userId);
          
          if (userCourses && userCourses.length > 0) {
            const courseIds = userCourses.map((course: any) => course.id);
            deleteQuery = supabaseClient.from(table).delete().in('course_id', courseIds);
          } else {
            continue; // Skip if no courses
          }
        } else {
          deleteQuery = supabaseClient.from(table).delete().eq('user_id', userId);
        }

        const { error } = await deleteQuery;
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
          // Continue with other tables even if one fails
        } else {
          console.log(`Successfully deleted data from ${table}`);
        }
      } catch (tableError) {
        console.error(`Error processing table ${table}:`, tableError);
        // Continue with other tables
      }
    }

    // Finally, delete the user from auth.users
    const { error: authError } = await supabaseClient.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("Error deleting auth user:", authError);
    } else {
      console.log("Successfully deleted auth user");
    }

    console.log(`Completed deletion process for user: ${userId}`);
  } catch (error) {
    console.error("Error in deleteUserData:", error);
    throw error;
  }
}

serve(handler);