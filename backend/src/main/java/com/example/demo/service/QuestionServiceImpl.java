package com.example.demo.service;

import com.example.demo.model.Question;
import com.example.demo.model.Quiz;
import com.example.demo.repository.QuestionRepository;
import com.example.demo.repository.QuizRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class QuestionServiceImpl implements QuestionService {

    @Autowired
    private QuestionRepository questionRepo;

    @Autowired
    private QuizRepository quizRepo;

    @Override
    public Question createQuestion(Long quizId, Question question) {
        Quiz quiz = quizRepo.findById(quizId).orElseThrow(() -> new EntityNotFoundException("Quiz not found"));
        question.setQuiz(quiz);
        return questionRepo.save(question);
    }

    @Override
    public List<Question> getQuestionsByQuiz(Long quizId) {
        return questionRepo.findByQuizId(quizId);
    }

    @Override
    public Question updateQuestion(Long id, Question question) {
        Question existing = questionRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Question not found"));
        existing.setText(question.getText());
        existing.setAnswer(question.getAnswer());
        return questionRepo.save(existing);
    }

    @Override
    public void deleteQuestion(Long id) {
        questionRepo.deleteById(id);
    }
}
