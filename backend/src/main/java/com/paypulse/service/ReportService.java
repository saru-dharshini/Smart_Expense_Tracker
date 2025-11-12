package com.paypulse.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Table;
import com.paypulse.dto.ExpenseResponse;
import com.paypulse.entity.User;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {

    private final ExpenseService expenseService;
    private final CurrentUserService currentUserService;

    public ReportService(ExpenseService expenseService,
                         CurrentUserService currentUserService) {
        this.expenseService = expenseService;
        this.currentUserService = currentUserService;
    }

    public byte[] generateMonthlyPdf(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();
        List<ExpenseResponse> expenses = expenseService.listExpensesForRange(start, end);
        User user = currentUserService.getCurrentUser();
        BigDecimal total = expenses.stream()
                .map(ExpenseResponse::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            com.lowagie.text.pdf.PdfWriter.getInstance(document, out);
            document.open();

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            document.add(new Paragraph("PayPulse Monthly Report", headerFont));
            document.add(new Paragraph("User: " + user.getFullName() + " (" + user.getEmail() + ")", regularFont));
            document.add(new Paragraph("Period: " + yearMonth.getMonth() + " " + year, regularFont));
            document.add(new Paragraph("Total Spent: " + user.getBaseCurrency() + " " + total, regularFont));
            document.add(new Paragraph(" "));

            Table table = new Table(5);
            table.addCell(new Phrase("Date", headerFont));
            table.addCell(new Phrase("Category", headerFont));
            table.addCell(new Phrase("Merchant", headerFont));
            table.addCell(new Phrase("Note", headerFont));
            table.addCell(new Phrase("Amount (" + user.getBaseCurrency() + ")", headerFont));

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            for (ExpenseResponse expense : expenses) {
                table.addCell(new Phrase(expense.getExpenseDate().format(formatter), regularFont));
                table.addCell(new Phrase(expense.getCategoryName(), regularFont));
                table.addCell(new Phrase(expense.getMerchant() != null ? expense.getMerchant() : "-", regularFont));
                table.addCell(new Phrase(expense.getNote() != null ? expense.getNote() : "-", regularFont));
                table.addCell(new Phrase(expense.getAmount().toPlainString(), regularFont));
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (DocumentException | IOException e) {
            throw new IllegalStateException("Failed to generate PDF report", e);
        }
    }

    public byte[] generateMonthlyExcel(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();
        List<ExpenseResponse> expenses = expenseService.listExpensesForRange(start, end);
        User user = currentUserService.getCurrentUser();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Expenses");
            sheet.setDefaultColumnWidth(18);
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            String[] headers = {"Date", "Category", "Merchant", "Note", "Amount (" + user.getBaseCurrency() + ")"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            int rowIdx = 1;
            for (ExpenseResponse expense : expenses) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(expense.getExpenseDate().format(formatter));
                row.createCell(1).setCellValue(expense.getCategoryName());
                row.createCell(2).setCellValue(expense.getMerchant() != null ? expense.getMerchant() : "-");
                row.createCell(3).setCellValue(expense.getNote() != null ? expense.getNote() : "-");
                row.createCell(4).setCellValue(expense.getAmount().doubleValue());
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to generate Excel report", e);
        }
    }
}

