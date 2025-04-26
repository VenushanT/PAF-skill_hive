import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, ChevronLeft, Trash2, Edit, PlusCircle } from 'lucide-react';
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
        const quizRes = await api.get(`/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setQuiz(quizRes.data);

        const questionsRes = await api.get(`/api/questions/quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setQuestions(questionsRes.data);

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
      const res = await api.post(`/api/questions/quiz/${quizId}`, question, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setQuestions([...questions, res.data]);
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
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700">Loading quiz details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-100 to-red-200">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-md w-full">
          <div className="inline-flex bg-red-100 p-5 rounded-full mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
          <p className="text-gray-600 mt-3">{error}</p>
          <Link to="/quizzes" className="mt-8 inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition shadow-md">
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <main className="max-w-6xl mx-auto px-6 py-12 mt-16">
        {/* Header with consistent styling */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold text-gray-800 leading-tight">{quiz.title}</h1>
            <p className="text-lg text-gray-600 mt-3">{quiz.description}</p>
          </div>
          <Link
            to={`/quizzes/${quiz.id}/edit`}
            className="flex items-center gap-2 px-6 py-3.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow-lg font-medium"
          >
            <Edit className="w-5 h-5" />
            <span>Edit Quiz</span>
          </Link>
        </div>

        <section className="mb-14">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-700">Questions</h2>
            <button
              onClick={() => setShowQuestionForm(!showQuestionForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition shadow-md"
            >
              {showQuestionForm ? (
                'Cancel'
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  <span>Add Question</span>
                </>
              )}
            </button>
          </div>

          {/* Question form with consistent padding */}
          {showQuestionForm && (
            <div className="mb-10 bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Create New Question</h3>
              <QuestionForm onSubmit={handleCreateQuestion} />
            </div>
          )}

          {/* Questions container with enhanced styling */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <BookOpen className="h-20 w-20 text-gray-300 mb-6" />
                <h3 className="text-2xl font-semibold text-gray-700">No questions yet</h3>
                <p className="text-gray-500 mt-3 text-lg">Start adding questions to make your quiz complete!</p>
                <button
                  onClick={() => setShowQuestionForm(true)}
                  className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition shadow-md flex items-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Add First Question</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {questions.map((q, index) => (
                  <div key={q.id} className="flex justify-between items-start p-6 hover:bg-gray-50 transition">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-semibold">
                          {index + 1}
                        </span>
                        <h4 className="text-lg font-semibold text-gray-800">{q.text}</h4>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 ml-11">Answer: <span className="font-medium">{q.answer}</span></p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <Link
                        to={`/quizzes/${quiz.id}/questions/${q.id}/edit`}
                        className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <Link
          to="/quizzes"
          className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-800 transition px-4 py-2 rounded-lg hover:bg-purple-50"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Quizzes
        </Link>
      </main>
    </div>
  );
}