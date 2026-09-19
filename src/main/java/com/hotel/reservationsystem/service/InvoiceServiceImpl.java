package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.InvoiceItem;
import com.hotel.reservationsystem.dto.InvoiceResponse;
import com.hotel.reservationsystem.entity.Invoice;
import com.hotel.reservationsystem.entity.Payment;
import com.hotel.reservationsystem.entity.Reservation;
import com.hotel.reservationsystem.exception.ResourceNotFoundException;
import com.hotel.reservationsystem.repository.InvoiceRepository;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * UC-05 – Process Payment and Generate Invoice.
 * Owned by: Payment & Billing Management (Ranaweera R.A.Y.N. / IT25104079).
 */
@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    /** Sri Lankan standard VAT rate applied to hotel charges in this coursework model. */
    private static final BigDecimal TAX_RATE = new BigDecimal("0.10");

    private final InvoiceRepository invoiceRepository;

    @Override
    public Invoice generateInvoice(Payment payment) {
        Reservation reservation = payment.getReservation();

        // The reservation's totalAmount is authoritative (computed by the
        // Reservation module, UC-04). We back-calculate a subtotal/tax split
        // from it purely for display on the itemized invoice.
        BigDecimal grandTotal = reservation.getTotalAmount();
        BigDecimal subTotal = grandTotal.divide(BigDecimal.ONE.add(TAX_RATE), 2, RoundingMode.HALF_UP);
        BigDecimal taxAmount = grandTotal.subtract(subTotal);

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setPayment(payment);
        invoice.setReservation(reservation);
        invoice.setSubTotal(subTotal);
        invoice.setTaxAmount(taxAmount);
        invoice.setGrandTotal(grandTotal);

        return invoiceRepository.save(invoice);
    }

    @Override
    public InvoiceResponse getInvoiceByNumber(String invoiceNumber) {
        Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceNumber));
        return toDto(invoice);
    }

    @Override
    public List<InvoiceResponse> getInvoicesForReservation(Long reservationId) {
        return invoiceRepository.findByReservationIdOrderByIssuedAtDesc(reservationId)
                .stream().map(this::toDto).toList();
    }

    @Override
    public List<InvoiceResponse> getInvoicesForCustomer(Long customerId) {
        return invoiceRepository.findByReservation_Customer_IdOrderByIssuedAtDesc(customerId)
                .stream().map(this::toDto).toList();
    }

    @Override
    public byte[] generateInvoicePdf(String invoiceNumber) {
        Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceNumber));
        String html = renderHtml(invoice);

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to render invoice PDF: " + e.getMessage(), e);
        }
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    private String generateInvoiceNumber() {
        String datePart = java.time.LocalDate.now().toString().replace("-", "");
        int randomPart = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "INV-" + datePart + "-" + randomPart;
    }

    private List<InvoiceItem> buildLineItems(Reservation reservation) {
        List<InvoiceItem> items = new ArrayList<>();

        if (reservation.getRoom() != null) {
            long nights = Math.max(1, ChronoUnit.DAYS.between(reservation.getCheckIn(), reservation.getCheckOut()));
            BigDecimal unitPrice = reservation.getRoom().getPricePerNight();
            items.add(InvoiceItem.builder()
                    .description("Room " + reservation.getRoom().getRoomNumber()
                            + " (" + reservation.getRoom().getRoomType() + ")")
                    .quantity((int) nights)
                    .unitPrice(unitPrice)
                    .lineTotal(unitPrice.multiply(BigDecimal.valueOf(nights)))
                    .build());
        }

        if (reservation.getHall() != null) {
            BigDecimal unitPrice = reservation.getHall().getPricePerEvent();
            items.add(InvoiceItem.builder()
                    .description(reservation.getHall().getName() + " - Event Hall Booking")
                    .quantity(1)
                    .unitPrice(unitPrice)
                    .lineTotal(unitPrice)
                    .build());
        }

        if (reservation.getEventPackage() != null) {
            BigDecimal unitPrice = reservation.getEventPackage().getPrice();
            items.add(InvoiceItem.builder()
                    .description(reservation.getEventPackage().getName() + " Package")
                    .quantity(1)
                    .unitPrice(unitPrice)
                    .lineTotal(unitPrice)
                    .build());
        }

        if (items.isEmpty()) {
            items.add(InvoiceItem.builder()
                    .description("Reservation " + reservation.getConfirmationCode())
                    .quantity(1)
                    .unitPrice(reservation.getTotalAmount())
                    .lineTotal(reservation.getTotalAmount())
                    .build());
        }
        return items;
    }

    private InvoiceResponse toDto(Invoice invoice) {
        Reservation reservation = invoice.getReservation();
        return InvoiceResponse.builder()
                .invoiceId(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .reservationId(reservation.getId())
                .reservationConfirmationCode(reservation.getConfirmationCode())
                .customerName(reservation.getUser().getName())
                .customerEmail(reservation.getUser().getEmail())
                .items(buildLineItems(reservation))
                .subTotal(invoice.getSubTotal())
                .taxAmount(invoice.getTaxAmount())
                .grandTotal(invoice.getGrandTotal())
                .status(invoice.getStatus())
                .issuedAt(invoice.getIssuedAt())
                .build();
    }

    private String renderHtml(Invoice invoice) {
        InvoiceResponse dto = toDto(invoice);
        StringBuilder rows = new StringBuilder();
        for (InvoiceItem item : dto.getItems()) {
            rows.append("<tr>")
                    .append("<td>").append(item.getDescription()).append("</td>")
                    .append("<td style='text-align:center'>").append(item.getQuantity()).append("</td>")
                    .append("<td style='text-align:right'>LKR ").append(item.getUnitPrice()).append("</td>")
                    .append("<td style='text-align:right'>LKR ").append(item.getLineTotal()).append("</td>")
                    .append("</tr>");
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

        return "<html><head><style>"
                + "body{font-family:Georgia, 'Times New Roman', serif;color:#2b2117;margin:40px;}"
                + "h1{color:#7a1f2b;border-bottom:3px solid #c9a24b;padding-bottom:8px;letter-spacing:1px;}"
                + "table{width:100%;border-collapse:collapse;margin-top:20px;}"
                + "th{background:#7a1f2b;color:#f6ecd9;padding:8px;text-align:left;}"
                + "td{padding:8px;border-bottom:1px solid #e2d6bd;}"
                + ".totals td{border:none;font-weight:bold;}"
                + ".muted{color:#7c7060;font-size:12px;}"
                + "</style></head><body>"
                + "<h1>Cinnamon Grand &mdash; Hotel Reservation System</h1>"
                + "<p class='muted'>Invoice " + dto.getInvoiceNumber() + " &bull; Issued " + dto.getIssuedAt().format(fmt) + "</p>"
                + "<p><strong>Bill To:</strong> " + dto.getCustomerName() + " (" + dto.getCustomerEmail() + ")<br/>"
                + "<strong>Reservation:</strong> " + dto.getReservationConfirmationCode() + "</p>"
                + "<table><thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Line Total</th></tr></thead>"
                + "<tbody>" + rows + "</tbody>"
                + "<tfoot>"
                + "<tr class='totals'><td colspan='3' style='text-align:right'>Subtotal</td><td style='text-align:right'>LKR " + dto.getSubTotal() + "</td></tr>"
                + "<tr class='totals'><td colspan='3' style='text-align:right'>VAT (10%)</td><td style='text-align:right'>LKR " + dto.getTaxAmount() + "</td></tr>"
                + "<tr class='totals'><td colspan='3' style='text-align:right'>Grand Total</td><td style='text-align:right'>LKR " + dto.getGrandTotal() + "</td></tr>"
                + "</tfoot></table>"
                + "<p class='muted' style='margin-top:40px'>Thank you for choosing us for your special event.</p>"
                + "</body></html>";
    }
}
