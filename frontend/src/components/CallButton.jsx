import React from 'react';

const CallButton = () => {
  const handleCall = () => {
    alert('Initiating Call...');
  };

  return (
    <button onClick={handleCall}>Start Call</button>
  );
};

export default CallButton;
