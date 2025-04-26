import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Trash2, Edit } from 'lucide-react';
import api from '../services/api';
import QuizForm from './QuizForm';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserAndQuizzes = async () => {
      try {
        const userRes = await api.get('/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userId = userRes?.data?.id;
        setUserId(userId);

        const quizzesRes = await api.get(`/api/quizzes/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(quizzesRes?.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndQuizzes();
  }, [token]);

  const handleCreateQuiz = async (quiz) => {
    try {
      const res = await api.post(`/api/quizzes/user/${userId}`, quiz, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes([...quizzes, res.data]);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError('Failed to create quiz');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await api.delete(`/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(quizzes.filter((q) => q.id !== quizId));
      } catch (err) {
        console.error(err);
        setError('Failed to delete quiz');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto">
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
          <h2 className="text-2xl font-bold text-gray-800">Oops!</h2>
          <p className="text-gray-600">{error}</p>
          <Link
            to="/dashboard"
            className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Quizzes</h1>
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition text-sm"
          >
            {showForm ? 'Cancel' : 'Create New Quiz'}
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <QuizForm onSubmit={handleCreateQuiz} />
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No quizzes found</h3>
            <p className="text-gray-500">Create your first quiz to get started!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-xl"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white">
                  <h3 className="text-lg font-bold">{quiz.title}</h3>
                  <p className="text-sm opacity-90">{quiz.description}</p>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <Link
                    to={`/quizzes/${quiz.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View Details
                  </Link>
                  <div className="flex space-x-2">
                    <Link
                      to={`/quizzes/${quiz.id}/edit`}
                      className="p-2 text-gray-500 hover:text-blue-600"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-2 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
