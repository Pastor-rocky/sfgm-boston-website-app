import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import sfgmLogo from '@/assets/sfgm-logo.png';
import sfgmShield from '@/assets/sfgm-shield.png';
import sfgmLogoNewBlue from '@/assets/sfgm-logo-new-blue.png';
import bishopSignature from '@/assets/bishop-signature.png';

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  instructorName?: string;
  courseDescription?: string;
}

export default function Certificate({ 
  studentName, 
  courseName, 
  completionDate, 
  instructorName = "Pastor Rocky Kaslov",
  courseDescription 
}: CertificateProps) {
  // Default description for Acts course, custom for others
  const defaultDescription = "An in depth study of the entire book of Acts of the Apostles";
  const description = courseDescription || (courseName.toLowerCase().includes('deacon') 
    ? "A comprehensive study of Spirit-appointed, servant-hearted leadership and practical ministry"
    : defaultDescription);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (certificateRef.current) {
      // Clone the certificate element and get its HTML
      const certificateHTML = certificateRef.current.outerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Certificate - ${courseName}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Dancing+Script:wght@400;700&display=swap');
                
                body { 
                  margin: 0; 
                  padding: 0; 
                  font-family: 'Playfair Display', serif;
                  background: white;
                }
                .certificate {
                  width: 8.5in;
                  height: 11in;
                  margin: 0;
                  padding: 60px 50px;
                  background: #fefdf8;
                  position: relative;
                  border: 3px solid #d4af37;
                  box-shadow: none;
                  box-sizing: border-box;
                }
                .certificate-header {
                  text-align: center;
                  margin-bottom: 32px;
                  position: relative;
                  padding-top: 0;
                }
                .shield-background {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 300px;
                  height: 300px;
                  opacity: 0.1;
                  z-index: 0;
                  pointer-events: none;
                }
                .header-content {
                  position: relative;
                  z-index: 1;
                }
                .company-name {
                  font-size: 20px;
                  font-weight: bold;
                  color: #1e3a5f;
                  margin-bottom: 8px;
                  letter-spacing: 2px;
                }
                .course-name {
                  font-size: 16px;
                  color: #1e3a5f;
                  margin-bottom: 24px;
                }
                .certificate-title {
                  font-size: 42px;
                  font-weight: 700;
                  color: #1e3a5f;
                  letter-spacing: 4px;
                  margin: 32px 0;
                  font-family: 'Playfair Display', serif;
                }
                .intro-text {
                  font-size: 14px;
                  color: #1e3a5f;
                  text-align: center;
                  margin-bottom: 24px;
                  line-height: 1.6;
                }
                .recipient-name {
                  font-size: 36px;
                  font-family: 'Dancing Script', cursive;
                  font-weight: 700;
                  color: #1e3a5f;
                  text-align: center;
                  margin: 30px 0;
                  padding-bottom: 10px;
                  border-bottom: 2px solid #d4af37;
                  display: inline-block;
                  width: 100%;
                }
                .completion-statement {
                  font-size: 14px;
                  color: #1e3a5f;
                  text-align: center;
                  margin: 30px 0 50px 0;
                  line-height: 1.8;
                }
                .certificate-footer {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                  margin-top: 60px;
                  padding: 0 20px;
                }
                .date-section {
                  text-align: left;
                }
                .date-label {
                  font-size: 12px;
                  color: #1e3a5f;
                  margin-bottom: 5px;
                }
                .date-value {
                  font-size: 14px;
                  color: #1e3a5f;
                  font-weight: bold;
                }
                .logo-section {
                  text-align: center;
                  flex: 1;
                }
                .logo-placeholder {
                  width: 100px;
                  height: 100px;
                  margin: 0 auto;
                  border: 2px solid #d4af37;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #fefdf8;
                  position: relative;
                  overflow: hidden;
                }
                .logo-placeholder img {
                  width: 115px !important;
                  height: 115px !important;
                  object-fit: contain;
                }
                .signature-section {
                  text-align: right;
                }
                .signature-name {
                  font-size: 14px;
                  color: #1e3a5f;
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                .signature-line {
                  border-top: 1px solid #1e3a5f;
                  width: 200px;
                  margin-left: auto;
                  margin-top: 20px;
                  padding-top: 5px;
                }
                .signature-label {
                  font-size: 12px;
                  color: #1e3a5f;
                }
                @media print {
                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                  }
                  html, body { 
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    background: white !important;
                    overflow: hidden !important;
                  }
                  body {
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                  }
                  .certificate { 
                    margin: 0 !important;
                    padding: 60px 50px !important;
                    box-shadow: none !important;
                    page-break-inside: avoid;
                    width: 8.5in !important;
                    height: 11in !important;
                    max-width: 8.5in !important;
                    max-height: 11in !important;
                    background: #fefdf8 !important;
                    border: 3px solid #d4af37 !important;
                    box-sizing: border-box !important;
                    position: relative !important;
                    transform: none !important;
                  }
                  @page {
                    size: 8.5in 11in;
                    margin: 0 !important;
                  }
                }
              </style>
            </head>
            <body>
              <div class="certificate">
                <div class="certificate-header">
                  <img src="${sfgmShield}" alt="SFGM Shield" class="shield-background" />
                  <div class="header-content">
                    <div class="company-name">Boston Bible University</div>
                    <div class="course-name">${courseName}</div>
                    
                    <div class="certificate-title">CERTIFICATE OF COMPLETION</div>
                    
                    <div class="intro-text">
                      SFGM Boston The House Of Restoration is happy to award this certificate to
                    </div>
                  </div>
                </div>
                
                <div style="text-align: center;">
                  <div class="recipient-name">${studentName}</div>
                </div>
                
                <div class="completion-statement">
                  For the successful completion of ${courseName}:<br/>
                  ${description}
                </div>
                
                <div class="certificate-footer">
                  <div class="date-section">
                    <div class="date-label">Date awarded</div>
                    <div class="date-value">${completionDate}</div>
                  </div>
                  
                  <div class="logo-section">
                    <div class="logo-placeholder">
                      <img src="${sfgmLogoNewBlue}" alt="SFGM Logo" />
                    </div>
                  </div>
                  
                  <div class="signature-section">
                    <div class="signature-line">
                      <div class="signature-name">${instructorName}</div>
                      <div class="signature-label">Instructor</div>
                    </div>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.focus();
          // Auto-trigger print dialog which allows saving as PDF to Desktop
          printWindow.print();
        }, 500);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Certificate Preview */}
      <div className="flex justify-center py-8">
        <div 
          ref={certificateRef}
          className="bg-[#fefdf8] shadow-xl relative border-[3px] border-yellow-600"
          style={{ 
            width: '8.5in',
            maxWidth: '100%',
            aspectRatio: '8.5/11',
            padding: '60px 50px'
          }}
        >
          {/* Header with Shield Logo Background */}
          <div className="text-center mb-8 relative">
            {/* Shield Logo Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 -z-0">
              <img 
                src={sfgmShield} 
                alt="SFGM Shield" 
                className="w-64 h-64 object-contain"
              />
            </div>
            {/* Header Text */}
            <div className="relative z-10">
              <div className="text-xl font-bold text-blue-900 mb-2 tracking-wide">
                Boston Bible University
              </div>
              <div className="text-base text-blue-900 mb-6">
                {courseName}
              </div>
              
              {/* Main Title */}
              <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-blue-900 tracking-widest" style={{ fontFamily: 'Playfair Display, serif' }}>
                  CERTIFICATE OF COMPLETION
                </h1>
              </div>
              
              {/* Intro Text */}
              <div className="text-center text-sm text-blue-900 mb-6 leading-relaxed">
                SFGM Boston The House Of Restoration is happy to award this certificate to
              </div>
            </div>
          </div>
          
          {/* Recipient Name */}
          <div className="text-center my-8">
            <div 
              className="text-4xl font-bold text-blue-900 pb-3 border-b-2 border-yellow-600 inline-block"
              style={{ 
                fontFamily: 'Dancing Script, cursive',
                minWidth: '400px'
              }}
            >
              {studentName}
            </div>
          </div>
          
          {/* Completion Statement */}
          <div className="text-center text-sm text-blue-900 mt-8 mb-12 leading-relaxed">
            For the successful completion of <strong>{courseName}</strong>:<br/>
            <em>{description}</em>
          </div>
          
          {/* Footer */}
          <div className="flex justify-between items-end mt-16 px-5">
            {/* Date Section */}
            <div className="text-left">
              <div className="text-xs text-blue-900 mb-1">Date awarded</div>
              <div className="text-sm font-bold text-blue-900">{completionDate}</div>
            </div>
            
            {/* Logo Section */}
            <div className="flex-1 flex justify-center">
              <div className="w-28 h-28 border-2 border-yellow-600 rounded-full flex items-center justify-center bg-[#fefdf8] p-1 relative overflow-hidden">
                <img 
                  src={sfgmLogoNewBlue} 
                  alt="SFGM Logo" 
                  className="object-contain"
                  style={{ width: '115px', height: '115px' }}
                />
              </div>
            </div>
            
            {/* Signature Section */}
            <div className="text-right">
              <div className="border-t border-blue-900 pt-1" style={{ width: '200px', marginLeft: 'auto' }}>
                <div className="text-sm font-bold text-blue-900">{instructorName}</div>
                <div className="text-xs text-blue-900">Instructor</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Download Button */}
      <div className="text-center mt-6">
        <Button onClick={handleDownload} className="bg-green-800 hover:bg-green-700 text-white text-lg px-8 py-6">
          <i className="fas fa-download mr-2"></i>
          Download Certificate as PDF
        </Button>
        <p className="text-sm text-gray-600 mt-2">
          Click the button above, then in the print dialog select "Save as PDF" and choose your Desktop as the save location
        </p>
      </div>
    </div>
  );
}
