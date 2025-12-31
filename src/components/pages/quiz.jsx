import { useState } from 'react';
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

const MCQQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      id: 1,
      question: "What is the time complexity of binary search on a sorted array?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      correct: 1
    },
    {
      id: 2,
      question: "Which data structure is used to implement recursion?",
      options: ["Queue", "Stack", "Linked List", "Tree"],
      correct: 1
    },
    {
      id: 3,
      question: "Which traversal method is used to get nodes of a Binary Search Tree in sorted order?",
      options: ["Preorder", "Inorder", "Postorder", "Level Order"],
      correct: 1
    },
    {
      id: 4,
      question: "What is the space complexity of Merge Sort?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
      correct: 2
    },
    {
      id: 5,
      question: "In a max heap, the largest element is located at:",
      options: ["Leftmost node", "Rightmost node", "Root node", "Any leaf node"],
      correct: 2
    },
    {
      id: 6,
      question: "Which of the following operations is the most efficient in a hash table?",
      options: ["Insertion", "Traversal", "Sorting", "Searching in sorted order"],
      correct: 0
    },
    {
      id: 7,
      question: "Which data structure gives the best performance for implementing LRU cache?",
      options: ["Stack", "Queue", "HashMap + Doubly Linked List", "Array"],
      correct: 2
    },
    {
      id: 8,
      question: "What is the worst-case time complexity of Quick Sort?",
      options: ["O(n log n)", "O(n^2)", "O(log n)", "O(n)"],
      correct: 1
    },
    {
      id: 9,
      question: "Which algorithm is used to find the shortest path in a weighted graph without negative edges?",
      options: ["Prim’s Algorithm", "Kruskal’s Algorithm", "Dijkstra’s Algorithm", "Bellman-Ford Algorithm"],
      correct: 2
    },
    {
      id: 10,
      question: "Which of the following data structures is used in Breadth First Search (BFS)?",
      options: ["Stack", "Queue", "Priority Queue", "Tree"],
      correct: 1
    }
  ];
  

  const handleOptionClick = (questionId, optionIndex) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getOptionStyle = (questionId, optionIndex, correctIndex) => {
    const isSelected = answers[questionId] === optionIndex;
    const isCorrect = optionIndex === correctIndex;

    let baseStyle = "w-full p-4 text-left rounded-lg transition-all duration-300 border-2 font-medium ";

    if (!submitted) {
      return baseStyle + (isSelected 
        ? "bg-indigo-50 border-indigo-500 text-indigo-900" 
        : "bg-white border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700");
    }

    if (isCorrect) {
      return baseStyle + "bg-green-50 border-green-500 text-green-900";
    }
    if (isSelected && !isCorrect) {
      return baseStyle + "bg-red-50 border-red-500 text-red-900";
    }
    return baseStyle + "bg-white border-gray-200 text-gray-500";
  };

  const getQuestionStatus = (index) => {
    const questionId = questions[index].id;
    if (!submitted) {
      return answers[questionId] !== undefined ? 'answered' : 'unanswered';
    }
    return answers[questionId] === questions[index].correct ? 'correct' : 'incorrect';
  };

  const score = submitted ? questions.filter(q => answers[q.id] === q.correct).length : 0;

  const q = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Interactive MCQ Quiz
          </h1>
          <p className="text-gray-600">Test your knowledge with 10 challenging questions</p>
        </div>

        <div className="flex gap-6">
          {/* Main Quiz Area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                {submitted && (
                  <span className="text-sm font-semibold text-gray-600">
                    Score: {score}/{questions.length}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
                {q.question}
              </h2>

              <div className="space-y-4 mb-8">
                {q.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(q.id, index)}
                    disabled={submitted}
                    className={getOptionStyle(q.id, index, q.correct)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {submitted && index === q.correct && (
                        <Check className="w-6 h-6 text-green-600" />
                      )}
                      {submitted && answers[q.id] === index && index !== q.correct && (
                        <X className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                {!submitted && (
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    Submit Quiz
                  </button>
                )}

                <button
                  onClick={handleNext}
                  disabled={currentQuestion === questions.length - 1}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {submitted && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">
                    {score === questions.length ? '🎉 Perfect Score!' : 
                     score >= questions.length * 0.7 ? '👏 Great Job!' : 
                     score >= questions.length * 0.5 ? '👍 Good Effort!' : 
                     '💪 Keep Practicing!'}
                  </h3>
                  <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {score} / {questions.length}
                  </p>
                  <p className="text-gray-600 mt-2">
                    {Math.round((score / questions.length) * 100)}% Correct
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="w-80">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-3">
                {questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`
                        aspect-square rounded-lg font-bold text-sm transition-all transform hover:scale-110
                        ${currentQuestion === index ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                        ${status === 'answered' && !submitted ? 'bg-indigo-100 text-indigo-700' : ''}
                        ${status === 'unanswered' ? 'bg-gray-100 text-gray-400' : ''}
                        ${status === 'correct' ? 'bg-green-100 text-green-700' : ''}
                        ${status === 'incorrect' ? 'bg-red-100 text-red-700' : ''}
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-indigo-100"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-gray-100"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
                {submitted && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-green-100"></div>
                      <span className="text-gray-600">Correct</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-red-100"></div>
                      <span className="text-gray-600">Incorrect</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQQuiz;