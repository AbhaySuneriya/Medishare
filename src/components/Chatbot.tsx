// src/components/Chatbot.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// --- Configuration ---
// WARNING: API Key is exposed here! Move to backend in production!
const GEMINI_API_KEY = "AIzaSyBrths6zQF8ukVYj8T7E8KUetad7j1yHQ4";
const MODEL_NAME = "gemini-1.5-flash"; // Or "gemini-pro"

const DOCTOR_SYSTEM_PROMPT = `You are a highly knowledgeable doctor specializing in the medical field. Your role is to provide accurate, detailed, and professional information strictly related to medicine. Do not provide answers outside the scope of medical topics. Respond only to questions about diseases, treatments, medications, symptoms, diagnostics, medical procedures, and healthcare-related subjects. Avoid giving personal opinions, general advice, or information unrelated to medicine. If a question is outside this scope, politely state that you can only answer medical questions.`;
// --- End Configuration ---

// Initialize the Generative AI client (do this outside the component)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const generationConfig = {
  temperature: 0.7, // Adjust creativity (0-1)
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048, // Max length of response
};

// Safety settings - Adjust as needed, especially for medical context
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am a medical information assistant. How can I help you today?' } // Initial greeting
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState(null); // Stores the Gemini chat session
  const messagesEndRef = useRef(null); // Ref for scrolling

  // Initialize Chat Session when component mounts or chat opens
  // Using useCallback to memoize the function
  const initializeChat = useCallback(() => {
    if (GEMINI_API_KEY && !chatSession) { // Only initialize if key exists and no session yet
      console.log("Initializing Gemini Chat Session...");
      try {
        const model = genAI.getGenerativeModel({
          model: MODEL_NAME,
          systemInstruction: DOCTOR_SYSTEM_PROMPT, // Apply the persona here
        });
        const newChatSession = model.startChat({
          generationConfig,
          safetySettings,
          history: [], // Start with empty history for the session object
                       // The system prompt is handled by the model config
        });
        setChatSession(newChatSession);
        console.log("Gemini Chat Session Initialized.");
      } catch (error) {
        console.error("Error initializing Gemini chat:", error);
        setMessages(prev => [...prev, {sender: 'bot', text: "Error: Could not initialize the chat bot."}]);
      }
    }
  }, [chatSession]); // Dependency: re-run if chatSession changes (e.g., becomes null)

  // Effect to initialize chat when it opens for the first time
   useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
    // Optional: Clean up or reset chat session when component unmounts or closes
    // return () => { if (!isOpen) setChatSession(null); } // Example reset on close
   }, [isOpen, initializeChat]);


  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom whenever messages change and chat is open
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isLoading || !chatSession) return; // Need input, not loading, and chat initialized

    const newUserMessage = { sender: 'user', text: trimmedInput };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    console.log("Sending to Gemini:", trimmedInput);

    try {
        // Send message using the existing chat session
        const result = await chatSession.sendMessage(trimmedInput);
        const response = result.response;
        const botResponseText = response.text();

        console.log("Gemini Response:", botResponseText);

        // Check for safety blocks
        if (!botResponseText && response.promptFeedback?.blockReason) {
             console.warn("Gemini blocked response:", response.promptFeedback.blockReason);
             const blockedMessage = { sender: 'bot', text: `I cannot respond to that due to safety guidelines (${response.promptFeedback.blockReason}). Please ask a medical question.` };
             setMessages(prevMessages => [...prevMessages, blockedMessage]);
        } else {
            const newBotMessage = { sender: 'bot', text: botResponseText || "I received your message but didn't get a text response." };
            setMessages(prevMessages => [...prevMessages, newBotMessage]);
        }

    } catch (error) {
        console.error('Error fetching Gemini response:', error);
        const errorMessage = { sender: 'bot', text: `Error: ${error.message || 'Could not get a response from the bot.'}` };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessage(event);
    }
  };

  return (
    <>
      {/* Chat Icon/Button (Tailwind Styled) */}
      <button
        className="fixed bottom-5 right-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg cursor-pointer z-50 transition-colors duration-200 ease-in-out"
        onClick={toggleChat}
        aria-label={isOpen ? "Close Chat" : "Open Chat"}
      >
        {/* Simple Chat Icon Placeholder */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z" />
        </svg>
      </button>

      {/* Chat Window (Tailwind Styled) */}
      {isOpen && (
        <div className="fixed bottom-[90px] right-5 w-[350px] max-w-[90vw] h-[500px] max-h-[70vh] bg-white border border-gray-300 rounded-lg shadow-xl flex flex-col overflow-hidden z-50 font-sans">
          {/* Header */}
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex justify-between items-center flex-shrink-0">
            <h2 className="text-md font-semibold text-gray-800">Medical Assistant</h2>
            <button
                onClick={toggleChat}
                className="text-gray-500 hover:text-gray-800 text-2xl p-1 leading-none"
                aria-label="Close chat window"
            >
                ×
            </button>
          </div>

          {/* Message List */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`py-2 px-3 rounded-xl max-w-[80%] break-words text-sm leading-snug shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-lg'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-lg' // Slightly different bot style
                  }`}
                >
                  {/* Basic Markdown rendering could be added here if needed */}
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Loading indicator */}
            {isLoading && (
                 <div className="flex justify-start">
                    <div className="py-2 px-3 rounded-xl max-w-[80%] bg-gray-200 text-gray-500 italic rounded-bl-lg text-sm shadow-sm">
                        ... typing
                    </div>
                </div>
            )}
            {/* Dummy div to help scrolling */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-gray-100 flex items-center flex-shrink-0">
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask a medical question..."
              disabled={isLoading || !chatSession} // Disable if loading or chat not ready
              className="flex-grow px-4 py-2 border border-gray-300 rounded-full mr-2 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none text-sm"
              aria-label="Chat input"
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim() || !chatSession}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 ease-in-out text-sm"
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;