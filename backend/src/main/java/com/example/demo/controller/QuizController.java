package com.example.demo.controller;

import com.example.demo.model.Quiz;
import com.example.demo.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping("/user/{userId}")
    public Quiz createQuiz(@PathVariable Long userId, @RequestBody Quiz quiz) {
        return quizService.createQuiz(userId, quiz);
    }

    @GetMapping("/user/{userId}")
    public List<Quiz> getUserQuizzes(@PathVariable Long userId) {
        return quizService.getQuizzesByUser(userId);
    }

    @GetMapping("/{id}")
    public Quiz getQuizById(@PathVariable Long id) {
        return quizService.getQuizById(id);
    }

    @PutMapping("/{id}")
    public Quiz updateQuiz(@PathVariable Long id, @RequestBody Quiz quiz) {
        return quizService.updateQuiz(id, quiz);
    }

    @DeleteMapping("/{id}")
    public void deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
    }
}
