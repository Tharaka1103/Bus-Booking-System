// app/api/bookings/generate-report/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Bookings';
import { verifyToken, hasPermission } from '@/lib/auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!hasPermission(decoded.role, 'bookings:read')) {
      return NextResponse.json({
        success: false,
        message: 'Forbidden'
      }, { status: 403 });
    }

    const body = await request.json();
    const { filters, bookings: bookingIds } = body;

    await connectToDatabase();

    // Fetch bookings with populated data
    const bookings = await Booking.find({
      _id: { $in: bookingIds }
    })
      .populate('userId', 'firstName lastName email phone')
      .populate('busId', 'busNumber type capacity departureTime')
      .populate('routeId', 'name fromLocation toLocation price distance duration')
      .sort({ travelDate: -1, createdAt: -1 });

    // Create PDF - A4 Portrait
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Define margins
    const margins = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    };

    const pageWidth = 210; // A4 width in mm
    const contentWidth = pageWidth - margins.left - margins.right;
    let yPos = margins.top;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > 277) { // 297 - bottom margin
        doc.addPage();
        yPos = margins.top;
        return true;
      }
      return false;
    };

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('BOOKING REPORT', margins.left, yPos);
    yPos += 10;

    // Divider line
    doc.setLineWidth(0.5);
    doc.line(margins.left, yPos, pageWidth - margins.right, yPos);
    yPos += 8;

    // Report Information
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Generated: ${format(new Date(), 'dd MMMM yyyy, HH:mm')}`, margins.left, yPos);
    yPos += 5;
    doc.text('Bus Booking Management System', margins.left, yPos);
    yPos += 10;

    // Applied Filters Section
    if (filters.date || filters.routeId || filters.busId || filters.status || filters.paymentStatus) {
      checkPageBreak(30);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Applied Filters', margins.left, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      if (filters.date) {
        doc.text('Travel Date:', margins.left, yPos);
        doc.text(format(new Date(filters.date), 'dd MMMM yyyy'), margins.left + 35, yPos);
        yPos += 5;
      }

      if (filters.routeId && bookings.length > 0) {
        const route = typeof bookings[0].routeId === 'object' ? bookings[0].routeId : null;
        if (route) {
          doc.text('Route:', margins.left, yPos);
          doc.text(`${route.name} (${route.fromLocation} to ${route.toLocation})`, margins.left + 35, yPos);
          yPos += 5;
        }
      }

      if (filters.busId && bookings.length > 0) {
        const bus = typeof bookings[0].busId === 'object' ? bookings[0].busId : null;
        if (bus) {
          doc.text('Bus:', margins.left, yPos);
          doc.text(`${bus.busNumber} - ${bus.type} (Departure: ${bus.departureTime})`, margins.left + 35, yPos);
          yPos += 5;
        }
      }

      if (filters.status) {
        doc.text('Status:', margins.left, yPos);
        doc.text(filters.status.toUpperCase(), margins.left + 35, yPos);
        yPos += 5;
      }

      if (filters.paymentStatus) {
        doc.text('Payment Status:', margins.left, yPos);
        doc.text(filters.paymentStatus.toUpperCase(), margins.left + 35, yPos);
        yPos += 5;
      }

      yPos += 5;
    }

    // Summary Statistics Section
    checkPageBreak(40);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', margins.left, yPos);
    yPos += 6;

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalAmount, 0);
    const totalPending = bookings
      .filter(b => b.paymentStatus === 'pending')
      .reduce((sum, b) => sum + b.totalAmount, 0);
    const totalRefunded = bookings
      .filter(b => b.paymentStatus === 'refunded')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Bookings Summary
    doc.text('Total Bookings:', margins.left, yPos);
    doc.text(totalBookings.toString(), margins.left + 50, yPos);
    yPos += 5;

    doc.text('Confirmed:', margins.left + 10, yPos);
    doc.text(confirmedBookings.toString(), margins.left + 50, yPos);
    yPos += 5;

    doc.text('Pending:', margins.left + 10, yPos);
    doc.text(pendingBookings.toString(), margins.left + 50, yPos);
    yPos += 5;

    doc.text('Cancelled:', margins.left + 10, yPos);
    doc.text(cancelledBookings.toString(), margins.left + 50, yPos);
    yPos += 8;

    // Financial Summary
    doc.text('Total Revenue (Paid):', margins.left, yPos);
    doc.text(`LKR ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/=`, margins.left + 50, yPos);
    yPos += 5;

    doc.text('Pending Amount:', margins.left, yPos);
    doc.text(`LKR ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/=`, margins.left + 50, yPos);
    yPos += 5;

    doc.text('Refunded Amount:', margins.left, yPos);
    doc.text(`LKR ${totalRefunded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/=`, margins.left + 50, yPos);
    yPos += 10;

    // Divider line
    doc.setLineWidth(0.5);
    doc.line(margins.left, yPos, pageWidth - margins.right, yPos);
    yPos += 8;

    // Bookings Details Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Details', margins.left, yPos);
    yPos += 8;

    // Table data
    const tableData = bookings.map(booking => {
      const bus = typeof booking.busId === 'object' ? booking.busId : null;

      return [
        `#${booking._id.toString().slice(-6).toUpperCase()}`,
        booking.passengerName,
        booking.passengerPhone,
        bus ? `${bus.busNumber}\n${bus.departureTime}` : 'N/A',
        booking.seatNumbers.join(', '),
        `${booking.totalAmount.toLocaleString()}`,
        booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
        booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)
      ];
    });

    // Generate Table
    autoTable(doc, {
      startY: yPos,
      head: [[
        'Booking ID',
        'Passenger',
        'Phone',
        'Bus',
        'Seats',
        'Amount (LKR)',
        'Status',
        'Payment'
      ]],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        textColor: [0, 0, 0],
        halign: 'left'
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 8,
        lineColor: [0, 0, 0],
        lineWidth: 0.3
      },
      bodyStyles: {
        fillColor: [255, 255, 255]
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      columnStyles: {
        0: { cellWidth: 22 },  // Booking ID
        1: { cellWidth: 30 },  // Passenger
        2: { cellWidth: 25 },  // Phone
        3: { cellWidth: 15 },  // Bus
        4: { cellWidth: 18 },  // Seats
        5: { cellWidth: 25, halign: 'right' },  // Amount
        6: { cellWidth: 20 },  // Status
        7: { cellWidth: 22 }   // Payment
      },
      margin: { left: margins.left, right: margins.right },
      didDrawPage: function(data) {
        // Update yPos after table
        yPos = data.cursor?.y || yPos;
      }
    });

    // Footer on each page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      
      // Bottom left - System name
      doc.text(
        'Bus Booking Management System',
        margins.left,
        297 - margins.bottom + 5
      );
      
      // Bottom center - Page number
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        297 - margins.bottom + 5,
        { align: 'center' }
      );
      
      // Bottom right - Date/Time
      doc.text(
        format(new Date(), 'dd/MM/yyyy HH:mm'),
        pageWidth - margins.right,
        297 - margins.bottom + 5,
        { align: 'right' }
      );
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=booking-report-${format(new Date(), 'yyyyMMdd-HHmmss')}.pdf`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({
      success: false,
      message: 'Error generating PDF report'
    }, { status: 500 });
  }
}