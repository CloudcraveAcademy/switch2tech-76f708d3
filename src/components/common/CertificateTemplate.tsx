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
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 40px;
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .certificate {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            position: relative;
            border: 3px solid #667eea;
        }
        .logo-container {
            position: absolute;
            top: 20px;
            left: 20px;
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .logo-image {
            width: 32px;
            height: 32px;
            object-fit: contain;
            filter: brightness(0) invert(1);
            margin-bottom: 2px;
        }
        .logo-text {
            font-size: 9px;
            font-weight: bold;
            color: white;
            text-align: center;
            letter-spacing: 0.5px;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(102, 126, 234, 0.03);
            font-weight: bold;
            z-index: 0;
            user-select: none;
            pointer-events: none;
        }
        .content {
            position: relative;
            z-index: 1;
            text-align: center;
            color: #2d3748;
        }
        .seal {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 11px;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .header {
            margin-bottom: 40px;
        }
        .title {
            font-family: 'Playfair Display', serif;
            font-size: 48px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 20px;
        }
        .subtitle {
            font-size: 18px;
            color: #718096;
            font-weight: 300;
        }
        .recipient {
            margin: 40px 0;
        }
        .recipient-label {
            font-size: 16px;
            color: #718096;
            margin-bottom: 10px;
        }
        .recipient-name {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            font-weight: 700;
            color: #2d3748;
            border-bottom: 2px solid #667eea;
            display: inline-block;
            padding-bottom: 5px;
        }
        .course-info {
            margin: 40px 0;
        }
        .course-title {
            font-size: 24px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 10px;
        }
        .course-details {
            font-size: 16px;
            color: #718096;
        }
        .footer {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .date-section, .signature-section {
            text-align: center;
        }
        .date, .signature-line {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 10px;
            min-width: 150px;
            font-weight: 500;
        }
        .label {
            font-size: 14px;
            color: #718096;
        }
        .verification {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
        }
        .verification-code {
            font-size: 12px;
            color: #718096;
            font-family: monospace;
        }
        .verify-link {
            color: #667eea;
            text-decoration: none;
            font-size: 12px;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .certificate {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="logo-container">
            <img src="/lovable-uploads/46f46751-2285-4ad6-9c49-da2565a6ffbd.png" alt="Switch2Tech Academy" class="logo-image" />
            <span class="logo-text">Switch2Tech</span>
        </div>
        <div class="watermark">SWITCH2TECH</div>
        <div class="seal">CERTIFIED</div>
        <div class="content">
            <div class="header">
                <h1 class="title">Certificate of Completion</h1>
                <p class="subtitle">This is to certify that</p>
            </div>
            
            <div class="recipient">
                <h2 class="recipient-name">${certificate.student.first_name} ${certificate.student.last_name}</h2>
                <p class="recipient-label">has successfully completed</p>
            </div>
            
            <div class="course-info">
                <h3 class="course-title">${certificate.course.title}</h3>
                <p class="course-details">Level: ${certificate.course.level}</p>
                <p class="course-details">Instructor: ${certificate.course.instructor.first_name} ${certificate.course.instructor.last_name}</p>
            </div>
            
            <div class="footer">
                <div class="date-section">
                    <div class="date">${new Date(certificate.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div class="label">Date of Completion</div>
                </div>
                
                <div class="signature-section">
                    <div class="signature-line">Switch2Tech Academy</div>
                    <div class="label">Authorized Signature</div>
                </div>
            </div>
            
            <div class="verification">
                <p class="verification-code">Certificate Number: ${certificate.certificate_number}</p>
                <p class="verification-code">Verification Code: ${certificate.verification_code}</p>
                <a href="${window.location.origin}/verify-certificate" class="verify-link">Verify this certificate online</a>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};