package com.school.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Locale;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.common.constant.Constant;
import com.common.exceptions.BizException;
import com.common.object.request.Request;
import com.school.entities.FeeReceipt;
import com.school.entities.FeeReceiptDetails;
import com.school.entities.FeeStructure;
import com.school.entities.FeeType;
import com.school.entities.StudentAcademic;
import com.school.entities.StudentFee;
import com.school.helper.FeeHelper;
import com.school.helper.StudentAcademicHelper;
import com.school.object.request.SchoolReceiptDetailsRequest;
import com.school.object.request.FeeStructureItemRequest;
import com.school.object.request.SchoolReceiptRequest;
import com.school.object.response.StudentFeeResponse;
import com.school.object.response.StudentDueFeeReportResponse;


@Service
public class FeeService {

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
            int period = monthlyFeeHelper.periodMonths(fee);
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


    @org.springframework.transaction.annotation.Transactional(readOnly = true,
        isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public List<StudentDueFeeReportResponse> getStudentDueFeeReport(Request<SchoolReceiptRequest> request) throws BizException {
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
        if ((filter.getStudentId() != null && filter.getStudentId() <= 0)
            || (filter.getStudentAcademicId() != null && filter.getStudentAcademicId() <= 0))
            throw new BizException(Constant.BAD_REQUEST_CODE, "Student IDs must be positive");
        if (filter.getFeeTypeIds() != null && (filter.getFeeTypeIds().size() > 100
            || filter.getFeeTypeIds().stream().anyMatch(id -> id == null || id <= 0)))
            throw new BizException(Constant.BAD_REQUEST_CODE, "feeTypeIds must contain at most 100 positive IDs");
        filter.setSessionName(session);
        filter.setSuperadminId(filter.getSuperadminId().trim());
        LocalDate start = LocalDate.of(year, 4, 1);
        boolean previous = Boolean.TRUE.equals(filter.getIncludePreviousSessions());
        LocalDate today = LocalDate.now();
        String through = monthlyFeeHelper.canonicalMonth(filter.getDueThroughMonth());
        int lastMonth;
        if (filter.getDueThroughMonth() != null && !filter.getDueThroughMonth().trim().isEmpty()) {
            if (previous) throw new BizException(Constant.BAD_REQUEST_CODE, "Choose either all previous dues or a due-through month");
            if (through == null) throw new BizException(Constant.BAD_REQUEST_CODE, "dueThroughMonth must be a month name");
            lastMonth = (Month.valueOf(through.toUpperCase(Locale.ROOT)).getValue() + 8) % 12;
        } else {
            if (today.isBefore(start) && !previous) return Collections.emptyList();
            lastMonth = Math.min(11, (int) java.time.temporal.ChronoUnit.MONTHS.between(start, today.withDayOfMonth(1)));
            through = lastMonth < 0 ? null : monthName(lastMonth);
        }
        List<Object[]> assignments = feeHelper.getDueFeeReportAssignments(filter);
        if (assignments.isEmpty()) return Collections.emptyList();
        Map<Long, List<Object[]>> payments = new LinkedHashMap<>();
        boolean hasRecurring = assignments.stream().anyMatch(row -> monthlyFeeHelper.isRecurring((StudentFee) row[0]));
        if (hasRecurring) for (Object[] payment : feeHelper.getDueFeeReportPayments(filter)) {
            Long feeId = ((Number) payment[0]).longValue();
            payments.computeIfAbsent(feeId, key -> new ArrayList<>()).add(new Object[] { payment[1], payment[2] });
        }
        Map<String, List<StudentFee>> lifetimeAssignments = new LinkedHashMap<>();
        if (assignments.stream().anyMatch(row -> monthlyFeeHelper.isOneTime((StudentFee) row[0]))) {
            for (StudentFee fee : feeHelper.getDueFeeReportLifetimeAssignments(filter))
                lifetimeAssignments.computeIfAbsent(lifetimeKey(fee), key -> new ArrayList<>()).add(fee);
        }
        Map<String, StudentDueFeeReportResponse> report = new LinkedHashMap<>();
        java.util.Set<String> reportedLifetimeFees = new java.util.HashSet<>();
        for (Object[] assignment : assignments) {
            StudentFee fee = (StudentFee) assignment[0];
            StudentAcademic academic = fee.getStudentAcademic();
            int feeLastMonth = lastMonth;
            if (previous) {
                String feeSession = academic.getSessionName();
                if (feeSession == null || !feeSession.matches("[0-9]{4}-([0-9]{2}|[0-9]{4})"))
                    throw new BizException(Constant.BAD_REQUEST_CODE, "A fee has an invalid academic year. Review its academic record.");
                LocalDate feeStart = LocalDate.of(Integer.parseInt(feeSession.substring(0, 4)), 4, 1);
                if (feeStart.isAfter(today)) continue;
                feeLastMonth = Math.min(11, (int) java.time.temporal.ChronoUnit.MONTHS.between(feeStart, today.withDayOfMonth(1)));
                if (monthlyFeeHelper.isOneTime(fee) && !reportedLifetimeFees.add(lifetimeKey(fee))) continue;
            }
            String frequency = String.valueOf(fee.getFeeStructure().getFrequency()).trim().toUpperCase(Locale.ROOT);
            String key = academic.getId() + ":" + fee.getFeeStructure().getFeeTypeId() + ":" + frequency;
            boolean existing = report.containsKey(key);
            StudentDueFeeReportResponse row = report.computeIfAbsent(key, ignored -> {
                StudentDueFeeReportResponse entry = new StudentDueFeeReportResponse();
                entry.setStudentId(academic.getStudentId()); entry.setStudentAcademicId(academic.getId());
                entry.setAdmissionNo((String) assignment[1]); entry.setRollNumber(academic.getRollNumber());
                entry.setStudentName((text(assignment[2]) + " " + text(assignment[3])).trim());
                entry.setFatherName((String) assignment[5]);
                entry.setSessionName(academic.getSessionName()); entry.setGrade(academic.getGrade());
                entry.setGradeSection(academic.getGradeSection()); entry.setFeeTypeId(fee.getFeeStructure().getFeeTypeId());
                entry.setFeeTypeName((String) assignment[4]); entry.setFrequency(frequency);
                return entry;
            });
            row.setDueThroughMonth(previous ? monthName(feeLastMonth) : through);
            try {
                int period = monthlyFeeHelper.periodMonths(fee);
                if (period > 0) {
                    List<Object[]> ledger = payments.getOrDefault(fee.getId(), Collections.emptyList());
                    for (int index = 0; index <= feeLastMonth; index += period) {
                        String month = monthName(index);
                        addDueInstallment(row, monthlyFeeHelper.label(fee, month), monthlyFeeHelper.balance(fee, month, ledger));
                    }
                } else if (monthlyFeeHelper.isOneTime(fee)) {
                    if (!existing) addDueInstallment(row, "School life", monthlyFeeHelper.lifetimeBalance(fee,
                        lifetimeAssignments.getOrDefault(lifetimeKey(fee), Collections.emptyList())));
                } else if ("YEARLY".equals(frequency)) {
                    BigDecimal payable = fee.getPayableAmount() == null ? money(fee.getAssignedAmount())
                        .subtract(money(fee.getDiscountAmount())).add(money(fee.getFineAmount())).max(BigDecimal.ZERO) : money(fee.getPayableAmount());
                    BigDecimal paid = money(fee.getPaidAmount());
                    addDueInstallment(row, "Academic session " + academic.getSessionName(),
                        new com.school.helper.MonthlyFeeHelper.Balance(null, payable, paid, payable.subtract(paid).max(BigDecimal.ZERO)));
                } else throw new BizException(Constant.BAD_REQUEST_CODE, "Unrecognized fee frequency. Review this fee structure.");
            } catch (BizException error) {
                row.setRequiresReview(true); row.setReviewMessage(error.getMessage()); row.setTotalDue(null);
            }
        }
        List<StudentDueFeeReportResponse> result = new ArrayList<>();
        for (StudentDueFeeReportResponse row : report.values())
            if (row.isRequiresReview() || row.getTotalDue().signum() > 0) result.add(row);
        return result;
    }

    private String monthName(int academicMonth) {
        return Month.of((academicMonth + 3) % 12 + 1).getDisplayName(TextStyle.FULL, Locale.ENGLISH);
    }

    private String lifetimeKey(StudentFee fee) {
        return fee.getStudentAcademic().getStudentId() + ":" + fee.getFeeStructure().getFeeTypeId();
    }

    private String text(Object value) { return value == null ? "" : value.toString(); }
    private BigDecimal money(BigDecimal value) { return value == null ? BigDecimal.ZERO : value; }

    private void addDueInstallment(StudentDueFeeReportResponse row, String name, com.school.helper.MonthlyFeeHelper.Balance balance) {
        if (balance.remaining.signum() <= 0) return;
        StudentDueFeeReportResponse.Installment item = row.getDueInstallments().stream()
            .filter(entry -> name.equals(entry.getInstallmentName())).findFirst().orElse(null);
        if (item == null) {
            item = new StudentDueFeeReportResponse.Installment(); item.setInstallmentName(name);
            item.setPayableAmount(BigDecimal.ZERO); item.setPaidAmount(BigDecimal.ZERO); item.setBalanceAmount(BigDecimal.ZERO);
            row.getDueInstallments().add(item);
        }
        item.setPayableAmount(item.getPayableAmount().add(balance.payable).setScale(2, java.math.RoundingMode.HALF_UP));
        item.setPaidAmount(item.getPaidAmount().add(balance.paid).setScale(2, java.math.RoundingMode.HALF_UP));
        item.setBalanceAmount(item.getBalanceAmount().add(balance.remaining).setScale(2, java.math.RoundingMode.HALF_UP));
        if (!row.isRequiresReview()) row.setTotalDue(row.getTotalDue().add(balance.remaining).setScale(2, java.math.RoundingMode.HALF_UP));
    }


	@Autowired
	private FeeHelper feeHelper;

	@Autowired
	private StudentAcademicHelper studentAcademicHelper;

    @Autowired
    private com.school.helper.MonthlyFeeHelper monthlyFeeHelper;

    @Autowired
    private com.school.helper.ReceiptHelper receiptHelper;

	public SchoolReceiptRequest addFeeType(Request<SchoolReceiptRequest> schoolReceiptRequest) throws BizException {
		validateRequestWrapper(schoolReceiptRequest);
		SchoolReceiptRequest receiptRequest = schoolReceiptRequest.getPayload();
		feeHelper.validateReceiptRequest(receiptRequest);
		validateFeeType(receiptRequest, false);

		FeeType existsReceipt = feeHelper.getFeeTypeByName(receiptRequest.getFeeTypeName(), receiptRequest.getSuperadminId());
		if (existsReceipt == null) {
			FeeType feeType = feeHelper.getFeeTypeByReqObj(receiptRequest);
			feeType = feeHelper.saveFeeType(feeType);

			receiptRequest.setRespCode(Constant.SUCCESS_CODE);
			receiptRequest.setRespMesg(Constant.INVOICE_GEN_SUCCESS);
			return receiptRequest;
		} else {
			receiptRequest.setRespCode(Constant.ALREADY_EXISTS);
			receiptRequest.setRespMesg(Constant.ALLREADY_EXISTS_MSG);
			return receiptRequest;
		}
	}
	
	@Transactional
	public SchoolReceiptRequest updateFeeType(Request<SchoolReceiptRequest> schoolReceiptRequest) throws BizException {
		validateRequestWrapper(schoolReceiptRequest);
		SchoolReceiptRequest receiptRequest = schoolReceiptRequest.getPayload();
		feeHelper.validateReceiptRequest(receiptRequest);
		validateFeeType(receiptRequest, true);

		FeeType feeType = feeHelper.getFeeTypeById(receiptRequest.getId(), receiptRequest.getSuperadminId());
		if (feeType != null) {
			FeeType duplicate = feeHelper.getFeeTypeByName(receiptRequest.getFeeTypeName(), receiptRequest.getSuperadminId());
			if (duplicate != null && !duplicate.getId().equals(feeType.getId())) {
				receiptRequest.setRespCode(Constant.ALREADY_EXISTS);
				receiptRequest.setRespMesg(Constant.ALLREADY_EXISTS_MSG);
				return receiptRequest;
			}
			feeHelper.getUpdateFeeTypeByReqObj(receiptRequest, feeType);

			receiptRequest.setRespCode(Constant.SUCCESS_CODE);
			receiptRequest.setRespMesg(Constant.INVOICE_GEN_SUCCESS);
			return receiptRequest;
		} else {
			receiptRequest.setRespCode(Constant.BAD_REQUEST_CODE);
			receiptRequest.setRespMesg(Constant.DATA_NOT_FOUND);
			return receiptRequest;
		}
	}

	public List<FeeType> getFeeTypeDetails(Request<SchoolReceiptRequest> schoolReceiptRequest) throws BizException {
		validateRequestWrapper(schoolReceiptRequest);
		SchoolReceiptRequest receiptRequest = schoolReceiptRequest.getPayload();
		feeHelper.validateReceiptRequest(receiptRequest);
		requireText(receiptRequest.getSuperadminId(), "superadminId");
		
		List<FeeType> FeeTypeList = feeHelper.getFeeTypeDetails(receiptRequest);
		
		return FeeTypeList;
	}

	public List<FeeStructure> getFeeStructure(Request<SchoolReceiptRequest> schoolReceiptRequest)
			throws BizException {
		validateRequestWrapper(schoolReceiptRequest);
		SchoolReceiptRequest receiptRequest = schoolReceiptRequest.getPayload();
		feeHelper.validateReceiptRequest(receiptRequest);
		requireText(receiptRequest.getSuperadminId(), "superadminId");

		return feeHelper.getFeeStructure(receiptRequest);
	}

	@Transactional(rollbackOn = Exception.class)
	public SchoolReceiptRequest addFeeStructure(Request<SchoolReceiptRequest> schoolReceiptRequest) throws BizException {
		validateRequestWrapper(schoolReceiptRequest);
		SchoolReceiptRequest receiptRequest = schoolReceiptRequest.getPayload();
		feeHelper.validateReceiptRequest(receiptRequest);
		requireText(receiptRequest.getAcademicYearId(), "academicYearId");
		if (receiptRequest.getGradeId() == null) {
			throw new BizException(Constant.BAD_REQUEST_CODE, "gradeId is required");
		}
		requireText(receiptRequest.getSuperadminId(), "superadminId");
		if (receiptRequest.getFeeStructures() == null || receiptRequest.getFeeStructures().isEmpty()) {
			throw new BizException(Constant.BAD_REQUEST_CODE, "At least one fee structure is required");
		}

		java.util.Set<Long> feeTypeIds = new java.util.HashSet<Long>();
		for (FeeStructureItemRequest item : receiptRequest.getFeeStructures()) {
			validateFeeStructureItem(item);
			if (!feeTypeIds.add(item.getFeeTypeId())) {
				throw new BizException(Constant.BAD_REQUEST_CODE, "Duplicate fee type is not allowed");
			}
			FeeStructure existing = feeHelper.getFeeStructureByAcademicYearIdFeeTypeIdGradeId(
					receiptRequest.getAcademicYearId(), item.getFeeTypeId(), receiptRequest.getGradeId(),
					receiptRequest.getSuperadminId());
			if (existing != null) {
				throw new BizException(Constant.ALREADY_EXISTS,
						"Fee structure already exists for feeTypeId " + item.getFeeTypeId());
			}
		}

		for (FeeStructureItemRequest item : receiptRequest.getFeeStructures()) {
			FeeStructure feeStructure = feeHelper.getFeeStructureByReqObj(receiptRequest);
			feeStructure.setFeeTypeId(item.getFeeTypeId());
			feeStructure.setAmount(item.getAmount());
			feeStructure.setFrequency(item.getFrequency());
			feeHelper.saveFeeStructure(feeStructure);
		}

		receiptRequest.setRespCode(Constant.SUCCESS_CODE);
		receiptRequest.setRespMesg(receiptRequest.getFeeStructures().size() + " fee structures added successfully");
		return receiptRequest;
	}
	
	@Transactional
	public SchoolReceiptRequest updateFeeStructure(Request<SchoolReceiptRequest> schoolReceiptRequest) throws BizException {
		validateRequestWrapper(schoolReceiptRequest);
		SchoolReceiptRequest receiptRequest = schoolReceiptRequest.getPayload();
		feeHelper.validateReceiptRequest(receiptRequest);
		validateFeeStructure(receiptRequest, true);

		FeeStructure feeStructure = feeHelper.getFeeStructureById(receiptRequest.getId(), receiptRequest.getSuperadminId());
		if (feeStructure != null) {
			FeeStructure duplicate = feeHelper.getFeeStructureByAcademicYearIdFeeTypeIdGradeId(
					receiptRequest.getAcademicYearId(), receiptRequest.getFeeTypeId(), receiptRequest.getGradeId(),
					receiptRequest.getSuperadminId());
			if (duplicate != null && !duplicate.getId().equals(feeStructure.getId())) {
				receiptRequest.setRespCode(Constant.ALREADY_EXISTS);
				receiptRequest.setRespMesg(Constant.ALLREADY_EXISTS_MSG);
				return receiptRequest;
			}
			feeStructure = feeHelper.getUpdatedFeeStructureByReqObj(receiptRequest, feeStructure);
			feeStructure = feeHelper.updateFeeStructure(feeStructure);

			receiptRequest.setRespCode(Constant.SUCCESS_CODE);
			receiptRequest.setRespMesg(Constant.UPDATED_SUCCESS);
			return receiptRequest;
		} else {
			receiptRequest.setRespCode(Constant.BAD_REQUEST_CODE);
			receiptRequest.setRespMesg(Constant.DATA_NOT_FOUND);
			return receiptRequest;
		}
	}

	@Transactional
	public SchoolReceiptRequest assignFeeToStudent(Request<SchoolReceiptRequest> schoolReceiptRequest) throws BizException {
		validateRequestWrapper(schoolReceiptRequest);
		SchoolReceiptRequest receiptRequest = schoolReceiptRequest.getPayload();
		feeHelper.validateReceiptRequest(receiptRequest);
		validateStudentFeeRequest(receiptRequest, false);

		StudentAcademic studentAcademic = studentAcademicHelper.getStudentAcademicById(
				receiptRequest.getStudentAcademicId(), receiptRequest.getSuperadminId());
		FeeStructure feeStructure = feeHelper.getFeeStructureById(
				receiptRequest.getFeeStructureId(), receiptRequest.getSuperadminId());
		if (studentAcademic == null || feeStructure == null) {
			throw new BizException(Constant.BAD_REQUEST_CODE,
					"Student academic record or fee structure does not exist for this tenant");
		}

		StudentFee existing = feeHelper.getStudentFeeByStudentAcademicFeeStructure(studentAcademic, feeStructure);
		if (existing != null) {
			receiptRequest.setRespCode(Constant.ALREADY_EXISTS);
			receiptRequest.setRespMesg(Constant.ALLREADY_EXISTS_MSG);
			return receiptRequest;
		}

		receiptRequest.setStudentAcademic(studentAcademic);
		receiptRequest.setFeeStructure(feeStructure);
        boolean cancelled = "CANCELLED".equalsIgnoreCase(receiptRequest.getStatus());
        prepareAssignmentAmounts(receiptRequest, feeStructure, BigDecimal.ZERO);
        if (cancelled) {
            receiptRequest.setStatus("CANCELLED");
            receiptRequest.setPayableAmount(BigDecimal.ZERO);
            receiptRequest.setBalanceAmount(BigDecimal.ZERO);
        }
        StudentFee savedFee = feeHelper.saveStudentFee(feeHelper.getStudentFeeByReqObj(receiptRequest));
        receiptRequest.setId(savedFee.getId());
		receiptRequest.setRespCode(Constant.SUCCESS_CODE);
		receiptRequest.setRespMesg(Constant.REGISTERED_SUCCESS);
		return receiptRequest;
	}

	@Transactional
	public SchoolReceiptRequest updateAssignedFeeToStudent(Request<SchoolReceiptRequest> schoolReceiptRequest)
			throws BizException {
		validateRequestWrapper(schoolReceiptRequest);
		SchoolReceiptRequest receiptRequest = schoolReceiptRequest.getPayload();
		feeHelper.validateReceiptRequest(receiptRequest);
		validateStudentFeeRequest(receiptRequest, true);

		StudentFee studentFee = feeHelper.getStudentFeeById(receiptRequest.getId(), receiptRequest.getSuperadminId());
		if (studentFee == null) {
			receiptRequest.setRespCode(Constant.BAD_REQUEST_CODE);
			receiptRequest.setRespMesg(Constant.DATA_NOT_FOUND);
			return receiptRequest;
		}

		if ("CANCELLED".equalsIgnoreCase(receiptRequest.getStatus())) {
            if (!receiptRequest.getStudentAcademicId().equals(studentFee.getStudentAcademic().getId())
                    || !receiptRequest.getFeeStructureId().equals(studentFee.getFeeStructure().getId())) {
                throw new BizException(Constant.BAD_REQUEST_CODE, "Assignment details do not match");
            }
            BigDecimal paid = studentFee.getPaidAmount() == null ? BigDecimal.ZERO : studentFee.getPaidAmount();
            if (paid.signum() > 0) {
                throw new BizException(Constant.BAD_REQUEST_CODE, "Fees with recorded payments cannot be removed");
            }
            studentFee.setStatus("CANCELLED");
            studentFee.setPayableAmount(BigDecimal.ZERO);
            studentFee.setBalanceAmount(BigDecimal.ZERO);
            feeHelper.updateStudentFee(studentFee);
            receiptRequest.setStatus("CANCELLED");
            receiptRequest.setPayableAmount(BigDecimal.ZERO);
            receiptRequest.setBalanceAmount(BigDecimal.ZERO);
            receiptRequest.setPaidAmount(paid);
            receiptRequest.setRespCode(Constant.SUCCESS_CODE);
            receiptRequest.setRespMesg("Fee assignment removed successfully");
            return receiptRequest;
        }

        StudentAcademic studentAcademic = studentAcademicHelper.getStudentAcademicById(
				receiptRequest.getStudentAcademicId(), receiptRequest.getSuperadminId());
		FeeStructure feeStructure = feeHelper.getFeeStructureById(
				receiptRequest.getFeeStructureId(), receiptRequest.getSuperadminId());
		if (studentAcademic == null || feeStructure == null) {
			throw new BizException(Constant.BAD_REQUEST_CODE,
					"Student academic record or fee structure does not exist for this tenant");
		}

		StudentFee duplicate = feeHelper.getStudentFeeByStudentAcademicFeeStructure(studentAcademic, feeStructure);
		if (duplicate != null && !duplicate.getId().equals(studentFee.getId())) {
			receiptRequest.setRespCode(Constant.ALREADY_EXISTS);
			receiptRequest.setRespMesg(Constant.ALLREADY_EXISTS_MSG);
			return receiptRequest;
		}

		BigDecimal paidAmount = studentFee.getPaidAmount() == null ? BigDecimal.ZERO : studentFee.getPaidAmount();
		prepareAssignmentAmounts(receiptRequest, feeStructure, paidAmount);
		studentFee.setStudentAcademic(studentAcademic);
		studentFee.setFeeStructure(feeStructure);
		studentFee.setAssignedAmount(receiptRequest.getAssignedAmount());
		studentFee.setDiscountAmount(receiptRequest.getDiscountAmount());
		studentFee.setFineAmount(receiptRequest.getFineAmount());
		studentFee.setPayableAmount(receiptRequest.getPayableAmount());
		studentFee.setBalanceAmount(receiptRequest.getBalanceAmount());
		studentFee.setStatus(resolvePaymentStatus(paidAmount, receiptRequest.getBalanceAmount()));
		feeHelper.updateStudentFee(studentFee);

		receiptRequest.setPaidAmount(paidAmount);
		receiptRequest.setStatus(studentFee.getStatus());
		receiptRequest.setRespCode(Constant.SUCCESS_CODE);
		receiptRequest.setRespMesg(Constant.UPDATED_SUCCESS);
		return receiptRequest;
	}

	public List<StudentFeeResponse> getAssignedFeeToStudentDetails(
			Request<SchoolReceiptRequest> schoolReceiptRequest) throws BizException {
		validateRequestWrapper(schoolReceiptRequest);
		SchoolReceiptRequest receiptRequest = schoolReceiptRequest.getPayload();
		feeHelper.validateReceiptRequest(receiptRequest);
		requireText(receiptRequest.getSuperadminId(), "superadminId");
		return feeHelper.getAssignedFeeToStudentDetails(receiptRequest);
	}

    @Transactional
    public List<com.school.object.response.StudentFeeReceiptResponse> getStudentFeesForReceipt(
            Request<SchoolReceiptRequest> request) throws BizException {
        List<StudentFeeResponse> fees = getAssignedFeeToStudentDetails(request);
        List<com.school.object.response.StudentFeeReceiptResponse> result = new java.util.ArrayList<>();
        for (StudentFeeResponse row : fees) {
            if ("CANCELLED".equalsIgnoreCase(row.getStatus())) continue;
            StudentFee fee = feeHelper.getStudentFeeById(row.getId(), request.getPayload().getSuperadminId());
            if (fee == null) continue;
            com.school.object.response.StudentFeeReceiptResponse item = new com.school.object.response.StudentFeeReceiptResponse();
            org.springframework.beans.BeanUtils.copyProperties(row, item);
            item.setFrequency(fee.getFeeStructure().getFrequency());
            item.setInstallmentPeriod(monthlyFeeHelper.label(fee, request.getPayload().getInstallmentName()));
            if (monthlyFeeHelper.isRecurring(fee)) {
                try {
                    com.school.helper.MonthlyFeeHelper.Balance balance = monthlyFeeHelper.balance(fee, request.getPayload().getInstallmentName());
                    item.setInstallmentName(balance.month);
                    item.setInstallmentPayableAmount(balance.payable);
                    item.setInstallmentPaidAmount(balance.paid);
                    item.setInstallmentBalanceAmount(balance.remaining);
                } catch (BizException error) {
                    item.setInstallmentError(error.getMessage());
                }
            }
            if (!monthlyFeeHelper.isRecurring(fee) && !monthlyFeeHelper.isOneTime(fee)) {
                item.setInstallmentPayableAmount(row.getPayableAmount());
                item.setInstallmentPaidAmount(row.getPaidAmount());
                item.setInstallmentBalanceAmount(row.getBalanceAmount());
            }
            if (monthlyFeeHelper.isOneTime(fee)) {
                com.school.helper.MonthlyFeeHelper.Balance lifetime = monthlyFeeHelper.lifetimeBalance(fee);
                item.setPayableAmount(lifetime.payable); item.setPaidAmount(lifetime.paid); item.setBalanceAmount(lifetime.remaining);
                item.setInstallmentPayableAmount(lifetime.payable); item.setInstallmentPaidAmount(lifetime.paid);
                item.setInstallmentBalanceAmount(lifetime.remaining);
            }
            if (monthlyFeeHelper.isRecurring(fee) && item.getInstallmentError() == null) {
                String selectedMonth = monthlyFeeHelper.canonicalMonth(request.getPayload().getInstallmentName());
                int selectedIndex = (java.time.Month.valueOf(selectedMonth.toUpperCase(java.util.Locale.ROOT)).getValue() + 8) % 12;
                int size = monthlyFeeHelper.periodMonths(fee);
                for (int index = 0; index < (selectedIndex / size) * size; index += size) {
                    String previousMonth = java.time.Month.of((index + 3) % 12 + 1)
                        .getDisplayName(java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH);
                    com.school.helper.MonthlyFeeHelper.Balance due = monthlyFeeHelper.balance(fee, previousMonth);
                    if (due.remaining.signum() <= 0) continue;
                    com.school.object.response.StudentFeeReceiptResponse previous = new com.school.object.response.StudentFeeReceiptResponse();
                    org.springframework.beans.BeanUtils.copyProperties(item, previous);
                    previous.setPreviousDue(true);
                    previous.setInstallmentName(previousMonth);
                    previous.setInstallmentPeriod(monthlyFeeHelper.label(fee, previousMonth));
                    previous.setInstallmentPayableAmount(due.payable);
                    previous.setInstallmentPaidAmount(due.paid);
                    previous.setInstallmentBalanceAmount(due.remaining);
                    result.add(previous);
                }
            }
            result.add(item);
        }
        result.addAll(receiptHelper.getOptionalChargeSummary(request.getPayload()));
        return result;
    }

	private void validateRequestWrapper(Request<SchoolReceiptRequest> request) throws BizException {
		if (request == null) {
			throw new BizException(Constant.BAD_REQUEST_CODE, "Request must not be null");
		}
	}

	private void validateFeeType(SchoolReceiptRequest request, boolean update) throws BizException {
		if (update && request.getId() == null) {
			throw new BizException(Constant.BAD_REQUEST_CODE, "id is required");
		}
		requireText(request.getFeeTypeName(), "feeTypeName");
		requireText(request.getSuperadminId(), "superadminId");
	}

	private void validateFeeStructure(SchoolReceiptRequest request, boolean update) throws BizException {
		if (update && request.getId() == null) {
			throw new BizException(Constant.BAD_REQUEST_CODE, "id is required");
		}
		if (request.getAcademicYearId() == null || request.getGradeId() == null || request.getFeeTypeId() == null) {
			throw new BizException(Constant.BAD_REQUEST_CODE, "academicYearId, gradeId and feeTypeId are required");
		}
		if (request.getAmount() == null || request.getAmount() < 0) {
			throw new BizException(Constant.BAD_REQUEST_CODE, "amount must be zero or greater");
		}
		requireText(request.getSuperadminId(), "superadminId");
	}

	private void validateFeeStructureItem(FeeStructureItemRequest item) throws BizException {
		if (item == null || item.getFeeTypeId() == null) {
			throw new BizException(Constant.BAD_REQUEST_CODE, "feeTypeId is required for every fee row");
		}
		if (item.getAmount() == null || item.getAmount() < 0) {
			throw new BizException(Constant.BAD_REQUEST_CODE, "amount must be zero or greater for every fee row");
		}
	}

	private void validateStudentFeeRequest(SchoolReceiptRequest request, boolean update) throws BizException {
		if (update && request.getId() == null) {
			throw new BizException(Constant.BAD_REQUEST_CODE, "id is required");
		}
		if (request.getStudentAcademicId() == null || request.getFeeStructureId() == null) {
			throw new BizException(Constant.BAD_REQUEST_CODE,
					"studentAcademicId and feeStructureId are required");
		}
		requireText(request.getSuperadminId(), "superadminId");
		validateNonNegative(request.getAssignedAmount(), "assignedAmount");
		validateNonNegative(request.getDiscountAmount(), "discountAmount");
		validateNonNegative(request.getFineAmount(), "fineAmount");
	}

	private void prepareAssignmentAmounts(SchoolReceiptRequest request, FeeStructure feeStructure,
			BigDecimal paidAmount) throws BizException {
		BigDecimal assigned = request.getAssignedAmount() != null
				? request.getAssignedAmount()
				: BigDecimal.valueOf(feeStructure.getAmount());
		BigDecimal discount = request.getDiscountAmount() == null ? BigDecimal.ZERO : request.getDiscountAmount();
		BigDecimal fine = request.getFineAmount() == null ? BigDecimal.ZERO : request.getFineAmount();
		BigDecimal payable = assigned.subtract(discount).add(fine);
		if (payable.signum() < 0) {
			throw new BizException(Constant.BAD_REQUEST_CODE,
					"discountAmount cannot make payableAmount negative");
		}
		BigDecimal balance = payable.subtract(paidAmount);
		if (balance.signum() < 0) {
			throw new BizException(Constant.BAD_REQUEST_CODE,
					"payableAmount cannot be less than the amount already paid");
		}
		request.setAssignedAmount(assigned);
		request.setDiscountAmount(discount);
		request.setFineAmount(fine);
		request.setPayableAmount(payable);
		request.setPaidAmount(paidAmount);
		request.setBalanceAmount(balance);
		request.setStatus(resolvePaymentStatus(paidAmount, balance));
	}

	private String resolvePaymentStatus(BigDecimal paidAmount, BigDecimal balanceAmount) {
		if (balanceAmount.signum() == 0) {
			return "PAID";
		}
		return paidAmount.signum() > 0 ? "PARTIAL" : "PENDING";
	}

	private void validateNonNegative(BigDecimal value, String field) throws BizException {
		if (value != null && value.signum() < 0) {
			throw new BizException(Constant.BAD_REQUEST_CODE, field + " must be zero or greater");
		}
	}

	private void requireText(String value, String field) throws BizException {
		if (value == null || value.trim().isEmpty()) {
			throw new BizException(Constant.BAD_REQUEST_CODE, field + " is required");
		}
	}


	

}
