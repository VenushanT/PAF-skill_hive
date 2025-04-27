package com.example.demo.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Post entity for MongoDB
@Data
@Document(collection = "posts")
public class Post {
    @Id
    private String id; // Unique identifier
    private String text; // Post text content
    private String creatorId; // User ID of the creator
    private String creatorName; // Creator's name for display
    private List<String> likes = new ArrayList<>(); // List of user IDs who liked the post
    private List<Media> media = new ArrayList<>(); // List of media (images/videos)
    private List<Comment> comments = new ArrayList<>(); // List of comments
    private LocalDateTime createdAt; // Creation timestamp
    private LocalDateTime updatedAt; // Last update timestamp

    // Nested class for media metadata
    @Data
    public static class Media {
        private String path; // Local file path (e.g., /uploads/filename.jpg)
        private MediaType type; // IMAGE or VIDEO
    }

    // Enum for media types
    public enum MediaType {
        IMAGE, VIDEO
    }

    // Nested class for comments
    @Data
    public static class Comment {
        private String id; // Unique comment ID
        private String text; // Comment text
        private String creatorId; // User ID of commenter
        private String creatorName; // Commenter's name
        private LocalDateTime createdAt; // Comment timestamp
    }
}