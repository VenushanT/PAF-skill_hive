import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Trash2, Edit } from 'lucide-react';
import api from '../services/api';
import QuestionForm from './QuestionForm';

export default function QuizDetailsPage() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  useEffect(() => {
    const fetchQuizAndQuestions = async () => {
      try {
        // Fetch quiz details
        const quizResponse = await api.get(`/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setQuiz(quizResponse.data);

        // Fetch questions for the quiz
        const questionsResponse = await api.get(`/api/questions/quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setQuestions(questionsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load quiz details');
        setLoading(false);
      }
    };

    fetchQuizAndQuestions();
  }, [quizId]);

  const handleCreateQuestion = async (question) => {
    try {
      const response = await api.post(`/api/questions/quiz/${quizId}`, question, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setQuestions([...questions, response.data]);
      setShowQuestionForm(false);
    } catch (err) {
      setError('Failed to create question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await api.delete(`/api/questions/${questionId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setQuestions(questions.filter((q) => q.id !== questionId));
      } catch (err) {
        setError('Failed to delete question');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-600">Loading quiz details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="inline-flex rounded-full bg-red-100 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-800">Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
          <div className="text-center">
            <Link
              to="/quizzes"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
            <p className="text-gray-600 mt-1">{quiz.description}</p>
          </div>
          <Link
            to={`/quizzes/${quiz.id}/edit`}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Edit className="h-5 w-5" />
            Edit Quiz
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Questions</h2>
            <button
              onClick={() => setShowQuestionForm(!showQuestionForm)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
            >
              {showQuestionForm ? 'Cancel' : 'Add Question'}
            </button>
          </div>

          {showQuestionForm && <QuestionForm onSubmit={handleCreateQuestion} />}

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No questions found</h3>
                <p className="text-gray-500">Add a question to this quiz!</p>
              </div>
            ) : (
              <div className="divide-y">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-semibold">{question.text}</h3>
                      <p className="text-sm text-gray-500">Answer: {question.answer}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/quizzes/${quiz.id}/questions/${question.id}/edit`}
                        className="p-2 text-gray-500 hover:text-blue-600"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Link
          to="/quizzes"
          className="flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800"
        >
          <ChevronRight className="h-4 w-4" />
          Back to Quizzes
        </Link>
      </main>
    </div>
  );
}