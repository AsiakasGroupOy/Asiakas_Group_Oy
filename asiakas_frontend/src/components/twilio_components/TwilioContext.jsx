import { createContext, useContext } from "react";

export const TwilioContext = createContext();
export const useTwilio = () => useContext(TwilioContext);
