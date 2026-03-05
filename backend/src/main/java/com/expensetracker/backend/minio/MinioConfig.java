package com.expensetracker.backend.minio;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {
    private final String url;
    private final String accessKey;
    private final String secretKey;
    private final String region;

    public MinioConfig(@Value("${minio.url}") String url,
                       @Value("${minio.access.key}") String accessKey,
                       @Value("${minio.secret.key}") String secretKey,
                       @Value("${minio.region}") String region) {
        this.url = url;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.region = region;
    }

    @Bean
    public MinioClient minioClient(){
        return MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .region(region)
                .build();
    }
}
