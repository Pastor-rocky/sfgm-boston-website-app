import { useRef } from 'react';
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
      
      {/* In-person only notice */}
      <div className="text-center mt-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 max-w-md mx-auto">
        <p className="text-amber-900 font-medium">
          <i className="fas fa-handshake mr-2"></i>
          Diplomas are presented in person only.
        </p>
        <p className="text-sm text-amber-800 mt-1">Not available for download.</p>
      </div>
    </div>
  );
}
