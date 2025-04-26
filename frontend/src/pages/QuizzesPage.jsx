import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Trash2, Edit } from 'lucide-react';
import api from '../services/api';
import QuizForm from './QuizForm';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserAndQuizzes = async () => {
      try {
        // Fetch user profile to get userId
        const userResponse = await api.get('/user/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const userId = userResponse.data.id; // Assuming user object has an id field
        setUserId(userId);

        // Fetch quizzes for the user
        const quizzesResponse = await api.get(`/api/quizzes/user/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setQuizzes(quizzesResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load quizzes');
        setLoading(false);
      }
    };

    fetchUserAndQuizzes();
  }, []);

  const handleCreateQuiz = async (quiz) => {
    try {
      const response = await api.post(`/api/quizzes/user/${userId}`, quiz, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setQuizzes([...quizzes, response.data]);
      setShowForm(false);
    } catch (err) {
      setError('Failed to create quiz');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await api.delete(`/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
      } catch (err) {
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
              to="/dashboard"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Your Quizzes</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
          >
            {showForm ? 'Cancel' : 'Create New Quiz'}
          </button>
        </div>

        {showForm && <QuizForm onSubmit={handleCreateQuiz} />}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No quizzes found</h3>
              <p className="text-gray-500">Create a new quiz to get started!</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white">
                  <h3 className="text-base font-bold">{quiz.title}</h3>
                  <p className="text-sm text-white opacity-90">{quiz.description}</p>
                </div>
                <div className="p-4">
                  <div className="flex justify-between">
                    <Link
                      to={`/quizzes/${quiz.id}`}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </Link>
                    <div className="flex gap-2">
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
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}