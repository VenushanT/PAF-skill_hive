package com.example.demo.service;

import com.example.demo.model.Quiz;
import java.util.List;

public interface QuizService {
    Quiz createQuiz(Long userId, Quiz quiz);
    List<Quiz> getQuizzesByUser(Long userId);
    Quiz updateQuiz(Long id, Quiz quiz);
    void deleteQuiz(Long id);
    Quiz getQuizById(Long id);
}
