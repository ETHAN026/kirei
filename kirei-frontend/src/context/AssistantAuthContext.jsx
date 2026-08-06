import { createContext, useContext, useEffect, useState } from 'react';
import * as assistantApi from '../api/assistant';

const AssistantAuthContext = createContext(null);

export function AssistantAuthProvider({ children }) {
  const [assistant, setAssistant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kirei_assistant_token');
    if (!token) {
      setLoading(false);
      return;
    }
    assistantApi
      .assistantMe()
      .then(setAssistant)
      .catch(() => localStorage.removeItem('kirei_assistant_token'))
      .finally(() => setLoading(false));
  }, []);

  async function signIn(email, password) {
    const { token, assistant } = await assistantApi.assistantLogin(email, password);
    localStorage.setItem('kirei_assistant_token', token);
    setAssistant(assistant);
    return assistant;
  }

  function signOut() {
    localStorage.removeItem('kirei_assistant_token');
    setAssistant(null);
  }

  return (
    <AssistantAuthContext.Provider value={{ assistant, loading, signIn, signOut }}>
      {children}
    </AssistantAuthContext.Provider>
  );
}

export function useAssistantAuth() {
  return useContext(AssistantAuthContext);
}
