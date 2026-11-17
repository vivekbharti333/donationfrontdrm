const fs = require('fs');
const path = require('path');
const root = 'C:/Users/HP/git/mycrmApi';
const out = 'docs/backend/monthly-fee-report';
const changes = {};
const controller = 'src/main/java/com/school/controller/FeeController.java';
let c = fs.readFileSync(path.join(root, controller), 'utf8');
const existing = c.slice(c.indexOf('    @RequestMapping(path = "getStudentDueFeeReport"'), c.indexOf('\n\t\r\n\t@Autowired'));
const endpoint = existing.replaceAll('getStudentDueFeeReport', 'getMonthlyFeeReport').replaceAll('StudentDueFeeReportResponse', 'MonthlyFeeReportResponse').replaceAll('due fee report', 'monthly fee report');
c = c.replace('public class FeeController {', 'public class FeeController {\n' + endpoint);
c = c.replace('import com.school.object.response.StudentDueFeeReportResponse;', 'import com.school.object.response.StudentDueFeeReportResponse;\nimport com.school.object.response.MonthlyFeeReportResponse;');
changes[controller] = c;
const service = 'src/main/java/com/school/services/FeeService.java';
let s = fs.readFileSync(path.join(root, service), 'utf8');
s = s.replace('public class FeeService {', `public class FeeService {

    @org.springframework.transaction.annotation.Transactional(readOnly = true,
        isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public List<com.school.object.response.MonthlyFeeReportResponse> getMonthlyFeeReport(Request<SchoolReceiptRequest> request) throws BizException {
        validateRequestWrapper(request);
        SchoolReceiptRequest filter = request.getPayload();
        feeHelper.validateReceiptRequest(filter);
        requireText(filter.getSuperadminId(), "superadminId");
        requireText(filter.getSessionName(), "sessionName");
        String session = filter.getSessionName().trim();
        if (!session.matches("[0-9]{4}-([0-9]{2}|[0-9]{4})"))
            throw new BizException(Constant.BAD_REQUEST_CODE, "sessionName must be an academic year, for example 2026-27");
        int year = Integer.parseInt(session.substring(0, 4));
        String end = session.substring(5);
        if (year < 1900 || year > 9998 || Integer.parseInt(end) != (end.length() == 2 ? (year + 1) % 100 : year + 1))
            throw new BizException(Constant.BAD_REQUEST_CODE, "sessionName must contain consecutive academic years");
        filter.setSessionName(session);
        filter.setSuperadminId(filter.getSuperadminId().trim());
        // This report always covers exactly one complete academic session.
        filter.setIncludePreviousSessions(false);
        List<com.school.object.response.MonthlyFeeReportResponse> result = new ArrayList<>();
        for (int index = 0; index < 12; index++) {
            com.school.object.response.MonthlyFeeReportResponse row = new com.school.object.response.MonthlyFeeReportResponse();
            row.setMonth(monthName(index) + " " + (index < 9 ? year : year + 1));
            result.add(row);
        }
        Map<Long, List<Object[]>> payments = new LinkedHashMap<>();
        for (Object[] payment : feeHelper.getMonthlyFeeReportPayments(filter))
            payments.computeIfAbsent(((Number) payment[0]).longValue(), key -> new ArrayList<>())
                .add(new Object[] { payment[1], payment[2] });
        Map<String, List<StudentFee>> lifetime = new LinkedHashMap<>();
        for (StudentFee fee : feeHelper.getDueFeeReportLifetimeAssignments(filter))
            lifetime.computeIfAbsent(lifetimeKey(fee), key -> new ArrayList<>()).add(fee);
        java.util.Set<String> counted = new java.util.HashSet<>();
        for (Object[] assignment : feeHelper.getMonthlyFeeReportAssignments(filter)) {
            StudentFee fee = (StudentFee) assignment[0];
            int period = monthlyFeeHelper.periodMonths(fchromee);
            if (period > 0) {
                for (int index = 0; index < 12; index += period) {
                    com.school.helper.MonthlyFeeHelper.Balance balance = monthlyFeeHelper.balance(fee, monthName(index),
                        payments.getOrDefault(fee.getId(), Collections.emptyList()));
                    addMonthlyFee(result.get(index), balance);
                }
            } else if (monthlyFeeHelper.isOneTime(fee)) {
                List<StudentFee> all = lifetime.getOrDefault(lifetimeKey(fee), Collections.emptyList());
                // Charge school-life fees only in their original session.
                if (!all.isEmpty() && session.equals(all.get(0).getStudentAcademic().getSessionName()) && counted.add(lifetimeKey(fee)))
                    addMonthlyFee(result.get(0), monthlyFeeHelper.lifetimeBalance(fee, all));
            } else if ("YEARLY".equalsIgnoreCase(String.valueOf(fee.getFeeStructure().getFrequency()).trim())) {
                BigDecimal payable = fee.getPayableAmount() == null ? money(fee.getAssignedAmount())
                    .subtract(money(fee.getDiscountAmount())).add(money(fee.getFineAmount())).max(BigDecimal.ZERO) : money(fee.getPayableAmount());
                BigDecimal paid = money(fee.getPaidAmount());
                addMonthlyFee(result.get(0), new com.school.helper.MonthlyFeeHelper.Balance(null, payable, paid, payable.subtract(paid).max(BigDecimal.ZERO)));
            } else throw new BizException(Constant.BAD_REQUEST_CODE, "Unrecognized fee frequency. Review this fee structure.");
        }
        return result;
    }

    private void addMonthlyFee(com.school.object.response.MonthlyFeeReportResponse row, com.school.helper.MonthlyFeeHelper.Balance balance) {
        row.setTotalFee(row.getTotalFee().add(balance.payable).setScale(2, java.math.RoundingMode.HALF_UP));
        row.setDueFee(row.getDueFee().add(balance.remaining).setScale(2, java.math.RoundingMode.HALF_UP));
        row.setReceivedFee(row.getReceivedFee().add(balance.paid).setScale(2, java.math.RoundingMode.HALF_UP));
    }
`.replace('fchromee', 'fee'));
changes[service] = s;
const helper = 'src/main/java/com/school/helper/FeeHelper.java';
let h = fs.readFileSync(path.join(root, helper), 'utf8');
h = h.replace('public class FeeHelper {', `public class FeeHelper {

    public List<Object[]> getMonthlyFeeReportAssignments(SchoolReceiptRequest request) {
        return getDueFeeReportAssignments(request);
    }

    public List<Object[]> getMonthlyFeeReportPayments(SchoolReceiptRequest request) {
        return getDueFeeReportPayments(request);
    }
`);
changes[helper] = h;
changes['src/main/java/com/school/object/response/MonthlyFeeReportResponse.java'] = `package com.school.object.response;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class MonthlyFeeReportResponse {
    private String month;
    private BigDecimal totalFee = BigDecimal.ZERO.setScale(2);
    private BigDecimal dueFee = BigDecimal.ZERO.setScale(2);
    private BigDecimal receivedFee = BigDecimal.ZERO.setScale(2);
}
`;
let patch = '';
for (const [name, content] of Object.entries(changes)) {
    const dest = path.join(out, name);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content);
    const before = fs.existsSync(path.join(root, name)) ? fs.readFileSync(path.join(root, name), 'utf8').replace(/\r\n/g, '\n') : '';
    const after = content.replace(/\r\n/g, '\n');
    const a = before.trimEnd().split('\n'), b = after.trimEnd().split('\n');
    patch += 'diff --git a/' + name + ' b/' + name + '\n';
    if (!before) patch += 'new file mode 100644\n';
    patch += '--- ' + (before ? 'a/' + name : '/dev/null') + '\n+++ b/' + name + '\n';
    patch += '@@ -' + (before ? '1,' + a.length : '0,0') + ' +1,' + b.length + ' @@\n';
    if (before) patch += a.map(line => '-' + line).join('\n') + '\n';
    patch += b.map(line => '+' + line).join('\n') + '\n';
}
fs.writeFileSync(path.join(out, 'monthly-fee-report.patch'), patch);
