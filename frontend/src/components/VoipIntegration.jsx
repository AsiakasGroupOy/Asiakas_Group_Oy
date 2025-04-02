import React, { useEffect } from 'react';
import { initVoIP } from '../services/voipService';

const VoipIntegration = () => {
  useEffect(() => {
    initVoIP();
  }, []);

  return <div>VoIP Integration Initialized.</div>;
};

export default VoipIntegration;
