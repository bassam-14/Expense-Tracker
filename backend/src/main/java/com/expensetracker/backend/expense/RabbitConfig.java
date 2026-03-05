package com.expensetracker.backend.expense;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class RabbitConfig {

    private final String exchangeName;
    private final String routingKey;
    private final String queueName;
    private final String resultQueueName;
    private final String resultRoutingKey;

    public RabbitConfig(@Value("${rabbitmq.exchange.name}") String exchangeName,
                        @Value("${rabbitmq.routing.key}") String routingKey,
                        @Value("${rabbitmq.queue.name}") String queueName,
                        @Value("${rabbitmq.result.queue.name}") String resultQueueName,
                        @Value("${rabbitmq.result.routing.key}") String resultRoutingKey) {
        this.exchangeName = exchangeName;
        this.routingKey = routingKey;
        this.queueName = queueName;
        this.resultQueueName = resultQueueName;
        this.resultRoutingKey = resultRoutingKey;
    }

    @Bean
    public Queue queue(){
        return new Queue(queueName, true);
    }

    @Bean
    public Queue resultQueue(){
        return new Queue(resultQueueName, true);
    }

    @Bean
    public TopicExchange exchange(){
        return new TopicExchange(exchangeName);
    }

    @Bean
    public Binding binding(Queue queue, TopicExchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with(routingKey);
    }

    @Bean
    public Binding resultBinding() {
        return BindingBuilder.bind(resultQueue()).to(exchange()).with(resultRoutingKey);
    }

    @Bean
    public MessageConverter messageConverter(){
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter messageConverter){
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);

        template.setExchange(exchangeName);
        template.setRoutingKey(routingKey);

        return template;
    }
}
