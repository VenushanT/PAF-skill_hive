package com.example.demo.service;

import com.example.demo.model.Post;
import com.example.demo.repository.PostRepository;
import com.example.demo.util.MediaValidator;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostService.class);

    private final PostRepository postRepository;
    private final MediaValidator mediaValidator;

    // Directory for saving uploaded files, injected from application.properties
    @Value("${file.upload-dir}")
    private String UPLOAD_DIR;

    // Resolve UPLOAD_DIR to an absolute path at startup
    @PostConstruct
    public void init() {
        UPLOAD_DIR = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize().toString();
        logger.info("Resolved UPLOAD_DIR to absolute path: {}", UPLOAD_DIR);
    }

    // Ensure the upload directory exists
    private void ensureUploadDirectoryExists() throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR).normalize();
        logger.info("Checking upload directory in PostService: {}", uploadPath);
        if (!Files.exists(uploadPath)) {
            logger.info("Upload directory {} does not exist, creating it", uploadPath);
            Files.createDirectories(uploadPath);
            logger.info("Upload directory created successfully: {}", uploadPath);
        } else {
            logger.info("Upload directory already exists: {}", uploadPath);
        }
        // Check if the directory is writable
        if (!Files.isWritable(uploadPath)) {
            logger.error("Upload directory {} is not writable", uploadPath);
            throw new IOException("Upload directory is not writable: " + uploadPath);
        }
        logger.info("Upload directory {} is writable", uploadPath);
    }

    public Post createPost(String text, String creatorId, String creatorName, MultipartFile[] images, MultipartFile video) throws IOException {
        logger.info("Creating post with text: {}, creatorId: {}, creatorName: {}", text, creatorId, creatorName);

        // Manual validation for required fields
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Text cannot be empty");
        }
        if (creatorId == null || creatorId.trim().isEmpty()) {
            throw new IllegalArgumentException("Creator ID cannot be empty");
        }
        if (creatorName == null || creatorName.trim().isEmpty()) {
            throw new IllegalArgumentException("Creator name cannot be empty");
        }

        // Validate media
        logger.info("Validating media files: images: {}, video: {}", images != null ? images.length : 0, video != null ? video.getOriginalFilename() : "none");
        mediaValidator.validateMedia(images, video);

        Post post = new Post();
        post.setText(text);
        post.setCreatorId(creatorId);
        post.setCreatorName(creatorName);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        // Handle media uploads
        List<Post.Media> mediaList = new ArrayList<>();
        if (images != null) {
            ensureUploadDirectoryExists(); // Ensure directory exists before writing
            logger.info("Processing {} image files", images.length);
            for (int i = 0; i < images.length; i++) {
                MultipartFile image = images[i];
                if (image != null && !image.isEmpty()) {
                    logger.info("Processing image {}: name={}, size={}", i, image.getOriginalFilename(), image.getSize());
                    String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
                    Path filePath = Paths.get(UPLOAD_DIR, filename).normalize();
                    logger.info("Saving image to: {}", filePath);
                    // Double-check directory existence right before writing
                    Path parentDir = filePath.getParent();
                    if (!Files.exists(parentDir)) {
                        logger.warn("Directory {} does not exist before writing file, creating it", parentDir);
                        Files.createDirectories(parentDir);
                    }
                    try {
                        Files.write(filePath, image.getBytes());
                        logger.info("Successfully saved image to: {}", filePath);
                    } catch (IOException e) {
                        logger.error("Failed to save image to {}: {}", filePath, e.getMessage(), e);
                        throw e;
                    }
                    Post.Media media = new Post.Media();
                    media.setPath(filename);
                    media.setType(Post.MediaType.IMAGE);
                    mediaList.add(media);
                } else {
                    logger.warn("Image {} is null or empty", i);
                }
            }
        }
        if (video != null && !video.isEmpty()) {
            ensureUploadDirectoryExists(); // Ensure directory exists before writing
            logger.info("Processing video: name={}, size={}", video.getOriginalFilename(), video.getSize());
            String filename = UUID.randomUUID() + "_" + video.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR, filename).normalize();
            logger.info("Saving video to: {}", filePath);
            // Double-check directory existence right before writing
            Path parentDir = filePath.getParent();
            if (!Files.exists(parentDir)) {
                logger.warn("Directory {} does not exist before writing file, creating it", parentDir);
                Files.createDirectories(parentDir);
            }
            try {
                Files.write(filePath, video.getBytes());
                logger.info("Successfully saved video to: {}", filePath);
            } catch (IOException e) {
                logger.error("Failed to save video to {}: {}", filePath, e.getMessage(), e);
                throw e;
            }
            Post.Media media = new Post.Media();
            media.setPath(filename);
            media.setType(Post.MediaType.VIDEO);
            mediaList.add(media);
        } else if (video != null) {
            logger.warn("Video is empty");
        }
        post.setMedia(mediaList);

        logger.info("Saving post to MongoDB");
        Post savedPost = postRepository.save(post);
        logger.info("Post saved successfully with ID: {}", savedPost.getId());
        return savedPost;
    }

    public Page<Post> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findAll(pageable);
    }

    public Post getPostById(String id) {
        return postRepository.findById(id).orElse(null);
    }

    public List<Post> getPostsByUserId(String userId) {
        return postRepository.findByCreatorId(userId);
    }

    public Post updatePost(String id, String text, MultipartFile[] images, MultipartFile video) throws IOException {
        logger.info("Updating post with ID: {}", id);
        Post post = postRepository.findById(id).orElse(null);
        if (post == null) {
            logger.warn("Post not found with ID: {}", id);
            return null;
        }

        // Manual validation for required fields
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Text cannot be empty");
        }

        // Validate media
        mediaValidator.validateMedia(images, video);

        post.setText(text);
        post.setUpdatedAt(LocalDateTime.now());

        // Handle media uploads (only update media if new files are provided)
        List<Post.Media> mediaList = post.getMedia(); // Start with existing media
        if (images != null || (video != null && !video.isEmpty())) {
            mediaList = new ArrayList<>(); // Reset media list only if new media is provided
            if (images != null) {
                ensureUploadDirectoryExists(); // Ensure directory exists before writing
                logger.info("Processing {} image files for update", images.length);
                for (int i = 0; i < images.length; i++) {
                    MultipartFile image = images[i];
                    if (image != null && !image.isEmpty()) {
                        logger.info("Processing image {}: name={}, size={}", i, image.getOriginalFilename(), image.getSize());
                        String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
                        Path filePath = Paths.get(UPLOAD_DIR, filename).normalize();
                        logger.info("Saving image to: {}", filePath);
                        // Double-check directory existence right before writing
                        Path parentDir = filePath.getParent();
                        if (!Files.exists(parentDir)) {
                            logger.warn("Directory {} does not exist before writing file, creating it", parentDir);
                            Files.createDirectories(parentDir);
                        }
                        try {
                            Files.write(filePath, image.getBytes());
                            logger.info("Successfully saved image to: {}", filePath);
                        } catch (IOException e) {
                            logger.error("Failed to save image to {}: {}", filePath, e.getMessage(), e);
                            throw e;
                        }
                        Post.Media media = new Post.Media();
                        media.setPath(filename);
                        media.setType(Post.MediaType.IMAGE);
                        mediaList.add(media);
                    } else {
                        logger.warn("Image {} is null or empty", i);
                    }
                }
            }
            if (video != null && !video.isEmpty()) {
                ensureUploadDirectoryExists(); // Ensure directory exists before writing
                logger.info("Processing video: name={}, size={}", video.getOriginalFilename(), video.getSize());
                String filename = UUID.randomUUID() + "_" + video.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR, filename).normalize();
                logger.info("Saving video to: {}", filePath);
                // Double-check directory existence right before writing
                Path parentDir = filePath.getParent();
                if (!Files.exists(parentDir)) {
                    logger.warn("Directory {} does not exist before writing file, creating it", parentDir);
                    Files.createDirectories(parentDir);
                }
                try {
                    Files.write(filePath, video.getBytes());
                    logger.info("Successfully saved video to: {}", filePath);
                } catch (IOException e) {
                    logger.error("Failed to save video to {}: {}", filePath, e.getMessage(), e);
                    throw e;
                }
                Post.Media media = new Post.Media();
                media.setPath(filename);
                media.setType(Post.MediaType.VIDEO);
                mediaList.add(media);
            } else if (video != null) {
                logger.warn("Video is empty");
            }
        }
        post.setMedia(mediaList);

        logger.info("Saving updated post to MongoDB");
        Post updatedPost = postRepository.save(post);
        logger.info("Post updated successfully with ID: {}", updatedPost.getId());
        return updatedPost;
    }

    public boolean deletePost(String id) {
        logger.info("Deleting post with ID: {}", id);
        Post post = postRepository.findById(id).orElse(null);
        if (post == null) {
            logger.warn("Post not found with ID: {}", id);
            return false;
        }

        // Delete associated media files from the filesystem
        List<Post.Media> mediaList = post.getMedia();
        if (mediaList != null && !mediaList.isEmpty()) {
            for (Post.Media media : mediaList) {
                Path filePath = Paths.get(UPLOAD_DIR, media.getPath()).normalize();
                try {
                    Files.deleteIfExists(filePath);
                    logger.info("Deleted media file: {}", filePath);
                } catch (IOException e) {
                    logger.warn("Failed to delete media file {}: {}", filePath, e.getMessage());
                    // Continue with deletion even if file deletion fails
                }
            }
        }

        postRepository.deleteById(id);
        logger.info("Post deleted successfully with ID: {}", id);
        return true;
    }

    public boolean likePost(String id, String userId) {
        logger.info("Liking post with ID: {} by user: {}", id, userId);
        Post post = postRepository.findById(id).orElse(null);
        if (post == null) {
            logger.warn("Post not found with ID: {}", id);
            return false;
        }
        List<String> likes = post.getLikes();
        if (likes.contains(userId)) {
            likes.remove(userId); // Unlike
            logger.info("User {} unliked post {}", userId, id);
        } else {
            likes.add(userId); // Like
            logger.info("User {} liked post {}", userId, id);
        }
        post.setLikes(likes);
        postRepository.save(post);
        return true;
    }

    public Post addComment(String postId, String text, String creatorId, String creatorName) {
        logger.info("Adding comment to post with ID: {}", postId);
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) {
            logger.warn("Post not found with ID: {}", postId);
            return null;
        }

        // Manual validation for required fields
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment text cannot be empty");
        }
        if (creatorId == null || creatorId.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment creator ID cannot be empty");
        }
        if (creatorName == null || creatorName.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment creator name cannot be empty");
        }

        Post.Comment comment = new Post.Comment();
        comment.setId(UUID.randomUUID().toString());
        comment.setText(text);
        comment.setCreatorId(creatorId);
        comment.setCreatorName(creatorName);
        comment.setCreatedAt(LocalDateTime.now());
        post.getComments().add(comment);
        logger.info("Saving post with new comment");
        Post updatedPost = postRepository.save(post);
        logger.info("Comment added successfully to post {}", postId);
        return updatedPost;
    }

    public List<Post.Comment> getComments(String postId) {
        logger.info("Retrieving comments for post with ID: {}", postId);
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) {
            logger.warn("Post not found with ID: {}", postId);
            return null;
        }
        return post.getComments();
    }

    public Post deleteComment(String postId, String commentId, String userId) {
        logger.info("Deleting comment {} from post {} by user {}", commentId, postId, userId);
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) {
            logger.warn("Post not found with ID: {}", postId);
            return null;
        }
        List<Post.Comment> comments = post.getComments();
        boolean removed = comments.removeIf(comment ->
                comment.getId().equals(commentId) && comment.getCreatorId().equals(userId));
        if (!removed) {
            logger.warn("Comment {} not found or user {} not authorized to delete", commentId, userId);
            return null;
        }
        post.setComments(comments);
        logger.info("Saving post after deleting comment");
        Post updatedPost = postRepository.save(post);
        logger.info("Comment {} deleted successfully from post {}", commentId, postId);
        return updatedPost;
    }

    public Post updateComment(String postId, String commentId, String userId, String text, String creatorId, String creatorName) {
        logger.info("Updating comment {} in post {} by user {}", commentId, postId, userId);
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) {
            logger.warn("Post not found with ID: {}", postId);
            return null;
        }

        // Manual validation for required fields
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment text cannot be empty");
        }
        if (creatorId == null || creatorId.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment creator ID cannot be empty");
        }
        if (creatorName == null || creatorName.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment creator name cannot be empty");
        }

        List<Post.Comment> comments = post.getComments();
        Post.Comment commentToUpdate = null;
        for (Post.Comment comment : comments) {
            if (comment.getId().equals(commentId) && comment.getCreatorId().equals(userId)) {
                commentToUpdate = comment;
                break;
            }
        }

        if (commentToUpdate == null) {
            logger.warn("Comment {} not found or user {} not authorized to update in post {}", commentId, userId, postId);
            return null;
        }

        // Update the comment
        commentToUpdate.setText(text);
        commentToUpdate.setCreatorId(creatorId);
        commentToUpdate.setCreatorName(creatorName);
        commentToUpdate.setCreatedAt(LocalDateTime.now());
        post.setComments(comments);

        logger.info("Saving post after updating comment");
        Post updatedPost = postRepository.save(post);
        logger.info("Comment {} updated successfully in post {}", commentId, postId);
        return updatedPost;
    }
}