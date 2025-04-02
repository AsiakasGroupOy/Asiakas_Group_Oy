import React, { useEffect, useState } from 'react';
import axios from '../services/api';

const CallList = () => {
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    axios.get('/api/calls')
      .then(response => setCalls(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h2>Call List</h2>
      <ul>
        {calls.map(call => (
          <li key={call.id}>{call.name} - {call.timestamp}</li>
        ))}
      </ul>
    </div>
  );
};

export default CallList;
