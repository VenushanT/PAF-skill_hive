package com.example.demo.service;

import com.example.demo.model.Question;
import java.util.List;

public interface QuestionService {
    Question createQuestion(Long quizId, Question question);
    List<Question> getQuestionsByQuiz(Long quizId);
    Question updateQuestion(Long id, Question question);
    void deleteQuestion(Long id);
}
