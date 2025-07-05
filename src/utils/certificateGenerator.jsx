import jsPDF from 'jspdf';
import { auth } from '../firebase'; // Assuming firebase is one level up from utils

/**
 * Generates and downloads a certificate of completion for a given course.
 * @param {string} courseTitle - The title of the course for the certificate.
 * @param {string} courseId - The ID of the course (used for filename consistency).
 */
export const generateCertificate = async (courseTitle, courseId) => {
  const user = auth.currentUser;
  if (!user) {
    alert("Login required to download certificate.");
    return;
  }
  if (!courseTitle) {
    alert("Course title is missing. Cannot generate certificate.");
    return;
  }

  try {
    const docPDF = new jsPDF();

    // Set font and size for the title
    docPDF.setFont("helvetica", "bold");
    docPDF.setFontSize(30);
    docPDF.setTextColor(40, 40, 40); // Dark gray
    docPDF.text("Certificate of Completion", docPDF.internal.pageSize.width / 2, 40, { align: 'center' });

    // Set font and size for body text
    docPDF.setFont("helvetica", "normal");
    docPDF.setFontSize(18);
    docPDF.setTextColor(80, 80, 80); // Medium gray

    // User's name
    docPDF.text("This certifies that", docPDF.internal.pageSize.width / 2, 80, { align: 'center' });
    docPDF.setFont("helvetica", "bold");
    docPDF.setFontSize(24);
    docPDF.setTextColor(0, 128, 0); // Green color for name
    docPDF.text(user.displayName || "A Valued Learner", docPDF.internal.pageSize.width / 2, 95, { align: 'center' });

    // Course completion text
    docPDF.setFont("helvetica", "normal");
    docPDF.setFontSize(18);
    docPDF.setTextColor(80, 80, 80);
    docPDF.text("has successfully completed the course", docPDF.internal.pageSize.width / 2, 115, { align: 'center' });

    // Course title
    docPDF.setFont("helvetica", "bold");
    docPDF.setFontSize(26);
    docPDF.setTextColor(50, 50, 150); // Blue color for course title
    docPDF.text(courseTitle, docPDF.internal.pageSize.width / 2, 130, { align: 'center' });

    // Date
    docPDF.setFont("helvetica", "normal");
    docPDF.setFontSize(14);
    docPDF.setTextColor(120, 120, 120); // Lighter gray for date
    docPDF.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, docPDF.internal.pageSize.width / 2, 160, { align: 'center' });

    // Signature line (optional, for aesthetics)
    docPDF.line(60, 200, 150, 200); // Draw a line
    docPDF.text("Signature of Authority", 105, 205, { align: 'center' });

    // Save the PDF
    const filename = `${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`; // Sanitize filename
    docPDF.save(filename);
    alert("Certificate downloaded!");

  } catch (error) {
    console.error("Error generating certificate:", error);
    alert("Failed to generate certificate. Please try again.");
  }
};