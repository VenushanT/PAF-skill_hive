import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import QuestionForm from './QuestionForm';

export default function QuestionEditPage() {
  const { quizId, questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        // Note: The backend doesn't have a direct endpoint to get a question by ID,
        // so we fetch all questions for the quiz and find the one we need.
        // Ideally, the backend should have a GET /api/questions/{id} endpoint.
        const response = await api.get(`/api/questions/quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const question = response.data.find((q) => q.id === parseInt(questionId));
        if (!question) throw new Error('Question not found');
        setQuestion(question);
        setLoading(false);
      } catch (err) {
        setError('Failed to load question');
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [quizId, questionId]);

  const handleUpdateQuestion = async (updatedQuestion) => {
    try {
      const response = await api.put(`/api/questions/${questionId}`, updatedQuestion, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setQuestion(response.data);
      navigate(`/quizzes/${quizId}`);
    } catch (err) {
      setError('Failed to update question');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-600">Loading question...</p>
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
              to={`/quizzes/${quizId}`}
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Quiz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Question</h1>
        <QuestionForm initialQuestion={question} onSubmit={handleUpdateQuestion} />
      </main>
    </div>
  );
}