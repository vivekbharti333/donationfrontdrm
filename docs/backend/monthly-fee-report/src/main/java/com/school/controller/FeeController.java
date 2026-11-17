package com.school.controller;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.common.constant.Constant;
import com.common.exceptions.BizException;
import com.common.object.request.Request;
import com.common.object.response.GenricResponse;
import com.common.object.response.Response;
import com.school.entities.FeeStructure;
import com.school.entities.FeeType;
import com.school.object.request.SchoolReceiptRequest;
import com.school.object.response.StudentFeeResponse;
import com.school.object.response.StudentDueFeeReportResponse;
import com.school.object.response.MonthlyFeeReportResponse;
import com.school.services.FeeService;


@CrossOrigin(origins = "*")
@RestController
public class FeeController {
    @RequestMapping(path = "getMonthlyFeeReport", method = RequestMethod.POST)
    public Response<MonthlyFeeReportResponse> getMonthlyFeeReport(@RequestBody Request<SchoolReceiptRequest> request) {
        GenricResponse<MonthlyFeeReportResponse> response = new GenricResponse<>();
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || !(authentication.getDetails() instanceof String)
                || authentication.getDetails().toString().trim().isEmpty())
                throw new BizException(Constant.BAD_REQUEST_CODE, "Authenticated school is missing");
            if (request == null || request.getPayload() == null)
                throw new BizException(Constant.BAD_REQUEST_CODE, "Request payload must not be null");
            request.getPayload().setSuperadminId(authentication.getDetails().toString().trim());
            List<MonthlyFeeReportResponse> report = feeService.getMonthlyFeeReport(request);
            return response.createListResponse(report, Constant.SUCCESS_CODE, String.valueOf(report.size()));
        } catch (BizException error) {
            return response.createErrorResponse(Constant.BAD_REQUEST_CODE, error.getMessage());
        } catch (Exception error) {
            error.printStackTrace();
            return response.createErrorResponse(Constant.INTERNAL_SERVER_ERR, "Unable to load monthly fee report");
        }
    }

    @RequestMapping(path = "getStudentDueFeeReport", method = RequestMethod.POST)
    public Response<StudentDueFeeReportResponse> getStudentDueFeeReport(@RequestBody Request<SchoolReceiptRequest> request) {
        GenricResponse<StudentDueFeeReportResponse> response = new GenricResponse<>();
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || !(authentication.getDetails() instanceof String)
                || authentication.getDetails().toString().trim().isEmpty())
                throw new BizException(Constant.BAD_REQUEST_CODE, "Authenticated school is missing");
            if (request == null || request.getPayload() == null)
                throw new BizException(Constant.BAD_REQUEST_CODE, "Request payload must not be null");
            request.getPayload().setSuperadminId(authentication.getDetails().toString().trim());
            List<StudentDueFeeReportResponse> report = feeService.getStudentDueFeeReport(request);
            return response.createListResponse(report, Constant.SUCCESS_CODE, String.valueOf(report.size()));
        } catch (BizException error) {
            return response.createErrorResponse(Constant.BAD_REQUEST_CODE, error.getMessage());
        } catch (Exception error) {
            error.printStackTrace();
            return response.createErrorResponse(Constant.INTERNAL_SERVER_ERR, "Unable to load due fee report");
        }
    }
	
	@Autowired
	private	FeeService feeService;
	
	


	@RequestMapping(path = "addFeeType", method = RequestMethod.POST)
	public Response<SchoolReceiptRequest> addFeeType(@RequestBody Request<SchoolReceiptRequest> SchoolReceiptRequest,
			HttpServletRequest request) {
		GenricResponse<SchoolReceiptRequest> responseObj = new GenricResponse<SchoolReceiptRequest>();
		try {
//			bindAuthenticatedTenant(SchoolReceiptRequest);
			SchoolReceiptRequest response = feeService.addFeeType(SchoolReceiptRequest);
			return responseObj.createSuccessResponse(response, Constant.SUCCESS_CODE);
		} catch (BizException e) {
			return responseObj.createErrorResponse(Constant.BAD_REQUEST_CODE, e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			return responseObj.createErrorResponse(Constant.INTERNAL_SERVER_ERR, e.getMessage());
		}
	}
	
	@RequestMapping(path = "updateFeeType", method = RequestMethod.POST)
	public Response<SchoolReceiptRequest> updateFeeType(@RequestBody Request<SchoolReceiptRequest> SchoolReceiptRequest,
			HttpServletRequest request) {
		GenricResponse<SchoolReceiptRequest> responseObj = new GenricResponse<SchoolReceiptRequest>();
		try {
//			bindAuthenticatedTenant(SchoolReceiptRequest);
			SchoolReceiptRequest response = feeService.updateFeeType(SchoolReceiptRequest);
			return responseObj.createSuccessResponse(response, Constant.SUCCESS_CODE);
		} catch (BizException e) {
			return responseObj.createErrorResponse(Constant.BAD_REQUEST_CODE, e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			return responseObj.createErrorResponse(Constant.INTERNAL_SERVER_ERR, e.getMessage());
		}
	}
	
	
	@RequestMapping(path = "getFeeTypeDetails", method = RequestMethod.POST)
	public Response<FeeType> getFeeTypeDetails(@RequestBody Request<SchoolReceiptRequest> SchoolReceiptRequest) {
		GenricResponse<FeeType> response = new GenricResponse<FeeType>();
		try {
//			bindAuthenticatedTenant(SchoolReceiptRequest);
			List<FeeType> FeeTypeList = feeService.getFeeTypeDetails(SchoolReceiptRequest);
			return response.createListResponse(FeeTypeList, 200, String.valueOf(FeeTypeList.size()));
		} catch (Exception e) {
			e.printStackTrace();
			return response.createErrorResponse(Constant.BAD_REQUEST_CODE, e.getMessage());
		}
	}
	
	
	@RequestMapping(path = "addFeeStructure", method = RequestMethod.POST)
	public Response<SchoolReceiptRequest> addFeeStructure(@RequestBody Request<SchoolReceiptRequest> SchoolReceiptRequest,
			HttpServletRequest request) {
		GenricResponse<SchoolReceiptRequest> responseObj = new GenricResponse<SchoolReceiptRequest>();
		try {
//			bindAuthenticatedTenant(SchoolReceiptRequest);
			SchoolReceiptRequest response = feeService.addFeeStructure(SchoolReceiptRequest);
			return responseObj.createSuccessResponse(response, Constant.SUCCESS_CODE);
		} catch (BizException e) {
			return responseObj.createErrorResponse(Constant.BAD_REQUEST_CODE, e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			return responseObj.createErrorResponse(Constant.INTERNAL_SERVER_ERR, e.getMessage());
		}
	}
	
	@RequestMapping(path = "updateFeeStructure", method = RequestMethod.POST)
	public Response<SchoolReceiptRequest> updateFeeStructure(@RequestBody Request<SchoolReceiptRequest> SchoolReceiptRequest,
			HttpServletRequest request) {
		GenricResponse<SchoolReceiptRequest> responseObj = new GenricResponse<SchoolReceiptRequest>();
		try {
//			bindAuthenticatedTenant(SchoolReceiptRequest);
			SchoolReceiptRequest response = feeService.updateFeeStructure(SchoolReceiptRequest);
			return responseObj.createSuccessResponse(response, Constant.SUCCESS_CODE);
		} catch (BizException e) {
			return responseObj.createErrorResponse(Constant.BAD_REQUEST_CODE, e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			return responseObj.createErrorResponse(Constant.INTERNAL_SERVER_ERR, e.getMessage());
		}
	}

	@RequestMapping(path = "getFeeStructure", method = RequestMethod.POST)
	public Response<FeeStructure> getFeeStructure(
			@RequestBody Request<SchoolReceiptRequest> schoolReceiptRequest) {
		GenricResponse<FeeStructure> response = new GenricResponse<FeeStructure>();
		try {
			List<FeeStructure> feeStructureList = feeService.getFeeStructure(schoolReceiptRequest);
			return response.createListResponse(feeStructureList, Constant.SUCCESS_CODE,
					String.valueOf(feeStructureList.size()));
		} catch (BizException e) {
			return response.createErrorResponse(Constant.BAD_REQUEST_CODE, e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			return response.createErrorResponse(Constant.INTERNAL_SERVER_ERR, e.getMessage());
		}
	}

	@RequestMapping(path = "assignFeeToStudent", method = RequestMethod.POST)
	public Response<SchoolReceiptRequest> assignFeeToStudent(
			@RequestBody Request<SchoolReceiptRequest> schoolReceiptRequest) {
		GenricResponse<SchoolReceiptRequest> response = new GenricResponse<SchoolReceiptRequest>();
		try {
			return response.createSuccessResponse(feeService.assignFeeToStudent(schoolReceiptRequest),
					Constant.SUCCESS_CODE);
		} catch (BizException e) {
			return response.createErrorResponse(Constant.BAD_REQUEST_CODE, e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			return response.createErrorResponse(Constant.INTERNAL_SERVER_ERR, e.getMessage());
		}
	}

	@RequestMapping(path = "updateAssignedFeeToStudent", method = RequestMethod.POST)
	public Response<SchoolReceiptRequest> updateAssignedFeeToStudent(
			@RequestBody Request<SchoolReceiptRequest> schoolReceiptRequest) {
		GenricResponse<SchoolReceiptRequest> response = new GenricResponse<SchoolReceiptRequest>();
		try {
			return response.createSuccessResponse(feeService.updateAssignedFeeToStudent(schoolReceiptRequest),
					Constant.SUCCESS_CODE);
		} catch (BizException e) {
			return response.createErrorResponse(Constant.BAD_REQUEST_CODE, e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			return response.createErrorResponse(Constant.INTERNAL_SERVER_ERR, e.getMessage());
		}
	}

    @RequestMapping(path = "getStudentFeesForReceipt", method = RequestMethod.POST)
    public Response<com.school.object.response.StudentFeeReceiptResponse> getStudentFeesForReceipt(
            @RequestBody Request<SchoolReceiptRequest> request) {
        GenricResponse<com.school.object.response.StudentFeeReceiptResponse> response = new GenricResponse<>();
        try {
            List<com.school.object.response.StudentFeeReceiptResponse> fees = feeService.getStudentFeesForReceipt(request);
            return response.createListResponse(fees, Constant.SUCCESS_CODE, String.valueOf(fees.size()));
        } catch (BizException error) {
            return response.createErrorResponse(Constant.BAD_REQUEST_CODE, error.getMessage());
        } catch (Exception error) {
            error.printStackTrace();
            return response.createErrorResponse(Constant.INTERNAL_SERVER_ERR, "Unable to load installment balances");
        }
    }

	@RequestMapping(path = "getAssignedFeeToStudentDetails", method = RequestMethod.POST)
	public Response<StudentFeeResponse> getAssignedFeeToStudentDetails(
			@RequestBody Request<SchoolReceiptRequest> schoolReceiptRequest) {
		GenricResponse<StudentFeeResponse> response = new GenricResponse<StudentFeeResponse>();
		try {
			List<StudentFeeResponse> assignedFees = feeService.getAssignedFeeToStudentDetails(schoolReceiptRequest);
			return response.createListResponse(assignedFees, Constant.SUCCESS_CODE,
					String.valueOf(assignedFees.size()));
		} catch (BizException e) {
			return response.createErrorResponse(Constant.BAD_REQUEST_CODE, e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			return response.createErrorResponse(Constant.INTERNAL_SERVER_ERR, e.getMessage());
		}
	}

//	private void bindAuthenticatedTenant(Request<SchoolReceiptRequest> request) throws BizException {
//		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//		if (authentication == null || authentication.getDetails() == null) {
//			throw new BizException(Constant.BAD_REQUEST_CODE, "Authenticated tenant is missing");
//		}
//		if (request == null || request.getPayload() == null) {
//			throw new BizException(Constant.BAD_REQUEST_CODE, "Request payload must not be null");
//		}
//		request.getPayload().setSuperadminId(authentication.getDetails().toString());
//	}

}
