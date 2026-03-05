package com.expensetracker.backend.expense;

import com.expensetracker.backend.minio.MinioService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;


@Service
public class ExpenseService {

    private final ExpenseRepository repository;
    private final MinioService minioService;
    private final RabbitTemplate rabbitTemplate;

    public ExpenseService(ExpenseRepository repository,
                          MinioService minioService,
                          RabbitTemplate rabbitTemplate) {
        this.repository = repository;
        this.minioService = minioService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Transactional
    public Expense processNewReceipt(Long userId, MultipartFile file){
        // Upload image to minio and get path
        String imageUrl = minioService.uploadFile(userId, file);

        // Create pending expense and save to database
        Expense newExpense = Expense.createPending(userId, imageUrl);
        Expense savedExpense = repository.save(newExpense);

        // Send a message to RabbitMQ for the Python worker
        ExpenseMessage message = new ExpenseMessage(savedExpense.id(), savedExpense.imageUrl());
        rabbitTemplate.convertAndSend(message);

        return savedExpense;
    }

    @Transactional
    public void updateExpenseWithExtractedData(ResultDto result) {
        Expense expense = repository.findById(result.expenseId())
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        Map<String, Object> data = result.extractedData();
        String merchant = (String) data.get("Merchant");
        String category = (String) data.get("Category");

        BigDecimal amount = null;
        if (data.get("Total") != null) {
            amount = new BigDecimal(data.get("Total").toString());
        }
        LocalDate date = null;
        if (data.get("Date") != null) {
            date = LocalDate.parse(data.get("Date").toString());
        }

        Expense updatedExpense = expense.updateWithExtractedData(
                merchant,
                amount,
                date,
                category);


        // Save the updated expense back to the database
        repository.save(updatedExpense);
    }

    public Expense getExpenseByIdAndUserId(String expenseId, Long userId) {
        return repository.findByIdAndUserId(expenseId, userId)
                .orElseThrow(() -> new RuntimeException("Expense not found or unauthorized"));
    }

    public List<Expense> getAllExpensesForUser(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Expense confirmExpense(String expenseId, ExpenseUpdateRequest request, Long userId) {
        Expense expense = getExpenseByIdAndUserId(expenseId,
                userId);

        Expense finalizedExpense = new Expense(
                expense.id(),
                expense.userId(),
                request.merchant(),
                request.amount(),
                request.date(),
                request.category(),
                ExpenseStatus.COMPLETED,
                expense.imageUrl(),
                expense.createdAt(),
                expense.version()
        );
        return repository.save(finalizedExpense);
    }

    public void deleteExpense(String expenseId, Long userId) {
        Expense expense = getExpenseByIdAndUserId(expenseId, userId);
        repository.delete(expense);
    }

    @Transactional
    public Expense createExpense(ExpenseDto request, Long userId) {
        Expense newExpense = Expense.createCompleted(
                userId,
                request.merchant(),
                request.amount(),
                request.date(),
                request.category()
        );
        return repository.save(newExpense);
    }
}
