import React, { useState } from 'react';
import { generateCertificate, generateCertificateAPI } from '../utils/certificateGenerator';

const CertificateGenerator = ({ learnerData, courseData, onSuccess, onError }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Starting certificate generation...', { learnerData, courseData });
      
      // Try frontend generation first
      await generateCertificate(courseData.title, courseData.id, learnerData);
      onSuccess?.('Certificate generated successfully!');
      
    } catch (frontendError) {
      console.log('Frontend generation failed, trying backend...', frontendError);
      
      try {
        // Fallback to backend generation
        await generateCertificateAPI(learnerData, courseData);
        onSuccess?.('Certificate generated successfully!');
      } catch (backendError) {
        console.error('Both frontend and backend generation failed:', backendError);
        onError?.(`Failed to generate certificate: ${backendError.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGenerateCertificate}
      disabled={isGenerating}
      className="download-certificate-btn"
      style={{
        backgroundColor: isGenerating ? '#ccc' : '#28a745',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '5px',
        cursor: isGenerating ? 'not-allowed' : 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background-color 0.3s ease'
      }}
    >
      {isGenerating ? (
        <>
          <div className="spinner" style={{
            width: '16px',
            height: '16px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #333',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Generating...
        </>
      ) : (
        <>
          <span>📄</span>
          Download Certificate
        </>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default CertificateGenerator;
