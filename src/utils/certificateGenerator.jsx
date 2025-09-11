// src/utils/certificateGenerator.jsx

import jsPDF from 'jspdf';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import certificateBgPath from '../assets/certificate.png';

/**
 * Helper function to asynchronously load an image.
 */
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

/**
 * Alternative certificate generation without background image
 */
const generateCertificateWithoutBackground = async (courseTitle, userName) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add a gradient background effect using rectangles
    doc.setFillColor(102, 126, 234); // Blue gradient start
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setFillColor(118, 75, 162, 0.8); // Purple gradient overlay
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Add border
    doc.setLineWidth(8);
    doc.setDrawColor(255, 255, 255);
    doc.rect(40, 40, pageWidth - 80, pageHeight - 80);

    // Add inner border
    doc.setLineWidth(2);
    doc.rect(60, 60, pageWidth - 120, pageHeight - 120);

    const contentCenterX = pageWidth / 2;

    // 1. Main Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(36);
    doc.setTextColor(255, 255, 255);
    doc.text("CERTIFICATE OF COMPLETION", contentCenterX, 150, { align: 'center' });

    // 2. "This is to certify that"
    doc.setFont("helvetica", "normal");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("This is to certify that", contentCenterX, 190, { align: 'center' });

    // 3. Learner's Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(255, 215, 0); // Gold color
    doc.text(userName, contentCenterX, 240, { align: 'center' });

    // 4. Completion Message
    doc.setFont("helvetica", "normal");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("has successfully completed the course", contentCenterX, 280, { align: 'center' });

    // 5. Course Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 215, 0); // Gold color
    const courseTextOptions = {
        align: 'center',
        maxWidth: 500 // Handles long titles gracefully
    };
    doc.text(courseTitle, contentCenterX, 325, courseTextOptions);

    // 6. Completion Date
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(`Date of Completion: ${dateStr}`, contentCenterX, 380, { align: 'center' });

    // 7. Signature lines
    const leftSigX = pageWidth * 0.3;
    const rightSigX = pageWidth * 0.7;
    const sigY = 450;

    // Left signature line
    doc.setLineWidth(1);
    doc.setDrawColor(255, 255, 255);
    doc.line(leftSigX - 60, sigY, leftSigX + 60, sigY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Instructor Signature", leftSigX, sigY + 20, { align: 'center' });

    // Right signature line
    doc.line(rightSigX - 60, sigY, rightSigX + 60, sigY);
    doc.text("Date", rightSigX, sigY + 20, { align: 'center' });

    return doc;
  } catch (error) {
    console.error("Error generating certificate without background:", error);
    throw error;
  }
};

/**
 * Generates and downloads a PDF certificate for the given course.
 */
export const generateCertificate = async (courseTitle, courseId, learnerData = null) => {
  let user = auth.currentUser;

  if (!user) {
    await new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        if (u) {
          user = u;
          resolve();
          unsubscribe();
        } else {
          // If no user after timeout, reject
          setTimeout(() => {
            unsubscribe();
            reject(new Error("Login required to download certificate."));
          }, 3000);
        }
      });
    });
  }

  if (!user && !learnerData) {
    throw new Error("Login required to download certificate.");
  }

  if (!courseTitle) {
    throw new Error("Course title is missing.");
  }

  try {
    console.log("Starting certificate generation...");
    
    const userName = learnerData?.name || user?.displayName || user?.email?.split('@')[0] || "A Valued Learner";
    let doc;

    try {
      // Try to load background image first
      console.log("Attempting to load background image...");
      const bgImage = await loadImage(certificateBgPath);

      doc = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.addImage(bgImage, 'PNG', 0, 0, pageWidth, pageHeight);

      const contentCenterX = pageWidth * 0.64;

      // Add Text Elements with the original styling
      doc.setFont("helvetica", "normal");
      doc.setFontSize(18);
      doc.setTextColor(80, 80, 80);
      doc.text("CERTIFICATE OF COMPLETION", contentCenterX, 190, { align: 'center' });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.setTextColor(30, 30, 30);
      doc.text(userName, contentCenterX, 240, { align: 'center' });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(18);
      doc.setTextColor(50, 50, 50);
      doc.text("has successfully completed the course", contentCenterX, 270, { align: 'center' });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(44, 44, 150);
      const courseTextOptions = {
          align: 'center',
          maxWidth: 400
      };
      doc.text(courseTitle, contentCenterX, 315, courseTextOptions);

      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text(`Date: ${dateStr}`, contentCenterX, 360, { align: 'center' });

      console.log("Certificate generated with background image");

    } catch (imageError) {
      console.warn("Failed to load background image, generating without background:", imageError);
      // Fallback to certificate without background
      doc = await generateCertificateWithoutBackground(courseTitle, userName);
      console.log("Certificate generated without background image");
    }

    // Save the PDF
    const filename = `${userName.replace(/[^a-zA-Z0-9]/g, '_')}_${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`;
    doc.save(filename);

    console.log("Certificate download initiated:", filename);
    return { success: true, message: 'Certificate downloaded successfully!' };

  } catch (error) {
    console.error("Certificate generation error:", error);
    throw new Error("Failed to generate certificate. Please check the console for details.");
  }
};

/**
 * API-based certificate generation as fallback
 */
export const generateCertificateAPI = async (learnerData, courseData) => {
  try {
    console.log("Attempting API-based certificate generation...");
    
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/certificates/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        learnerName: learnerData.name,
        courseName: courseData.title,
        completionDate: new Date().toISOString(),
        learnerId: learnerData.uid,
        courseId: courseData.id
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${learnerData.name}_Certificate.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true, message: 'Certificate downloaded successfully!' };

  } catch (error) {
    console.error('Error downloading certificate from API:', error);
    throw error;
  }
};