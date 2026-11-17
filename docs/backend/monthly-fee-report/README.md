# Monthly fee report backend

The Angular screen calls POST getMonthlyFeeReport with { "payload": { "sessionName": "2026-27", "superadminId": "..." } }.
The response uses the existing responseCode/listPayload envelope. Each row contains month, totalFee, dueFee and receivedFee.

Apply the patch from the mycrmApi repository, then build and deploy the API:

    git apply --check --ignore-space-change D:/Angular/donationfrontdrm/docs/backend/monthly-fee-report/monthly-fee-report.patch
    git apply --ignore-space-change D:/Angular/donationfrontdrm/docs/backend/monthly-fee-report/monthly-fee-report.patch

The patch modifies FeeController, FeeService and FeeHelper, and adds MonthlyFeeReportResponse. Source copies are supplied under src for review; apply the patch rather than replacing entire existing files.

Calculations reuse MonthlyFeeHelper and tenant-scoped assignment/payment queries. The complete academic year runs April to March. Recurring installments are charged at the start of their period. Yearly and original school-life charges appear in April. TotalFee is the payable assigned fee after discount and fine. ReceivedFee follows the installment being paid, not the receipt date. Cancelled assignments/receipts are excluded by the existing queries. Payments without an identifiable recurring installment return a validation error instead of misleading totals.

The API is now implemented in the mycrmApi working tree. The patch and source copies above are retained as reference; do not apply the patch again to an already updated checkout. Deploy the updated backend together with the Angular application.

The same screen also offers a Month and Fee Type radio option. It calls POST getMonthlyFeeTypeReport with the same payload and response envelope. Detail rows include feeTypeId and feeType and are grouped by installment month and fee type ID. Both reports share the same balance calculations. The original monthly endpoint retains its response fields. The reference patch predates this second view; use the current API source for deployment.
