import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  classSessionId: string;
  instructorId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { classSessionId, instructorId }: ReminderRequest = await req.json();
    console.log('📧 Processing live class reminder for session:', classSessionId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get class session details
    const { data: classSession, error: sessionError } = await supabase
      .from('class_sessions')
      .select(`
        id,
        topic,
        start_time,
        end_time,
        meeting_link,
        course_id,
        courses:course_id (
          title,
          instructor_id
        )
      `)
      .eq('id', classSessionId)
      .single();

    if (sessionError || !classSession) {
      console.error('❌ Error fetching class session:', sessionError);
      throw new Error('Class session not found');
    }

    // Verify instructor owns this class
    if (classSession.courses.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only send reminders for your own classes');
    }

    // Get enrolled students for this course
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('enrollments')
      .select(`
        student_id,
        user_profiles:student_id (
          first_name,
          last_name
        )
      `)
      .eq('course_id', classSession.course_id);

    if (enrollmentError) {
      console.error('❌ Error fetching enrollments:', enrollmentError);
      throw new Error('Failed to fetch enrolled students');
    }

    if (!enrollments || enrollments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No enrolled students found for this course' }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get student emails
    const studentIds = enrollments.map(e => e.student_id);
    const { data: studentEmails, error: emailError } = await supabase
      .rpc('get_user_emails', { user_ids: studentIds, instructor_id: instructorId });

    if (emailError) {
      console.error('❌ Error fetching student emails:', emailError);
      throw new Error('Failed to fetch student emails');
    }

    // Create in-app notifications for all students
    const notifications = enrollments.map(enrollment => ({
      user_id: enrollment.student_id,
      type: 'live_class_reminder',
      title: 'Live Class Reminder',
      description: `Don't forget about the upcoming live class "${classSession.topic}" for ${classSession.courses.title}`,
      action_url: '/dashboard/live-classes',
      course_id: classSession.course_id,
      metadata: {
        class_session_id: classSessionId,
        topic: classSession.topic,
        start_time: classSession.start_time,
        meeting_link: classSession.meeting_link
      }
    }));

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('❌ Error creating notifications:', notificationError);
    } else {
      console.log('✅ Created', notifications.length, 'in-app notifications');
    }

    // Send emails if Resend API key is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey && studentEmails) {
      const resend = new Resend(resendApiKey);
      
      // Format date and time
      const startDate = new Date(classSession.start_time);
      const endDate = new Date(classSession.end_time);
      const formattedDate = startDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const formattedTime = `${startDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      })} - ${endDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      })}`;

      // Create a map of student emails to names
      const emailToNameMap = new Map();
      enrollments.forEach(enrollment => {
        const email = studentEmails.find(e => e.id === enrollment.student_id)?.email;
        if (email) {
          const fullName = enrollment.user_profiles?.first_name && enrollment.user_profiles?.last_name 
            ? `${enrollment.user_profiles.first_name} ${enrollment.user_profiles.last_name}`
            : 'Student';
          emailToNameMap.set(email, fullName);
        }
      });

      // Send individual emails
      let emailsSent = 0;
      for (const [email, studentName] of emailToNameMap) {
        try {
          const emailResponse = await resend.emails.send({
            from: "Course Platform <onboarding@resend.dev>",
            to: [email],
            subject: `Reminder: Live Class "${classSession.topic}" - ${classSession.courses.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h1 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Live Class Reminder</h1>
                  
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Hi ${studentName},
                  </p>
                  
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    This is a friendly reminder about your upcoming live class:
                  </p>
                  
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                    <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">${classSession.topic}</h2>
                    <p style="color: #6b7280; margin: 5px 0; font-size: 14px;"><strong>Course:</strong> ${classSession.courses.title}</p>
                    <p style="color: #6b7280; margin: 5px 0; font-size: 14px;"><strong>Date:</strong> ${formattedDate}</p>
                    <p style="color: #6b7280; margin: 5px 0; font-size: 14px;"><strong>Time:</strong> ${formattedTime}</p>
                  </div>
                  
                  ${classSession.meeting_link ? `
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${classSession.meeting_link}" 
                         style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                        Join Live Class
                      </a>
                    </div>
                  ` : ''}
                  
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Make sure to join a few minutes early to test your connection. We look forward to seeing you in class!
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                  
                  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                    This is an automated reminder. Please do not reply to this email.
                  </p>
                </div>
              </div>
            `,
          });

          if (emailResponse.error) {
            console.error(`❌ Error sending email to ${email}:`, emailResponse.error);
          } else {
            emailsSent++;
            console.log(`✅ Email sent to ${email}`);
          }
        } catch (error) {
          console.error(`❌ Failed to send email to ${email}:`, error);
        }
      }

      console.log(`📧 Sent ${emailsSent} emails out of ${emailToNameMap.size} attempts`);
    }

    return new Response(
      JSON.stringify({ 
        message: "Live class reminders sent successfully",
        inAppNotifications: notifications.length,
        emailsSent: resendApiKey ? 'Emails sent' : 'Email service not configured'
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-live-class-reminder function:", error);
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