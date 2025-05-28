import React, { useState, useEffect } from 'react';

// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Main App Component with custom routing
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [gameState, setGameState] = useState(null);

  const navigateTo = (page, state = null) => {
    setCurrentPage(page);
    if (state) {
      setGameState(state);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigateTo={navigateTo} />;
      case 'game':
        return <GamePage navigateTo={navigateTo} gameState={gameState} />;
      case 'leaderboard':
        return <LeaderboardPage navigateTo={navigateTo} />;
      case 'admin':
        return <AdminPage navigateTo={navigateTo} />;
      case 'about':
        return <AboutPage navigateTo={navigateTo} />;
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };

  return (
      <div className="min-h-screen bg-light">
        {/* Navigation Bar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container">
            <a className="navbar-brand" href="#" onClick={() => navigateTo('home')}>
              Word Game
            </a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <a className="nav-link" href="#" onClick={() => navigateTo('home')}>
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#" onClick={() => navigateTo('leaderboard')}>
                    Leaderboard
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#" onClick={() => navigateTo('admin')}>
                    Manage Words
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#" onClick={() => navigateTo('about')}>
                    About
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="container mt-4">
          {renderPage()}
        </div>
      </div>
  );
}

// Home Page Component
function HomePage({ navigateTo }) {
  const [nickname, setNickname] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/words/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setError('Server is not available. Please try again later.');
      }
    } catch (error) {
      setError('Server is not available. Please try again later.');
    }
  };

  const handleStartGame = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!nickname || !category) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Check if nickname is unique
    try {
      const response = await fetch(`${API_BASE_URL}/scores/check-nickname/${nickname}`);
      const data = await response.json();

      if (!data.unique) {
        setError('Nickname already exists in leaderboard');
        setLoading(false);
        return;
      }

      // Start game
      navigateTo('game', { nickname, category });
    } catch (error) {
      setError('Failed to check nickname. Server might be unavailable.');
      setLoading(false);
    }
  };

  return (
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h1 className="card-title text-center mb-4">Word Guessing Game</h1>

              <div className="alert alert-info">
                <h5>Game Rules:</h5>
                <ul className="mb-0">
                  <li>Guess the word letter by letter</li>
                  <li>You can guess a single letter or the entire word</li>
                  <li>Each wrong guess counts as an attempt</li>
                  <li>You can use a hint (but it will reduce your score)</li>
                  <li>Score is based on time, attempts, and hint usage</li>
                </ul>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleStartGame}>
                <div className="mb-3">
                  <label htmlFor="nickname" className="form-label">Nickname</label>
                  <input
                      type="text"
                      className="form-control"
                      id="nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      required
                      disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select
                      className="form-select"
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      disabled={loading || categories.length === 0}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading || categories.length === 0}
                >
                  {loading ? 'Starting...' : 'Start Game'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}

// Game Component
function GamePage({ navigateTo, gameState }) {
  const [word, setWord] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [displayWord, setDisplayWord] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [guess, setGuess] = useState('');
  const [error, setError] = useState('');
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    if (!gameState?.nickname || !gameState?.category) {
      navigateTo('home');
      return;
    }
    fetchRandomWord();

    const timer = setInterval(() => {
      if (!gameOver) {
        setTime(t => t + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    if (word) {
      updateDisplayWord();
      checkWin();
    }
  }, [guessedLetters, word]);

  const fetchRandomWord = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/words/random/${gameState.category}`);
      if (response.ok) {
        const data = await response.json();
        setWord(data);
      } else {
        setError('No words available in this category');
        setTimeout(() => navigateTo('home'), 3000);
      }
    } catch (error) {
      setError('Failed to load word. Server might be unavailable.');
      setTimeout(() => navigateTo('home'), 3000);
    }
  };

  const updateDisplayWord = () => {
    if (!word) return;

    const display = word.word.split('').map(letter =>
        guessedLetters.has(letter) ? letter : '_'
    ).join(' ');

    setDisplayWord(display);
  };

  const checkWin = () => {
    if (!word) return;

    const isComplete = word.word.split('').every(letter =>
        guessedLetters.has(letter)
    );

    if (isComplete && !gameOver) {
      setWon(true);
      setGameOver(true);
      saveScore();
    }
  };

  const handleGuess = (e) => {
    e.preventDefault();
    setError('');

    if (gameOver) return;

    const guessLower = guess.toLowerCase();

    if (!guessLower.match(/^[a-z]+$/)) {
      setError('Please enter only letters');
      return;
    }

    if (guessLower.length === 1) {
      // Single letter guess
      if (guessedLetters.has(guessLower)) {
        setError('Letter already guessed');
        return;
      }

      setGuessedLetters(new Set([...guessedLetters, guessLower]));

      if (!word.word.includes(guessLower)) {
        setAttempts(attempts + 1);
      }
    } else {
      // Full word guess
      if (guessLower === word.word) {
        setGuessedLetters(new Set(word.word.split('')));
      } else {
        setAttempts(attempts + 1);
      }
    }

    setGuess('');
  };

  const handleHint = () => {
    setShowHint(true);
    setUsedHint(true);
  };

  const saveScore = async () => {
    try {
      const scoreData = {
        nickname: gameState.nickname,
        timeInSeconds: time,
        attempts: attempts,
        usedHint: usedHint
      };

      const response = await fetch(`${API_BASE_URL}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData)
      });

      if (response.ok) {
        // Calculate score for display
        const calcResponse = await fetch(`${API_BASE_URL}/scores/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timeInSeconds: time,
            attempts: attempts,
            usedHint: usedHint
          })
        });

        if (calcResponse.ok) {
          const scoreData = await calcResponse.json();
          setScore(scoreData.score);
        }

        // Fetch leaderboard
        const leaderboardResponse = await fetch(`${API_BASE_URL}/scores/leaderboard`);
        if (leaderboardResponse.ok) {
          const leaderboardData = await leaderboardResponse.json();
          setLeaderboard(leaderboardData);
          setShowLeaderboard(true);
        }
      } else {
        setError('Failed to save score. Server might be unavailable.');
      }
    } catch (error) {
      setError('Failed to save score. Server might be unavailable.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuit = () => {
    if (window.confirm('Are you sure you want to quit the game?')) {
      navigateTo('home');
    }
  };

  if (!word) {
    return (
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading word...</p>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
    );
  }

  return (
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Category: {gameState.category}</h2>
                <div className="text-end">
                  <div>Time: {formatTime(time)}</div>
                  <div>Attempts: {attempts}</div>
                </div>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              {!gameOver ? (
                  <>
                    <div className="text-center mb-4">
                      <h1 className="display-4" style={{ letterSpacing: '0.5em' }}>
                        {displayWord}
                      </h1>
                    </div>

                    <div className="mb-4">
                      <h5>Guessed Letters:</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {Array.from(guessedLetters).sort().map(letter => (
                            <span key={letter} className="badge bg-secondary fs-6">
                        {letter}
                      </span>
                        ))}
                      </div>
                    </div>

                    {showHint && (
                        <div className="alert alert-info">
                          <strong>Hint:</strong> {word.hint}
                        </div>
                    )}

                    <form onSubmit={handleGuess} className="mb-3">
                      <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter a letter or the full word"
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            disabled={gameOver}
                        />
                        <button type="submit" className="btn btn-primary" disabled={gameOver}>
                          Guess
                        </button>
                      </div>
                    </form>

                    <div className="d-flex gap-2">
                      <button
                          className="btn btn-warning"
                          onClick={handleHint}
                          disabled={showHint || gameOver}
                      >
                        {showHint ? 'Hint Used' : 'Show Hint (-200 points)'}
                      </button>
                      <button className="btn btn-danger" onClick={handleQuit}>
                        Quit Game
                      </button>
                    </div>
                  </>
              ) : (
                  <div className="text-center">
                    <h2 className={won ? 'text-success' : 'text-danger'}>
                      {won ? 'Congratulations! You Won!' : 'Game Over'}
                    </h2>
                    <h3 className="mt-3">The word was: <strong>{word.word}</strong></h3>
                    <p className="fs-4">Your Score: <strong>{score}</strong></p>

                    {showLeaderboard && (
                        <div className="mt-4">
                          <h4>Leaderboard</h4>
                          <table className="table table-striped">
                            <thead>
                            <tr>
                              <th>Rank</th>
                              <th>Nickname</th>
                              <th>Score</th>
                            </tr>
                            </thead>
                            <tbody>
                            {leaderboard.map((entry, index) => (
                                <tr key={index} className={entry.nickname === gameState.nickname ? 'table-primary' : ''}>
                                  <td>{index + 1}</td>
                                  <td>{entry.nickname}</td>
                                  <td>{entry.score}</td>
                                </tr>
                            ))}
                            </tbody>
                          </table>
                        </div>
                    )}

                    <button className="btn btn-primary mt-3" onClick={() => navigateTo('home')}>
                      Play Again
                    </button>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

// Leaderboard Page
function LeaderboardPage({ navigateTo }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/scores/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      } else {
        setError('Failed to load leaderboard');
      }
    } catch (error) {
      setError('Server is not available');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Leaderboard</h2>

              {loading ? (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
              ) : error ? (
                  <div className="alert alert-danger">{error}</div>
              ) : leaderboard.length === 0 ? (
                  <p className="text-center">No scores yet. Be the first to play!</p>
              ) : (
                  <table className="table table-striped">
                    <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Nickname</th>
                      <th>Score</th>
                      <th>Time</th>
                      <th>Attempts</th>
                      <th>Used Hint</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leaderboard.map((entry, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{entry.nickname}</td>
                          <td>{entry.score}</td>
                          <td>{Math.floor(entry.timeInSeconds / 60)}:{(entry.timeInSeconds % 60).toString().padStart(2, '0')}</td>
                          <td>{entry.attempts}</td>
                          <td>{entry.usedHint ? 'Yes' : 'No'}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

// Admin Page for Word Management
function AdminPage({ navigateTo }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    word: '',
    hint: ''
  });

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/words`);
      if (response.ok) {
        const data = await response.json();
        setWords(data);
      } else {
        setError('Failed to load words');
      }
    } catch (error) {
      setError('Server is not available');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate form
    if (!formData.category.match(/^[a-z]+$/)) {
      setError('Category must contain only lowercase letters');
      return;
    }
    if (!formData.word.match(/^[a-z]+$/)) {
      setError('Word must contain only lowercase letters');
      return;
    }
    if (!formData.hint.trim()) {
      setError('Hint is required');
      return;
    }

    try {
      let response;
      if (editingWord) {
        response = await fetch(`${API_BASE_URL}/words/${editingWord}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/words`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        setSuccessMessage(editingWord ? 'Word updated successfully' : 'Word added successfully');
        setFormData({ category: '', word: '', hint: '' });
        setShowAddForm(false);
        setEditingWord(null);
        fetchWords();
      } else {
        const errorText = await response.text();
        setError(errorText || 'Failed to save word');
      }
    } catch (error) {
      setError('Failed to save word');
    }
  };

  const handleEdit = (word) => {
    setFormData({
      category: word.category,
      word: word.word,
      hint: word.hint
    });
    setEditingWord(word.word);
    setShowAddForm(true);
    setError('');
    setSuccessMessage('');
  };

  const handleDelete = async (word) => {
    if (window.confirm(`Are you sure you want to delete "${word}"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/words/${word}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setSuccessMessage('Word deleted successfully');
          fetchWords();
        } else {
          setError('Failed to delete word');
        }
      } catch (error) {
        setError('Failed to delete word');
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingWord(null);
    setFormData({ category: '', word: '', hint: '' });
    setError('');
  };

  // Group words by category
  const wordsByCategory = words.reduce((acc, word) => {
    if (!acc[word.category]) {
      acc[word.category] = [];
    }
    acc[word.category].push(word);
    return acc;
  }, {});

  return (
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="card-title">Manage Words</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                    disabled={showAddForm}
                >
                  Add New Word
                </button>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}
              {successMessage && <div className="alert alert-success">{successMessage}</div>}

              {showAddForm && (
                  <div className="card mb-4">
                    <div className="card-body">
                      <h5>{editingWord ? 'Edit Word' : 'Add New Word'}</h5>
                      <form onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Category (lowercase letters only)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value.toLowerCase()})}
                                required
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Word (lowercase letters only)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.word}
                                onChange={(e) => setFormData({...formData, word: e.target.value.toLowerCase()})}
                                required
                                disabled={editingWord}
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Hint</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.hint}
                                onChange={(e) => setFormData({...formData, hint: e.target.value})}
                                required
                            />
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-success">
                            {editingWord ? 'Update' : 'Add'} Word
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
              )}

              {loading ? (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
              ) : Object.keys(wordsByCategory).length === 0 ? (
                  <p className="text-center">No words found. Add some words to get started!</p>
              ) : (
                  Object.entries(wordsByCategory).map(([category, categoryWords]) => (
                      <div key={category} className="mb-4">
                        <h4 className="text-capitalize">{category}</h4>
                        <table className="table table-sm">
                          <thead>
                          <tr>
                            <th>Word</th>
                            <th>Hint</th>
                            <th style={{width: '150px'}}>Actions</th>
                          </tr>
                          </thead>
                          <tbody>
                          {categoryWords.map(word => (
                              <tr key={word.word}>
                                <td>{word.word}</td>
                                <td>{word.hint}</td>
                                <td>
                                  <button
                                      className="btn btn-sm btn-warning me-2"
                                      onClick={() => handleEdit(word)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleDelete(word.word)}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

// About Page
function AboutPage({ navigateTo }) {
  return (
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">About</h2>

              <div className="text-center mb-4">
                <h4>Word Guessing Game</h4>
                <p className="text-muted">A fun and educational word guessing game built with React and Spring Boot</p>
              </div>

              <div className="mb-4">
                <h5>How to Play:</h5>
                <ol>
                  <li>Choose a unique nickname and select a category</li>
                  <li>Guess letters or the entire word</li>
                  <li>Use hints if you're stuck (but it will reduce your score)</li>
                  <li>Complete the word as quickly as possible with fewer attempts</li>
                  <li>Check your ranking on the leaderboard!</li>
                </ol>
              </div>

              <div className="mb-4">
                <h5>Scoring System:</h5>
                <ul>
                  <li>Base score: 1000 points</li>
                  <li>-1 point per second</li>
                  <li>-50 points per wrong attempt</li>
                  <li>-200 points for using hint</li>
                </ul>
              </div>

              <div className="text-center">
                <h5>Developers</h5>
                <p>Student Name 1 - ID: 123456789</p>
                <p>Student Name 2 - ID: 987654321</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default App;