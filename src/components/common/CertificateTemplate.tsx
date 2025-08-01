interface CertificateData {
  student: {
    first_name: string;
    last_name: string;
  };
  course: {
    title: string;
    level: string;
    instructor: {
      first_name: string;
      last_name: string;
    };
  };
  certificate_number: string;
  verification_code: string;
  issue_date: string;
}

export const generateCertificateHTML = (certificate: CertificateData): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Completion - ${certificate.student.first_name} ${certificate.student.last_name}</title>
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
        }
        
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Times New Roman', serif;
            background: #f5f5f5;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .certificate {
            width: 1200px;
            height: 850px;
            margin: 0 auto;
            background: white;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            border: 20px solid #8B0000;
            border-image: linear-gradient(45deg, #8B0000, #B22222, #CD853F, #1e3a8a) 20;
        }
        
        /* Decorative corner elements */
        .corner-decoration {
            position: absolute;
            width: 150px;
            height: 150px;
            z-index: 1;
        }
        
        .corner-decoration.top-left {
            top: 0;
            left: 0;
            background: linear-gradient(135deg, #8B0000 0%, #B22222 50%, #CD853F 100%);
            clip-path: polygon(0 0, 100% 0, 0 100%);
        }
        
        .corner-decoration.top-right {
            top: 0;
            right: 0;
            background: linear-gradient(225deg, #1e3a8a 0%, #3b82f6 50%, #CD853F 100%);
            clip-path: polygon(100% 0, 100% 100%, 0 0);
        }
        
        .corner-decoration.bottom-left {
            bottom: 0;
            left: 0;
            background: linear-gradient(45deg, #1e3a8a 0%, #3b82f6 50%, #CD853F 100%);
            clip-path: polygon(0 0, 100% 100%, 0 100%);
        }
        
        .corner-decoration.bottom-right {
            bottom: 0;
            right: 0;
            background: linear-gradient(315deg, #8B0000 0%, #B22222 50%, #CD853F 100%);
            clip-path: polygon(100% 0, 100% 100%, 0 100%);
        }
        
        /* Inner border */
        .inner-border {
            position: absolute;
            top: 30px;
            left: 30px;
            right: 30px;
            bottom: 30px;
            border: 3px solid #8B0000;
            z-index: 1;
        }
        
        /* Main content container */
        .content {
            position: relative;
            z-index: 2;
            padding: 120px 80px 90px;
            text-align: center;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        /* Header section */
        .header {
            margin-bottom: 30px;
            margin-top: 20px;
        }
        
        .certificate-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 28px;
            font-weight: 600;
            color: #2d3748;
            text-transform: uppercase;
            letter-spacing: 6px;
            margin-bottom: 15px;
            line-height: 1.3;
        }
        
        .certificate-of {
            font-size: 22px;
            font-weight: 500;
        }
        
        .completion {
            font-size: 36px;
            font-weight: 700;
            background: linear-gradient(135deg, #8B0000, #B22222);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-top: 8px;
            letter-spacing: 4px;
        }
        
        .presented-to {
            font-family: 'Cormorant Garamond', serif;
            font-size: 16px;
            color: #2d3748;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 15px;
            margin-bottom: 5px;
            font-weight: 500;
        }
        
        /* Recipient section */
        .recipient-section {
            margin: 5px 0 15px;
        }
        
        .recipient-name {
            font-family: 'Playfair Display', serif;
            font-size: 56px;
            font-weight: 500;
            font-style: italic;
            color: #8B0000;
            margin-bottom: 15px;
            position: relative;
            display: inline-block;
            letter-spacing: 1px;
        }
        
        .recipient-name::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            height: 2px;
            background: #8B0000;
        }
        
        /* Course info section */
        .course-section {
            margin: 25px 0 5px;
        }
        
        .achievement-text {
            font-family: 'Cormorant Garamond', serif;
            font-size: 22px;
            color: #2d3748;
            margin-bottom: 18px;
            line-height: 1.6;
            font-weight: 500;
        }
        
        .course-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 22px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 12px;
        }
        
        .course-date {
            font-family: 'Cormorant Garamond', serif;
            font-size: 19px;
            color: #64748b;
            margin-bottom: 18px;
            font-weight: 500;
        }
        
        .wishes-text {
            font-family: 'Cormorant Garamond', serif;
            font-size: 19px;
            color: #2d3748;
            font-style: italic;
            font-weight: 500;
        }
        
        /* Footer signatures */
        .signatures {
            display: flex;
            justify-content: space-between;
            align-items: end;
            margin-top: 50px;
            padding: 0 40px;
        }
        
        .signature {
            text-align: center;
            min-width: 200px;
        }
        
        .signature-line {
            border-bottom: 2px solid #8B0000;
            padding-bottom: 10px;
            margin-bottom: 10px;
            font-family: 'Cormorant Garamond', serif;
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .signature-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 13px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 400;
        }
        
        /* Verification section */
        .verification {
            position: absolute;
            bottom: 45px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            font-size: 11px;
            color: #64748b;
            z-index: 2;
            max-width: 90%;
        }
        
        .verification-code {
            margin: 2px 0;
            font-family: 'Inter', monospace;
        }
        
        .verify-link {
            color: #8B0000;
            text-decoration: none;
            font-weight: 600;
        }
        
        .verify-link:hover {
            text-decoration: underline;
        }
        
        /* Logo positioning */
        .logo-container {
            position: absolute;
            top: 40px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 3;
        }
        
        .logo-image {
            width: 50px;
            height: 50px;
            object-fit: contain;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .certificate {
                box-shadow: none;
                width: 100%;
                height: auto;
                min-height: 100vh;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <!-- Corner decorations -->
        <div class="corner-decoration top-left"></div>
        <div class="corner-decoration top-right"></div>
        <div class="corner-decoration bottom-left"></div>
        <div class="corner-decoration bottom-right"></div>
        
        <!-- Inner border -->
        <div class="inner-border"></div>
        
        <!-- Logo -->
        <div class="logo-container">
            <img src="/lovable-uploads/46f46751-2285-4ad6-9c49-da2565a6ffbd.png" alt="Switch2Tech Academy" class="logo-image" />
        </div>
        
        <!-- Main content -->
        <div class="content">
            <div class="header">
                <div class="certificate-title">
                    <div class="certificate-of">Certificate of</div>
                    <div class="completion">Completion</div>
                </div>
                <div class="presented-to">This Certificate is Presented to:</div>
            </div>
            
            <div class="recipient-section">
                <h2 class="recipient-name">${certificate.student.first_name} ${certificate.student.last_name}</h2>
            </div>
            
            <div class="course-section">
                <p class="achievement-text">For achievements and participation in <strong>${certificate.course.title}</strong></p>
                <p class="course-date">Held on ${new Date(certificate.issue_date).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p class="wishes-text">We wish a bright future and great success in life.</p>
            </div>
            
            <div class="signatures">
                <div class="signature">
                    <div class="signature-line">${certificate.course.instructor.first_name} ${certificate.course.instructor.last_name}</div>
                    <div class="signature-title">Course Instructor</div>
                </div>
                
                <div class="signature">
                    <div class="signature-line">Switch2Tech Academy</div>
                    <div class="signature-title">Academy Director</div>
                </div>
            </div>
        </div>
        
        <!-- Verification section -->
        <div class="verification">
            <p class="verification-code">Certificate ID: ${certificate.certificate_number}</p>
            <p class="verification-code">Verification: ${certificate.verification_code}</p>
            <a href="${typeof window !== 'undefined' ? window.location.origin : ''}/verify-certificate" class="verify-link">Verify Authenticity Online</a>
        </div>
    </div>
</body>
</html>
  `;
};