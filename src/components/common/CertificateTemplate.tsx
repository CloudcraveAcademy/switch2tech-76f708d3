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
    <title>Certificate of Excellence - ${certificate.student.first_name} ${certificate.student.last_name}</title>
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
        }
        
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Inter', sans-serif;
            background: radial-gradient(circle at 20% 80%, #120078 0%, #9f1cf5 25%, #ffa500 75%, #ff6b6b 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .certificate {
            width: 1200px;
            height: 850px;
            margin: 0 auto;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            position: relative;
            overflow: hidden;
            box-shadow: 0 40px 80px rgba(0, 0, 0, 0.2), 0 20px 40px rgba(0, 0, 0, 0.1);
            border-radius: 32px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        /* Geometric Background Pattern */
        .certificate::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 15% 20%, rgba(120, 119, 198, 0.05) 0%, transparent 40%),
                radial-gradient(circle at 85% 80%, rgba(255, 107, 107, 0.05) 0%, transparent 40%),
                radial-gradient(circle at 50% 50%, rgba(159, 28, 245, 0.03) 0%, transparent 60%);
            pointer-events: none;
        }
        
        /* Decorative Border */
        .certificate::after {
            content: '';
            position: absolute;
            top: 40px;
            left: 40px;
            right: 40px;
            bottom: 40px;
            border: 3px solid;
            border-image: linear-gradient(135deg, #7877c6, #9f1cf5, #ffa500, #ff6b6b) 1;
            border-radius: 24px;
            pointer-events: none;
            z-index: 1;
        }
        
        /* Premium Logo Badge */
        .logo-container {
            position: absolute;
            top: 60px;
            left: 60px;
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #7877c6 0%, #9f1cf5 100%);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 
                0 20px 40px rgba(120, 119, 198, 0.4),
                0 0 0 8px rgba(255, 255, 255, 0.1),
                inset 0 2px 0 rgba(255, 255, 255, 0.2);
            z-index: 2;
        }
        
        .logo-image {
            width: 48px;
            height: 48px;
            object-fit: contain;
            filter: brightness(0) invert(1);
            margin-bottom: 8px;
        }
        
        .logo-text {
            font-size: 12px;
            font-weight: 700;
            color: white;
            text-align: center;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        /* Premium Seal */
        .excellence-seal {
            position: absolute;
            top: 60px;
            right: 60px;
            width: 140px;
            height: 140px;
            background: linear-gradient(135deg, #ffa500 0%, #ff6b6b 100%);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 
                0 20px 40px rgba(255, 165, 0, 0.4),
                0 0 0 8px rgba(255, 255, 255, 0.1),
                inset 0 2px 0 rgba(255, 255, 255, 0.2);
            z-index: 2;
        }
        
        .seal-text {
            color: white;
            text-align: center;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            line-height: 1.2;
        }
        
        .seal-main {
            font-size: 16px;
            margin-bottom: 4px;
        }
        
        .seal-sub {
            font-size: 10px;
            opacity: 0.9;
        }
        
        /* Elegant Watermark */
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-15deg);
            font-family: 'Playfair Display', serif;
            font-size: 180px;
            font-weight: 400;
            color: rgba(120, 119, 198, 0.02);
            z-index: 0;
            user-select: none;
            pointer-events: none;
            font-style: italic;
        }
        
        /* Main Content */
        .content {
            position: relative;
            z-index: 2;
            padding: 120px 80px 80px;
            text-align: center;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .header {
            margin-bottom: 60px;
        }
        
        .certificate-type {
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            font-weight: 500;
            color: #7877c6;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 16px;
        }
        
        .title {
            font-family: 'Playfair Display', serif;
            font-size: 72px;
            font-weight: 700;
            background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 32px;
            line-height: 1.1;
        }
        
        .subtitle {
            font-family: 'Inter', sans-serif;
            font-size: 22px;
            color: #64748b;
            font-weight: 300;
            letter-spacing: 0.5px;
        }
        
        /* Recipient Section */
        .recipient {
            margin: 50px 0;
            position: relative;
        }
        
        .recipient-name {
            font-family: 'Playfair Display', serif;
            font-size: 56px;
            font-weight: 700;
            background: linear-gradient(135deg, #7877c6 0%, #9f1cf5 50%, #ffa500 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 20px;
            position: relative;
            display: inline-block;
        }
        
        .recipient-name::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 4px;
            background: linear-gradient(135deg, #7877c6, #9f1cf5, #ffa500);
            border-radius: 2px;
        }
        
        .achievement-text {
            font-family: 'Inter', sans-serif;
            font-size: 20px;
            color: #64748b;
            font-weight: 400;
            margin-top: 24px;
            letter-spacing: 0.5px;
        }
        
        /* Course Information */
        .course-info {
            margin: 50px 0;
            padding: 40px;
            background: linear-gradient(135deg, rgba(120, 119, 198, 0.05) 0%, rgba(159, 28, 245, 0.05) 100%);
            border-radius: 24px;
            border: 1px solid rgba(120, 119, 198, 0.1);
        }
        
        .course-title {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        
        .course-details {
            font-family: 'Inter', sans-serif;
            font-size: 18px;
            color: #64748b;
            margin-bottom: 12px;
            font-weight: 500;
        }
        
        .course-level {
            display: inline-block;
            background: linear-gradient(135deg, #7877c6, #9f1cf5);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 16px;
        }
        
        /* Footer Section */
        .footer {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: end;
        }
        
        .date-section, .signature-section {
            text-align: center;
            flex: 1;
        }
        
        .date-value, .signature-line {
            font-family: 'Inter', sans-serif;
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            padding: 16px 24px;
            border-bottom: 3px solid transparent;
            border-image: linear-gradient(135deg, #7877c6, #9f1cf5) 1;
            margin-bottom: 12px;
            min-width: 200px;
            display: inline-block;
        }
        
        .label {
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        /* Verification Section */
        .verification {
            position: absolute;
            bottom: 60px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            padding: 20px 40px;
            border-radius: 16px;
            border: 1px solid rgba(120, 119, 198, 0.2);
        }
        
        .verification-code {
            font-family: 'Inter', monospace;
            font-size: 13px;
            color: #64748b;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .verify-link {
            color: #7877c6;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            transition: color 0.3s ease;
        }
        
        .verify-link:hover {
            color: #9f1cf5;
        }
        
        /* Decorative Elements */
        .decorative-corner {
            position: absolute;
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #7877c6, transparent);
            opacity: 0.1;
        }
        
        .decorative-corner.top-left {
            top: 0;
            left: 0;
            border-radius: 0 0 100px 0;
        }
        
        .decorative-corner.bottom-right {
            bottom: 0;
            right: 0;
            border-radius: 100px 0 0 0;
            background: linear-gradient(135deg, transparent, #ffa500);
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .certificate {
                box-shadow: none;
                border-radius: 0;
                width: 100%;
                height: auto;
                min-height: 100vh;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <!-- Decorative Corners -->
        <div class="decorative-corner top-left"></div>
        <div class="decorative-corner bottom-right"></div>
        
        <!-- Premium Logo Badge -->
        <div class="logo-container">
            <img src="/lovable-uploads/46f46751-2285-4ad6-9c49-da2565a6ffbd.png" alt="Switch2Tech Academy" class="logo-image" />
            <span class="logo-text">Switch2Tech</span>
        </div>
        
        <!-- Excellence Seal -->
        <div class="excellence-seal">
            <div class="seal-text">
                <div class="seal-main">Excellence</div>
                <div class="seal-sub">Certified</div>
            </div>
        </div>
        
        <!-- Elegant Watermark -->
        <div class="watermark">Excellence</div>
        
        <!-- Main Content -->
        <div class="content">
            <div class="header">
                <div class="certificate-type">Certificate of</div>
                <h1 class="title">Excellence</h1>
                <p class="subtitle">This is to proudly certify that</p>
            </div>
            
            <div class="recipient">
                <h2 class="recipient-name">${certificate.student.first_name} ${certificate.student.last_name}</h2>
                <p class="achievement-text">has successfully demonstrated mastery and completed</p>
            </div>
            
            <div class="course-info">
                <h3 class="course-title">${certificate.course.title}</h3>
                <p class="course-details">Under the expert guidance of ${certificate.course.instructor.first_name} ${certificate.course.instructor.last_name}</p>
                <div class="course-level">${certificate.course.level} Level</div>
            </div>
            
            <div class="footer">
                <div class="date-section">
                    <div class="date-value">${new Date(certificate.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div class="label">Date of Achievement</div>
                </div>
                
                <div class="signature-section">
                    <div class="signature-line">Switch2Tech Academy</div>
                    <div class="label">Authorized Institution</div>
                </div>
            </div>
        </div>
        
        <!-- Verification Section -->
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