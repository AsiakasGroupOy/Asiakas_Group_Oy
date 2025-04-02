import React, { createContext, useReducer } from 'react';

const CallContext = createContext();

const initialState = {
  calls: []
};

const callReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_CALL':
      return { ...state, calls: [...state.calls, action.payload] };
    default:
      return state;
  }
};

export const CallProvider = ({ children }) => {
  const [state, dispatch] = useReducer(callReducer, initialState);

  return (
    <CallContext.Provider value={{ state, dispatch }}>
      {children}
    </CallContext.Provider>
  );
};

export default CallContext;
