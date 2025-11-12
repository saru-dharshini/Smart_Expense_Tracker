package com.paypulse.controller;

import com.paypulse.service.ReportService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/monthly/pdf")
    public ResponseEntity<ByteArrayResource> downloadMonthlyPdf(@RequestParam(required = false) Integer year,
                                                                @RequestParam(required = false) Integer month) {
        LocalDate today = LocalDate.now();
        int targetYear = year != null ? year : today.getYear();
        int targetMonth = month != null ? month : today.getMonthValue();
        byte[] bytes = reportService.generateMonthlyPdf(targetYear, targetMonth);
        ByteArrayResource resource = new ByteArrayResource(bytes);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=paypulse-report-" + targetYear + "-" + targetMonth + ".pdf")
                .contentLength(bytes.length)
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    @GetMapping("/monthly/excel")
    public ResponseEntity<ByteArrayResource> downloadMonthlyExcel(@RequestParam(required = false) Integer year,
                                                                  @RequestParam(required = false) Integer month) {
        LocalDate today = LocalDate.now();
        int targetYear = year != null ? year : today.getYear();
        int targetMonth = month != null ? month : today.getMonthValue();
        byte[] bytes = reportService.generateMonthlyExcel(targetYear, targetMonth);
        ByteArrayResource resource = new ByteArrayResource(bytes);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=paypulse-report-" + targetYear + "-" + targetMonth + ".xlsx")
                .contentLength(bytes.length)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(resource);
    }
}

