import { useState } from 'react';

export default function QuestionForm({ onSubmit, initialQuestion = {} }) {
  const [text, setText] = useState(initialQuestion.text || '');
  const [answer, setAnswer] = useState(initialQuestion.answer || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || !answer.trim()) {
      setError('Question and answer are required');
      return;
    }
    setError('');
    onSubmit({ text, answer });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">{initialQuestion.id ? 'Edit Question' : 'Add Question'}</h2>
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">{error}</div>
      )}
      <div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Question</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter question"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Answer</label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter answer"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
            >
              {initialQuestion.id ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}