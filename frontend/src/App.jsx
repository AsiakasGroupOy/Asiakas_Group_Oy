import React from 'react';
import CallButton from './components/CallButton';
import CallList from './components/CallList';
import VoipIntegration from './components/VoipIntegration';
import NotesLogging from './components/NotesLogging';
import CalendarIntegration from './components/CalendarIntegration';

const App = () => (
  <div>
    <h1>VoIP System</h1>
    <VoipIntegration />
    <CallButton />
    <CallList />
    <NotesLogging />
    <CalendarIntegration />
  </div>
);

export default App;
