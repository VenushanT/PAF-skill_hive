package com.example.demo.service;

import com.example.demo.model.Quiz;
import com.example.demo.model.User;
import com.example.demo.repository.QuizRepository;
import com.example.demo.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class QuizServiceImpl implements QuizService {

    @Autowired
    private QuizRepository quizRepo;

    @Autowired
    private UserRepository userRepo;

    @Override
    public Quiz createQuiz(Long userId, Quiz quiz) {
        User user = userRepo.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        quiz.setUser(user);
        return quizRepo.save(quiz);
    }

    @Override
    public List<Quiz> getQuizzesByUser(Long userId) {
        return quizRepo.findByUserId(userId);
    }

    @Override
    public Quiz updateQuiz(Long id, Quiz quiz) {
        Quiz existing = quizRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Quiz not found"));
        existing.setTitle(quiz.getTitle());
        existing.setDescription(quiz.getDescription());
        return quizRepo.save(existing);
    }

    @Override
    public void deleteQuiz(Long id) {
        quizRepo.deleteById(id);
    }

    @Override
    public Quiz getQuizById(Long id) {
        return quizRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Quiz not found"));
    }
}
