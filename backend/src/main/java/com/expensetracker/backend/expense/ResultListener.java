package com.expensetracker.backend.expense;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class ResultListener {
    private final ExpenseService expenseService;

    public ResultListener(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @RabbitListener(queues = "${rabbitmq.result.queue.name}")
    public void handleReceiptResult(ResultDto result) {
        try {
            expenseService.updateExpenseWithExtractedData(result);
        } catch (RuntimeException e) {
            System.out.println("Ignored result for deleted expense: " + e.getMessage());
        }
    }
}
