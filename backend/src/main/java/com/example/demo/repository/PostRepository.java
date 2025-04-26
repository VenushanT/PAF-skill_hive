package com.example.demo.repository;

import com.example.demo.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

// MongoDB repository for Post
public interface PostRepository extends MongoRepository<Post, String> {
    // Find all posts with pagination
    Page<Post> findAll(Pageable pageable);
    // Find posts by creator ID
    List<Post> findByCreatorId(String creatorId);
    // Find posts by creator ID with pagination (optional)
    Page<Post> findByCreatorId(String creatorId, Pageable pageable);
}