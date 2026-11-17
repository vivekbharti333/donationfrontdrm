package com.school.helper;

import java.util.Date;
import java.util.List;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.common.constant.Constant;
import com.common.enums.Status;
import com.common.exceptions.BizException;
import com.school.dao.FeeStructureDao;
import com.school.dao.FeeTypeDao;
import com.school.dao.StudentFeeDao;
import com.school.entities.FeeStructure;
import com.school.entities.FeeType;
import com.school.entities.StudentAcademic;
import com.school.entities.StudentFee;
import com.school.object.request.SchoolReceiptRequest;
import com.school.object.response.StudentFeeResponse;

@Component
public class FeeHelper {

    public List<Object[]> getMonthlyFeeReportAssignments(SchoolReceiptRequest request) {
        return getDueFeeReportAssignments(request);
    }

    public List<Object[]> getMonthlyFeeReportPayments(SchoolReceiptRequest request) {
        return getDueFeeReportPayments(request);
    }


    /** Fetch report assignments and display fields together; never load another school's rows. */
    public List<Object[]> getDueFeeReportAssignments(SchoolReceiptRequest request) {
        boolean previous = Boolean.TRUE.equals(request.getIncludePreviousSessions());
        boolean currentClass = previous && (hasText(request.getGrade()) || hasText(request.getGradeSection()) || request.getStudentAcademicId() != null);
        StringBuilder jpql = new StringBuilder(
            "SELECT sf, sd.admissionNo, sd.firstName, sd.lastName, ft.feeTypeName, sd.fatherName "
            + "FROM StudentFee sf JOIN FETCH sf.studentAcademic sa JOIN FETCH sf.feeStructure fs, StudentDetails sd, FeeType ft "
            + "WHERE sd.id = sa.studentId AND ft.id = fs.feeTypeId "
            + "AND sf.superadminId = :tenant AND sa.superadminId = :tenant AND fs.superadminId = :tenant "
            + "AND sd.superadminId = :tenant AND ft.superadminId = :tenant "
            + "AND (sd.status IS NULL OR sd.status <> 'REMOVED') "
            + "AND (sf.status IS NULL OR UPPER(TRIM(sf.status)) <> 'CANCELLED') ");
        jpql.append(previous ? "AND SUBSTRING(sa.sessionName, 1, 4) <= :throughYear " : "AND sa.sessionName = :session ");
        if (request.getStudentId() != null) jpql.append("AND sa.studentId = :student ");
        // Class/section refer to the selected year's class, including dues before promotion.
        if (currentClass) jpql.append("AND EXISTS (SELECT current.id FROM StudentAcademic current WHERE current.studentId = sa.studentId "
            + "AND current.superadminId = :tenant AND current.sessionName = :session ");
        String academicAlias = currentClass ? "current" : "sa";
        if (request.getStudentAcademicId() != null) jpql.append("AND " + academicAlias + ".id = :academic ");
        if (hasText(request.getGrade())) jpql.append("AND " + academicAlias + ".grade = :grade ");
        if (hasText(request.getGradeSection())) jpql.append("AND " + academicAlias + ".gradeSection = :section ");
        if (currentClass) jpql.append(") ");
        if (request.getFeeTypeIds() != null && !request.getFeeTypeIds().isEmpty()) jpql.append("AND ft.id IN :types ");
        jpql.append("ORDER BY sd.firstName, sd.lastName, sa.sessionName DESC, sa.id, ft.feeTypeName, sf.id");
        javax.persistence.TypedQuery<Object[]> query = studentFeeDao.getEntityManager().createQuery(jpql.toString(), Object[].class)
            .setParameter("tenant", request.getSuperadminId());
        if (previous) query.setParameter("throughYear", request.getSessionName().substring(0, 4));
        if (!previous || currentClass) query.setParameter("session", request.getSessionName());
        if (request.getStudentId() != null) query.setParameter("student", request.getStudentId());
        if (request.getStudentAcademicId() != null) query.setParameter("academic", request.getStudentAcademicId());
        if (hasText(request.getGrade())) query.setParameter("grade", request.getGrade().trim());
        if (hasText(request.getGradeSection())) query.setParameter("section", request.getGradeSection().trim());
        if (request.getFeeTypeIds() != null && !request.getFeeTypeIds().isEmpty()) query.setParameter("types", request.getFeeTypeIds());
        return query.getResultList();
    }

    public List<Object[]> getDueFeeReportPayments(SchoolReceiptRequest request) {
        boolean previous = Boolean.TRUE.equals(request.getIncludePreviousSessions());
        javax.persistence.TypedQuery<Object[]> query = studentFeeDao.getEntityManager().createQuery(
            "SELECT sf.id, COALESCE(d.installmentName, r.installmentName), SUM(d.amount) FROM FeeReceiptDetails d JOIN d.feeReceipt r "
            + "JOIN d.studentFee sf JOIN sf.studentAcademic sa JOIN sf.feeStructure fs "
            + "WHERE d.superadminId = :tenant AND r.superadminId = :tenant AND sf.superadminId = :tenant "
            + "AND sa.superadminId = :tenant AND fs.superadminId = :tenant AND r.studentAcademic.id = sa.id "
            + (previous ? "AND SUBSTRING(sa.sessionName, 1, 4) <= :throughYear " : "AND sa.sessionName = :session ")
            + "AND (r.status IS NULL OR UPPER(TRIM(r.status)) <> 'CANCELLED') "
            + "GROUP BY sf.id, COALESCE(d.installmentName, r.installmentName)", Object[].class)
            .setParameter("tenant", request.getSuperadminId());
        if (previous) query.setParameter("throughYear", request.getSessionName().substring(0, 4));
        else query.setParameter("session", request.getSessionName());
        return query.getResultList();
    }

    public List<StudentFee> getDueFeeReportLifetimeAssignments(SchoolReceiptRequest request) {
        return studentFeeDao.getEntityManager().createQuery(
            "SELECT sf FROM StudentFee sf JOIN FETCH sf.studentAcademic sa JOIN FETCH sf.feeStructure fs "
            + "WHERE sf.superadminId = :tenant AND sa.superadminId = :tenant AND fs.superadminId = :tenant "
            + "AND UPPER(TRIM(fs.frequency)) = 'ONE_TIME' "
            + "AND (sf.status IS NULL OR UPPER(TRIM(sf.status)) <> 'CANCELLED') ORDER BY sa.sessionName, sf.id", StudentFee.class)
            .setParameter("tenant", request.getSuperadminId()).getResultList();
    }

    private boolean hasText(String text) { return text != null && !text.trim().isEmpty(); }

	@Autowired
	private FeeTypeDao feeTypeDao;
	
	@Autowired
	private FeeStructureDao feeStructureDao;
	
	@Autowired
	private StudentFeeDao studentFeeDao;

	public void validateReceiptRequest(SchoolReceiptRequest schoolReceiptRequest) throws BizException {
		if (schoolReceiptRequest == null) {
			throw new BizException(Constant.BAD_REQUEST_CODE, "Bad Request Object Null");
		}
	}

	@Transactional
	public FeeType getFeeTypeByName(String feeTypeName, String superadminId) {

		CriteriaBuilder criteriaBuilder = feeTypeDao.getSession().getCriteriaBuilder();
		CriteriaQuery<FeeType> criteriaQuery = criteriaBuilder.createQuery(FeeType.class);
		Root<FeeType> root = criteriaQuery.from(FeeType.class);
		Predicate restriction = criteriaBuilder.equal(root.get("feeTypeName"), feeTypeName);
		Predicate tenantRestriction = criteriaBuilder.equal(root.get("superadminId"), superadminId);
		criteriaQuery.where(restriction, tenantRestriction);
		FeeType feeType = feeTypeDao.getSession().createQuery(criteriaQuery).uniqueResult();
		return feeType;
	}

	@Transactional
	public FeeType getFeeTypeById(Long id, String superadminId) {

		CriteriaBuilder criteriaBuilder = feeTypeDao.getSession().getCriteriaBuilder();
		CriteriaQuery<FeeType> criteriaQuery = criteriaBuilder.createQuery(FeeType.class);
		Root<FeeType> root = criteriaQuery.from(FeeType.class);
		Predicate restriction = criteriaBuilder.equal(root.get("id"), id);
		Predicate tenantRestriction = criteriaBuilder.equal(root.get("superadminId"), superadminId);
		criteriaQuery.where(restriction, tenantRestriction);
		FeeType feeType = feeTypeDao.getSession().createQuery(criteriaQuery).uniqueResult();
		return feeType;
	}

	public FeeType getFeeTypeByReqObj(SchoolReceiptRequest receiptRequest) {

		FeeType feeType = new FeeType();

		feeType.setFeeTypeName(receiptRequest.getFeeTypeName());
		feeType.setFeeTypeDescription(receiptRequest.getFeeTypeDescription());
		feeType.setStatus(Status.ACTIVE.name());

		feeType.setCreatedAt(new Date());
		feeType.setCreatedBy(receiptRequest.getCreatedBy());
		feeType.setSuperadminId(receiptRequest.getSuperadminId());
		return feeType;
	}

	@Transactional
	public FeeType saveFeeType(FeeType feeType) {
		feeTypeDao.persist(feeType);
		return feeType;
	}

	public FeeType getUpdateFeeTypeByReqObj(SchoolReceiptRequest receiptRequest, FeeType feeType) {

		feeType.setFeeTypeName(receiptRequest.getFeeTypeName());
		feeType.setFeeTypeDescription(receiptRequest.getFeeTypeDescription());

		return feeType;
	}

	@Transactional
	public FeeType updateFeeType(FeeType feeType) {
		feeTypeDao.update(feeType);
		return feeType;
	}

	public List<FeeType> getFeeTypeDetails(SchoolReceiptRequest receiptRequest) {
		return feeTypeDao.getEntityManager()
				.createQuery(
						"SELECT FT FROM FeeType FT WHERE FT.superadminId = :superadminId ORDER BY FT.createdAt DESC",
						FeeType.class)
				.setParameter("superadminId", receiptRequest.getSuperadminId()).getResultList();
	}

	public List<FeeStructure> getFeeStructure(SchoolReceiptRequest receiptRequest) {
		StringBuilder jpql = new StringBuilder(
				"SELECT FS FROM FeeStructure FS WHERE FS.superadminId = :superadminId");
		if (receiptRequest.getAcademicYearId() != null && !receiptRequest.getAcademicYearId().trim().isEmpty()) {
			jpql.append(" AND FS.academicYearId = :academicYearId");
		}
		if (receiptRequest.getGradeId() != null) {
			jpql.append(" AND FS.gradeId = :gradeId");
		}
		if (receiptRequest.getFeeTypeName() != null && !receiptRequest.getFeeTypeName().trim().isEmpty()) {
			jpql.append(" AND EXISTS (SELECT FT.id FROM FeeType FT WHERE FT.id = FS.feeTypeId ")
				.append("AND FT.superadminId = FS.superadminId AND LOWER(FT.feeTypeName) LIKE :feeTypeName)");
		}
		jpql.append(" ORDER BY FS.createdAt DESC");

		javax.persistence.TypedQuery<FeeStructure> query = feeStructureDao.getEntityManager()
				.createQuery(jpql.toString(), FeeStructure.class)
				.setParameter("superadminId", receiptRequest.getSuperadminId());
		if (receiptRequest.getAcademicYearId() != null && !receiptRequest.getAcademicYearId().trim().isEmpty()) {
			query.setParameter("academicYearId", receiptRequest.getAcademicYearId().trim());
		}
		if (receiptRequest.getGradeId() != null) {
			query.setParameter("gradeId", receiptRequest.getGradeId());
		}
		if (receiptRequest.getFeeTypeName() != null && !receiptRequest.getFeeTypeName().trim().isEmpty()) {
			query.setParameter("feeTypeName", "%" + receiptRequest.getFeeTypeName().trim().toLowerCase() + "%");
		}
		return query.getResultList();
	}

	public List<FeeStructure> getActiveFeeStructuresByAcademicYearAndGrade(
			String academicYearId, Long gradeId, String superadminId) {
		return feeStructureDao.getEntityManager().createQuery(
				"SELECT FS FROM FeeStructure FS WHERE FS.superadminId = :superadminId "
				+ "AND FS.academicYearId = :academicYearId AND FS.gradeId = :gradeId "
				+ "AND FS.status = :status ORDER BY FS.id",
				FeeStructure.class)
				.setParameter("superadminId", superadminId)
				.setParameter("academicYearId", academicYearId)
				.setParameter("gradeId", gradeId)
				.setParameter("status", "ACTIVE")
				.getResultList();
	}
	
	@Transactional
	public FeeStructure getFeeStructureByAcademicYearIdFeeTypeIdGradeId(String academicYearId, Long feeTypeId, Long gradeId,
			String superadminId) {

		CriteriaBuilder criteriaBuilder = feeStructureDao.getSession().getCriteriaBuilder();
		CriteriaQuery<FeeStructure> criteriaQuery = criteriaBuilder.createQuery(FeeStructure.class);
		Root<FeeStructure> root = criteriaQuery.from(FeeStructure.class);
		Predicate restriction1 = criteriaBuilder.equal(root.get("academicYearId"), academicYearId);
		Predicate restriction2 = criteriaBuilder.equal(root.get("feeTypeId"), feeTypeId);
		Predicate restriction3 = criteriaBuilder.equal(root.get("gradeId"), gradeId);
		Predicate tenantRestriction = criteriaBuilder.equal(root.get("superadminId"), superadminId);
		criteriaQuery.where(restriction1, restriction2, restriction3, tenantRestriction);
		FeeStructure feeStructure = feeStructureDao.getSession().createQuery(criteriaQuery).uniqueResult();
		return feeStructure;
	}
	
	@Transactional
	public FeeStructure getFeeStructureById(Long id, String superadminId) {

		CriteriaBuilder criteriaBuilder = feeStructureDao.getSession().getCriteriaBuilder();
		CriteriaQuery<FeeStructure> criteriaQuery = criteriaBuilder.createQuery(FeeStructure.class);
		Root<FeeStructure> root = criteriaQuery.from(FeeStructure.class);
		Predicate restriction = criteriaBuilder.equal(root.get("id"), id);
		Predicate tenantRestriction = criteriaBuilder.equal(root.get("superadminId"), superadminId);
		criteriaQuery.where(restriction, tenantRestriction);
		FeeStructure feeStructure = feeStructureDao.getSession().createQuery(criteriaQuery).uniqueResult();
		return feeStructure;
	}
	
	public FeeStructure getFeeStructureByReqObj(SchoolReceiptRequest receiptRequest) {

		FeeStructure feeStructure = new FeeStructure();

		feeStructure.setAcademicYearId(receiptRequest.getAcademicYearId());
		feeStructure.setGradeId(receiptRequest.getGradeId());
		feeStructure.setFeeTypeId(receiptRequest.getFeeTypeId());
		feeStructure.setAmount(receiptRequest.getAmount());
		feeStructure.setFrequency(receiptRequest.getFrequency());
		feeStructure.setStatus(Status.ACTIVE.name());

		feeStructure.setCreatedAt(new Date());
		feeStructure.setCreatedBy(receiptRequest.getCreatedBy());
		feeStructure.setSuperadminId(receiptRequest.getSuperadminId());
		return feeStructure;
	}

	@Transactional
	public FeeStructure saveFeeStructure(FeeStructure feeStructure) {
		feeStructureDao.persist(feeStructure);
		return feeStructure;
	}
	
	public FeeStructure getUpdatedFeeStructureByReqObj(SchoolReceiptRequest receiptRequest,
			FeeStructure feeStructure) {
		feeStructure.setAcademicYearId(receiptRequest.getAcademicYearId());
		feeStructure.setGradeId(receiptRequest.getGradeId());
		feeStructure.setFeeTypeId(receiptRequest.getFeeTypeId());
		feeStructure.setAmount(receiptRequest.getAmount());
		feeStructure.setFrequency(receiptRequest.getFrequency());

		return feeStructure;
	}

	@Transactional
	public FeeStructure updateFeeStructure(FeeStructure feeStructure) {
		feeStructureDao.update(feeStructure);
		return feeStructure;
	}
	
	@Transactional
	public StudentFee getStudentFeeByStudentAcademicFeeStructure(StudentAcademic studentAcademic,FeeStructure feeStructure) {

		CriteriaBuilder criteriaBuilder = studentFeeDao.getSession().getCriteriaBuilder();
		CriteriaQuery<StudentFee> criteriaQuery = criteriaBuilder.createQuery(StudentFee.class);
		Root<StudentFee> root = criteriaQuery.from(StudentFee.class);
		Predicate restriction1 = criteriaBuilder.equal(root.get("studentAcademic"), studentAcademic);
		Predicate restriction2 = criteriaBuilder.equal(root.get("feeStructure"), feeStructure);
		Predicate tenantRestriction = criteriaBuilder.equal(root.get("superadminId"), studentAcademic.getSuperadminId());
		criteriaQuery.where(restriction1, restriction2, tenantRestriction);
		StudentFee studentFee = studentFeeDao.getSession().createQuery(criteriaQuery).uniqueResult();
		return studentFee;
	}

	@Transactional
	public StudentFee getStudentFeeById(Long id, String superadminId) {
		CriteriaBuilder criteriaBuilder = studentFeeDao.getSession().getCriteriaBuilder();
		CriteriaQuery<StudentFee> criteriaQuery = criteriaBuilder.createQuery(StudentFee.class);
		Root<StudentFee> root = criteriaQuery.from(StudentFee.class);
		Predicate idRestriction = criteriaBuilder.equal(root.get("id"), id);
		Predicate tenantRestriction = criteriaBuilder.equal(root.get("superadminId"), superadminId);
		criteriaQuery.where(idRestriction, tenantRestriction);
		return studentFeeDao.getSession().createQuery(criteriaQuery).uniqueResult();
	}
	
	public StudentFee getStudentFeeByReqObj(SchoolReceiptRequest receiptRequest) {

		StudentFee studentFee = new StudentFee();

		studentFee.setStudentAcademic(receiptRequest.getStudentAcademic());
		studentFee.setFeeStructure(receiptRequest.getFeeStructure());
		studentFee.setAssignedAmount(receiptRequest.getAssignedAmount());
		studentFee.setDiscountAmount(receiptRequest.getDiscountAmount());
		studentFee.setFineAmount(receiptRequest.getFineAmount());
		studentFee.setPayableAmount(receiptRequest.getPayableAmount());
		studentFee.setPaidAmount(receiptRequest.getPaidAmount());
		studentFee.setBalanceAmount(receiptRequest.getBalanceAmount());
		studentFee.setStatus(receiptRequest.getStatus());

		studentFee.setCreatedAt(new Date());
		studentFee.setCreatedBy(receiptRequest.getCreatedBy());
		studentFee.setSuperadminId(receiptRequest.getSuperadminId());
		return studentFee;
	}

	@Transactional
	public StudentFee saveStudentFee(StudentFee studentFee) {
		studentFeeDao.persist(studentFee);
		return studentFee;
	}

	@Transactional
	public StudentFee updateStudentFee(StudentFee studentFee) {
		return studentFeeDao.update(studentFee);
	}

    public StudentFee getStudentFeeByIdForUpdate(Long id, String tenant) {
        List<StudentFee> rows = studentFeeDao.getEntityManager().createQuery(
            "SELECT sf FROM StudentFee sf WHERE sf.id = :id AND sf.superadminId = :tenant", StudentFee.class)
            .setParameter("id", id).setParameter("tenant", tenant)
            .setLockMode(javax.persistence.LockModeType.PESSIMISTIC_WRITE).getResultList();
        return rows.isEmpty() ? null : rows.get(0);
    }

	public List<StudentFeeResponse> getAssignedFeeToStudentDetails(SchoolReceiptRequest request) {
		StringBuilder jpql = new StringBuilder();
		jpql.append("SELECT new com.school.object.response.StudentFeeResponse(");
		jpql.append("sf.id, sa.id, fs.id, sa.studentId, sd.admissionNo, ");
		jpql.append("concat(concat(sd.firstName, ' '), coalesce(sd.lastName, '')), ");
		jpql.append("sa.sessionName, sa.grade, sa.gradeSection, ft.feeTypeName, ");
		jpql.append("sf.assignedAmount, sf.discountAmount, sf.fineAmount, sf.payableAmount, ");
		jpql.append("sf.paidAmount, sf.balanceAmount, sf.status, sf.createdAt, sf.createdBy, sf.superadminId) ");
		jpql.append("FROM StudentFee sf JOIN sf.studentAcademic sa JOIN sf.feeStructure fs, ");
		jpql.append("StudentDetails sd, FeeType ft ");
		jpql.append("WHERE sd.id = sa.studentId AND ft.id = fs.feeTypeId ");
		jpql.append("AND sf.superadminId = :superadminId ");
		jpql.append("AND sa.superadminId = :superadminId AND fs.superadminId = :superadminId ");
		jpql.append("AND sd.superadminId = :superadminId AND ft.superadminId = :superadminId ");
		jpql.append("AND (sd.status IS NULL OR sd.status <> 'REMOVED') ");
		if (request.getStudentAcademicId() != null) {
			jpql.append("AND sa.id = :studentAcademicId ");
		}
		if (request.getStudentId() != null) {
			jpql.append("AND sa.studentId = :studentId ");
		}
		if (request.getSessionName() != null && !request.getSessionName().trim().isEmpty()) {
			jpql.append("AND sa.sessionName = :sessionName ");
		}
		if (request.getFeeStructureId() != null) {
			jpql.append("AND fs.id = :feeStructureId ");
		}
		jpql.append("ORDER BY sf.createdAt DESC");

		javax.persistence.TypedQuery<StudentFeeResponse> query = studentFeeDao.getEntityManager()
				.createQuery(jpql.toString(), StudentFeeResponse.class)
				.setParameter("superadminId", request.getSuperadminId());
		if (request.getStudentAcademicId() != null) {
			query.setParameter("studentAcademicId", request.getStudentAcademicId());
		}
		if (request.getStudentId() != null) {
			query.setParameter("studentId", request.getStudentId());
		}
		if (request.getSessionName() != null && !request.getSessionName().trim().isEmpty()) {
			query.setParameter("sessionName", request.getSessionName().trim());
		}
		if (request.getFeeStructureId() != null) {
			query.setParameter("feeStructureId", request.getFeeStructureId());
		}
		return query.getResultList();
	}


}
