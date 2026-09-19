package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.PaymentRequest;
import com.hotel.reservationsystem.entity.enums.PaymentMethod;
import com.hotel.reservationsystem.exception.InvalidPaymentException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.Map;
import java.util.Random;

/**
 * UC-05 – Process Payment and Generate Invoice.
 * Owned by: Payment & Billing Management (Ranaweera R.A.Y.N. / IT25104079).
 *
 * Everything the "choose the right payment gateway and run it" job needs
 * lives in this one class, instead of being spread across a separate
 * interface / three strategy files / a result type. The design is still
 * Strategy + Factory (see the nested {@link PaymentStrategy} interface and
 * its three implementations below) — it is just packaged as one file:
 *
 *  - {@link PaymentStrategy}          the strategy contract (nested interface)
 *  - {@link CardPaymentStrategy}      handles CREDIT_CARD / DEBIT_CARD
 *  - {@link BankTransferPaymentStrategy} handles BANK_TRANSFER
 *  - {@link CashPaymentStrategy}      handles CASH
 *  - {@link PaymentGatewayResult}     the outcome every strategy returns
 *  - {@link PaymentStrategyFactory}   (this outer class) resolves the right
 *                                     strategy bean for a given PaymentMethod
 */
@Component
public class PaymentStrategyFactory {

    private final Map<PaymentMethod, PaymentStrategy> strategies = new EnumMap<>(PaymentMethod.class);

    public PaymentStrategyFactory(CardPaymentStrategy cardPaymentStrategy,
                                  BankTransferPaymentStrategy bankTransferPaymentStrategy,
                                  CashPaymentStrategy cashPaymentStrategy) {
        strategies.put(PaymentMethod.CREDIT_CARD, cardPaymentStrategy);
        strategies.put(PaymentMethod.DEBIT_CARD, cardPaymentStrategy);
        strategies.put(PaymentMethod.BANK_TRANSFER, bankTransferPaymentStrategy);
        strategies.put(PaymentMethod.CASH, cashPaymentStrategy);
    }

    public PaymentStrategy getStrategy(PaymentMethod method) {
        PaymentStrategy strategy = strategies.get(method);
        if (strategy == null) {
            throw new InvalidPaymentException("Unsupported payment method: " + method);
        }
        return strategy;
    }

    // -----------------------------------------------------------------
    // Strategy contract
    // -----------------------------------------------------------------

    /**
     * Strategy design pattern: each {@link PaymentMethod} gets its own
     * gateway implementation, so PaymentServiceImpl can process a payment
     * without an if/else chain and new methods can be added (e.g. a real
     * Stripe/PayHere gateway) without touching existing code.
     */
    public interface PaymentStrategy {

        /**
         * Validates the method-specific fields on the request (UC-05 step 6,
         * "System validates the payment information") and, if valid, attempts
         * to charge the given amount (UC-05 step 7, "System processes the payment").
         */
        PaymentGatewayResult pay(PaymentRequest request, BigDecimal amount);
    }

    // -----------------------------------------------------------------
    // Strategy implementations
    // -----------------------------------------------------------------

    /**
     * Handles CREDIT_CARD and DEBIT_CARD payments.
     * This is a simulated gateway suitable for a coursework demo: it validates
     * the card fields locally (Luhn check, expiry, CVV) and then "authorises"
     * the charge. Swapping this out for a real processor (Stripe/PayHere) only
     * means replacing the body of {@code pay}; nothing else in the service
     * layer needs to change, which is the point of the Strategy pattern here.
     */
    @Component
    public static class CardPaymentStrategy implements PaymentStrategy {

        private static final DateTimeFormatter EXPIRY_FORMAT = DateTimeFormatter.ofPattern("MM/yy");
        private final Random random = new Random();

        @Override
        public PaymentGatewayResult pay(PaymentRequest request, BigDecimal amount) {
            validate(request);

            // Simulated authorisation: cards ending in "0000" are used in the
            // demo/test data to deliberately exercise the "payment failed" path
            // (UC-05 Extension 7a).
            if (request.getCardNumber().endsWith("0000")) {
                return PaymentGatewayResult.failure("Card declined by issuing bank. Please try another card.");
            }

            String masked = "**** **** **** " + request.getCardNumber().substring(request.getCardNumber().length() - 4);
            String authCode = "AUTH-" + (100000 + random.nextInt(899999));
            return PaymentGatewayResult.success(masked + " (" + authCode + ")");
        }

        private void validate(PaymentRequest request) {
            if (request.getCardNumber() == null || !isLuhnValid(request.getCardNumber())) {
                throw new InvalidPaymentException("Card number is invalid.");
            }
            if (request.getCardHolderName() == null || request.getCardHolderName().isBlank()) {
                throw new InvalidPaymentException("Card holder name is required.");
            }
            if (request.getCvv() == null || !request.getCvv().matches("^[0-9]{3,4}$")) {
                throw new InvalidPaymentException("CVV is invalid.");
            }
            if (request.getCardExpiry() == null || !isExpiryValid(request.getCardExpiry())) {
                throw new InvalidPaymentException("Card expiry date is invalid or the card has expired.");
            }
        }

        private boolean isExpiryValid(String expiry) {
            try {
                YearMonth cardExpiry = YearMonth.parse(expiry, EXPIRY_FORMAT);
                return !cardExpiry.isBefore(YearMonth.now());
            } catch (Exception e) {
                return false;
            }
        }

        /** Standard Luhn checksum used to catch obviously mistyped card numbers. */
        private boolean isLuhnValid(String cardNumber) {
            if (!cardNumber.matches("^[0-9]{13,19}$")) return false;
            int sum = 0;
            boolean alternate = false;
            for (int i = cardNumber.length() - 1; i >= 0; i--) {
                int n = Character.getNumericValue(cardNumber.charAt(i));
                if (alternate) {
                    n *= 2;
                    if (n > 9) n -= 9;
                }
                sum += n;
                alternate = !alternate;
            }
            return sum % 10 == 0;
        }
    }

    /**
     * Handles BANK_TRANSFER payments. In the real system this would reconcile
     * against a bank statement feed; here it accepts the reference number the
     * receptionist keys in after confirming the transfer offline
     * (UC-05 Extension 8a: "If an authorized staff member records a payment...").
     */
    @Component
    public static class BankTransferPaymentStrategy implements PaymentStrategy {

        @Override
        public PaymentGatewayResult pay(PaymentRequest request, BigDecimal amount) {
            if (request.getBankReferenceNumber() == null || request.getBankReferenceNumber().isBlank()) {
                throw new InvalidPaymentException("Bank reference number is required for bank transfer payments.");
            }
            if (request.getBankName() == null || request.getBankName().isBlank()) {
                throw new InvalidPaymentException("Bank name is required for bank transfer payments.");
            }
            return PaymentGatewayResult.success(request.getBankName() + " / Ref: " + request.getBankReferenceNumber());
        }
    }

    /**
     * Handles CASH payments taken in person at the front desk
     * (UC-05 Extension 8a). Always succeeds immediately since the money has
     * already changed hands by the time the receptionist records it.
     */
    @Component
    public static class CashPaymentStrategy implements PaymentStrategy {

        @Override
        public PaymentGatewayResult pay(PaymentRequest request, BigDecimal amount) {
            return PaymentGatewayResult.success("Cash received at front desk");
        }
    }

    // -----------------------------------------------------------------
    // Result type
    // -----------------------------------------------------------------

    /**
     * Outcome returned by any {@link PaymentStrategy}. Kept gateway-agnostic
     * so PaymentServiceImpl never needs to know which concrete strategy ran.
     */
    public record PaymentGatewayResult(boolean success, String referenceInfo, String failureReason) {

        public static PaymentGatewayResult success(String referenceInfo) {
            return new PaymentGatewayResult(true, referenceInfo, null);
        }

        public static PaymentGatewayResult failure(String reason) {
            return new PaymentGatewayResult(false, null, reason);
        }
    }
}
