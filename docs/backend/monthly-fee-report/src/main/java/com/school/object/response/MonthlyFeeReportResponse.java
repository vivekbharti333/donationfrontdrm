package com.school.object.response;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class MonthlyFeeReportResponse {
    private String month;
    private BigDecimal totalFee = BigDecimal.ZERO.setScale(2);
    private BigDecimal dueFee = BigDecimal.ZERO.setScale(2);
    private BigDecimal receivedFee = BigDecimal.ZERO.setScale(2);
}
