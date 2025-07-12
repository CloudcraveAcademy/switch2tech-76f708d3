import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { certificateId } = await req.json();

    if (!certificateId) {
      return new Response(JSON.stringify({ error: 'Certificate ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch certificate details
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        *,
        course:courses (
          id,
          title,
          level,
          instructor:user_profiles!instructor_id (
            first_name,
            last_name
          )
        ),
        student:user_profiles!student_id (
          first_name,
          last_name
        )
      `)
      .eq('id', certificateId)
      .single();

    if (error || !certificate) {
      return new Response(JSON.stringify({ error: 'Certificate not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate HTML for the certificate
    const certificateHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            box-sizing: border-box;
        }
        .certificate {
            background: white;
            padding: 60px 80px;
            text-align: center;
            border: 8px solid #4a5568;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 90%;
            max-width: 800px;
        }
        .header {
            border-bottom: 4px solid #4a5568;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        .title {
            font-size: 48px;
            font-weight: bold;
            color: #2d3748;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 4px;
        }
        .subtitle {
            font-size: 20px;
            color: #718096;
            margin: 10px 0 0 0;
        }
        .recipient {
            font-size: 32px;
            color: #2b6cb0;
            margin: 30px 0;
            font-weight: bold;
        }
        .course-title {
            font-size: 28px;
            color: #2d3748;
            margin: 20px 0;
            font-style: italic;
        }
        .completion-text {
            font-size: 18px;
            color: #4a5568;
            margin: 30px 0;
            line-height: 1.6;
        }
        .details {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
        }
        .detail-item {
            text-align: center;
        }
        .detail-label {
            font-size: 14px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .detail-value {
            font-size: 16px;
            color: #2d3748;
            font-weight: bold;
            margin-top: 5px;
        }
        .seal {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 100px;
            height: 100px;
            border: 4px solid #4a5568;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f7fafc;
            font-size: 14px;
            font-weight: bold;
            color: #2d3748;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="seal">CERTIFIED</div>
        <div class="header">
            <h1 class="title">Certificate of Completion</h1>
            <p class="subtitle">This is to certify that</p>
        </div>
        
        <div class="recipient">
            ${certificate.student.first_name} ${certificate.student.last_name}
        </div>
        
        <p class="completion-text">
            has successfully completed the course
        </p>
        
        <div class="course-title">
            "${certificate.course.title}"
        </div>
        
        <p class="completion-text">
            demonstrating proficiency and dedication in the subject matter.
            This achievement represents a significant milestone in their educational journey.
        </p>
        
        <div class="details">
            <div class="detail-item">
                <div class="detail-label">Certificate Number</div>
                <div class="detail-value">${certificate.certificate_number}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Issue Date</div>
                <div class="detail-value">${new Date(certificate.issue_date).toLocaleDateString()}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Course Level</div>
                <div class="detail-value">${certificate.course.level}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Instructor</div>
                <div class="detail-value">${certificate.course.instructor.first_name} ${certificate.course.instructor.last_name}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Verification Code</div>
                <div class="detail-value">${certificate.verification_code}</div>
            </div>
        </div>
    </div>
</body>
</html>`;

    // Create HTML file and return its URL for now
    // Note: In production, you'd want to use a PDF generation service
    const htmlFileName = `certificate_${certificateId}_${Date.now()}.html`;
    const htmlBuffer = new TextEncoder().encode(certificateHtml);
    
    // Upload HTML to Supabase Storage
    const { data: htmlUploadData, error: htmlUploadError } = await supabase.storage
      .from('Course Materials')
      .upload(`certificates/${htmlFileName}`, htmlBuffer, {
        contentType: 'text/html',
        upsert: true
      });

    if (htmlUploadError) {
      console.error('HTML Upload error:', htmlUploadError);
      return new Response(JSON.stringify({ error: 'Failed to save certificate' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get public URL for the HTML file
    const { data: htmlUrlData } = supabase.storage
      .from('Course Materials')
      .getPublicUrl(`certificates/${htmlFileName}`);

    const certificateUrl = htmlUrlData.publicUrl;

    // Update certificate with certificate URL
    const { error: updateError } = await supabase
      .from('certificates')
      .update({ pdf_url: certificateUrl })
      .eq('id', certificateId);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      pdfUrl: certificateUrl,
      message: 'Certificate generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-certificate-pdf function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});