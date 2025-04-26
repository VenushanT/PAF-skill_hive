import { useState } from 'react';

export default function QuestionForm({ onSubmit, initialQuestion = {} }) {
  const [text, setText] = useState(initialQuestion.text || '');
  const [answer, setAnswer] = useState(initialQuestion.answer || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || !answer.trim()) {
      setError('Both Question and Answer are required');
      return;
    }
    setError('');
    onSubmit({ text, answer });
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 mb-10 animate-fadeIn">
      <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-8">
        {initialQuestion.id ? '✏️ Edit Question' : '➕ Add New Question'}
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-md font-semibold text-gray-700 mb-2">Question</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your question here..."
          />
        </div>

        <div>
          <label className="block text-md font-semibold text-gray-700 mb-2">Answer</label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter the correct answer..."
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition duration-300 shadow-md"
          >
            {initialQuestion.id ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
