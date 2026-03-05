package com.expensetracker.backend.minio;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Service
public class MinioService {
    private final MinioClient minioClient;
    private final String bucketName;

    public MinioService(MinioClient minioClient,
                        @Value("${minio.bucket.name}") String bucketName) {
        this.minioClient = minioClient;
        this.bucketName = bucketName;
    }

    public String uploadFile(Long userId, MultipartFile file){
        try {
            // Ensure the bucket exists
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }
            // Generate a unique object name
            String fileName = "user_" + userId + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

            // Upload the file to Minio
            try (InputStream inputStream = file.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(fileName)
                                .stream(inputStream, file.getSize(),-1)
                                .contentType(file.getContentType())
                                .build()
                );
            }
            // Return the object path
            return "/" + bucketName + "/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Error occurred: " + e.getMessage());
        }
    }
}
