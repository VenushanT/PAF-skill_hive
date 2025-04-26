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
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">{initialQuiz.id ? 'Edit Quiz' : 'Create Quiz'}</h2>
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">{error}</div>
      )}
      <div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter quiz title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter quiz description"
              rows="4"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
            >
              {initialQuiz.id ? 'Update Quiz' : 'Create Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}