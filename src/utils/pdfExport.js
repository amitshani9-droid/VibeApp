import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { heeboBase64 } from './heeboFont';

/**
 * Generates a PDF report for the user's work shifts and events.
 * 
 * @param {Array} data - The shift data to export.
 * @param {string} userName - The name of the user.
 * @param {string} employeeId - The employee ID.
 */
export const generatePDF = (data, userName, employeeId) => {
    // 1. Initialize jsPDF
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true
    });

    // 2. Add Hebrew Font (Heebo)
    doc.addFileToVFS('Heebo-Regular.ttf', heeboBase64);
    doc.addFont('Heebo-Regular.ttf', 'Heebo', 'normal');
    doc.setFont('Heebo');

    // 3. Set Right-to-Left (Basic support in jsPDF)
    doc.setRTL(true);

    // 4. Header
    const date = new Date().toLocaleDateString('he-IL');
    doc.setFontSize(22);
    doc.text(`דוח פעילות - VIBE`, 200, 20, { align: 'right' });

    doc.setFontSize(14);
    doc.text(`שם עובד: ${userName}`, 200, 32, { align: 'right' });
    doc.text(`מספר עובד: ${employeeId || '---'}`, 200, 40, { align: 'right' });
    doc.text(`תאריך הפקה: ${date}`, 200, 48, { align: 'right' });

    // 5. Build Table
    const tableHeaders = [['הכנסה', 'סטטוס', 'שעות', 'תאריך']]; // Reversed for RTL layout in autotable

    const tableData = data.map(trip => {
        let grossPay = 400; // Base Pay (simplified for utility, could be passed from caller)
        if (trip.hours === 0 && trip.notes && trip.notes.includes('קורס')) grossPay = 0;
        if (trip.hours > 10) grossPay += (trip.hours - 10) * 56;
        if (trip.isSleepover) grossPay += 80;

        return [
            `₪${grossPay}`,
            trip.hours === 0 ? 'קורס' : 'משמרת',
            trip.hours.toString(),
            trip.date
        ];
    });

    // Handle Notes separately if needed, but let's keep it clean first.
    // If notes are needed:
    // tableHeaders[0].unshift('הערות');
    // tableData.forEach((row, idx) => row.unshift(data[idx].notes || ''));

    doc.autoTable({
        startY: 60,
        head: tableHeaders,
        body: tableData,
        styles: {
            font: 'Heebo',
            fontSize: 10,
            halign: 'right', // Align all content to the right
        },
        headStyles: {
            fillColor: [59, 130, 246], // Vibe Blue
            textColor: 255,
            fontSize: 12
        },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 30 },
            2: { cellWidth: 30 },
            3: { cellWidth: 30 }
        },
        // We might need to manually reverse strings if the PDF render is backward, 
        // but modern jsPDF with addFileToVFS usually handles basic strings well if doc.setRTL is on.
    });

    // 6. Download
    const fileName = `Vibe_Report_${userName.split(' ')[0]}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
};
