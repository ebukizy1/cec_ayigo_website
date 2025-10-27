import { useEffect } from 'react';

// Extend the global Window interface to include df-messenger types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'df-messenger': any;
      'df-messenger-chat-bubble': any;
    }
  }
}

const Chatbot = () => {
  useEffect(() => {
    // Load Dialogflow CSS if not already loaded
    if (!document.querySelector('link[href*="df-messenger-default.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css';
      document.head.appendChild(link);
    }

    // Load Dialogflow script if not already loaded
    if (!document.querySelector('script[src*="df-messenger.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js';
      script.async = true;
      document.head.appendChild(script);
    }

    // Add custom styles
    if (!document.querySelector('#chatbot-styles')) {
      const style = document.createElement('style');
      style.id = 'chatbot-styles';
      style.textContent = `
        df-messenger {
          z-index: 999;
          position: fixed;
          --df-messenger-font-color: #000000;
          --df-messenger-font-family: Lato;
          --df-messenger-chat-background: #FCE8B2;
          --df-messenger-message-user-background: #d3e3fd;
          --df-messenger-message-bot-background: #fff;
          bottom: 16px;
          right: 16px;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <df-messenger
      location="us-central1"
      project-id="cec-ayigo-electrical-agen-plpy"
      agent-id="e24559b3-5f3d-4f94-8c9a-e70007b8c8c5"
      language-code="en"
      max-query-length="-1"
    >
      <df-messenger-chat-bubble chat-title="Ask Ayigo">
      </df-messenger-chat-bubble>
    </df-messenger>
  );
};

export default Chatbot;