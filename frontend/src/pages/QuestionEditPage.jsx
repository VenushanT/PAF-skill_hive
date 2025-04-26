import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="text-center animate-fadeIn">
          <div className="animate-spin h-16 w-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-lg font-semibold text-gray-700">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 animate-fadeIn">
          <div className="text-center mb-6">
            <div className="inline-flex rounded-full bg-red-100 p-5 shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-red-500"
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
            <h2 className="mt-4 text-2xl font-bold text-gray-800">Something went wrong</h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
          <div className="text-center">
            <Link
              to={`/quizzes/${quizId}`}
              className="inline-block px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-all shadow-md"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 animate-fadeIn">
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-2xl p-10">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Edit Question</h1>
          <QuestionForm initialQuestion={question} onSubmit={handleUpdateQuestion} />
        </div>
      </main>
    </div>
  );
}
