import { useState } from 'react';

export default function QuizForm({ onSubmit, initialQuiz = {} }) {
  const [title, setTitle] = useState(initialQuiz.title || '');
  const [description, setDescription] = useState(initialQuiz.description || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    onSubmit({ title, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter quiz title"
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter quiz description"
          rows="4"
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-200 text-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {initialQuiz.id ? 'Update Quiz' : 'Create Quiz'}
        </button>
      </div>
    </form>
  );
}
