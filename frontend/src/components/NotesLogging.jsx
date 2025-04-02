import React, { useState } from 'react';
import { analyzeText } from '../services/api';

const NotesLogging = () => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    const result = await analyzeText(text);
    setAnalysis(result);
  };

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows="5" cols="50" />
      <button onClick={handleAnalyze}>Analyze Text</button>
      {analysis && (
        <div>
          <p>Length: {analysis.length}</p>
          <p>Uppercase Count: {analysis.uppercase_count}</p>
          <p>Word Count: {analysis.word_count}</p>
        </div>
      )}
    </div>
  );
};

export default NotesLogging;
