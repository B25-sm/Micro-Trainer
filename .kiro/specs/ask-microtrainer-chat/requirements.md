# Requirements Document: Ask MicroTrainer Chat Feature

## Introduction

The Ask MicroTrainer Chat feature enables students to interact with an AI assistant directly from the Home page before starting interviews. Students can ask questions about interview topics, technical concepts, career guidance, and platform functionality. The feature transforms the existing non-functional input box into a fully interactive chat interface that provides contextual, helpful responses to guide students in their learning journey.

## Glossary

- **Chat_Interface**: The UI component on the Home page containing the input box, send button, and response display area
- **AI_Assistant**: The GROQ-powered backend service that processes student questions and generates responses
- **Student**: A user of the MicroTrainer platform seeking interview preparation and learning assistance
- **Response_Display**: The UI component that renders AI-generated responses below the input box
- **Session**: A conversation context maintained between the student and AI_Assistant for follow-up questions
- **GROQ_API**: The external AI service (llama-3.1-8b-instant model) used to generate responses
- **Interview_Type**: One of the available interview categories (MERN Stack, Java Full Stack, Python Full Stack, React, JavaScript, Java, Python, SQL, Node.js, Angular, TypeScript, Problem Solving & DSA)
- **Error_State**: A condition where the system cannot process a request due to network failure, API timeout, or rate limiting
- **Markdown_Content**: Text formatted with markdown syntax (headings, lists, code blocks, bold, italic)

## Requirements

### Requirement 1: Chat Input Functionality

**User Story:** As a student, I want to type questions in the "Ask MicroTrainer" input box, so that I can get help before starting an interview.

#### Acceptance Criteria

1. THE Chat_Interface SHALL accept text input of up to 500 characters
2. WHEN a Student types in the input box, THE Chat_Interface SHALL display the character count
3. WHEN a Student presses Enter key, THE Chat_Interface SHALL submit the question
4. WHEN a Student clicks the send button, THE Chat_Interface SHALL submit the question
5. WHEN the input box is empty, THE Chat_Interface SHALL disable the send button
6. WHEN a question is submitted, THE Chat_Interface SHALL clear the input box
7. WHEN a question is submitted, THE Chat_Interface SHALL display a loading indicator

### Requirement 2: AI Response Generation

**User Story:** As a student, I want to receive helpful AI-generated responses to my questions, so that I can learn and prepare effectively.

#### Acceptance Criteria

1. WHEN a Student submits a question, THE AI_Assistant SHALL generate a response within 5 seconds
2. THE AI_Assistant SHALL generate responses between 50 and 500 words in length
3. THE AI_Assistant SHALL provide context-aware responses based on available Interview_Types
4. WHEN a question relates to a specific Interview_Type, THE AI_Assistant SHALL reference that interview category in the response
5. WHEN a question is about platform functionality, THE AI_Assistant SHALL provide accurate information about MicroTrainer features
6. THE AI_Assistant SHALL format responses using Markdown_Content syntax
7. THE AI_Assistant SHALL encourage students to start relevant interviews when appropriate

### Requirement 3: Response Display

**User Story:** As a student, I want to see AI responses displayed clearly below the input box, so that I can read and understand the information.

#### Acceptance Criteria

1. WHEN a response is received, THE Response_Display SHALL render the response below the input box
2. THE Response_Display SHALL render Markdown_Content with proper formatting (headings, lists, code blocks, emphasis)
3. THE Response_Display SHALL display responses with readable typography (minimum 14px font size, 1.6 line height)
4. THE Response_Display SHALL support scrolling when responses exceed viewport height
5. WHEN multiple questions are asked, THE Response_Display SHALL show the conversation history
6. THE Response_Display SHALL distinguish between student questions and AI responses visually
7. THE Response_Display SHALL display timestamps for each message

### Requirement 4: Session Management

**User Story:** As a student, I want the AI to remember my previous questions in the conversation, so that I can ask follow-up questions naturally.

#### Acceptance Criteria

1. WHEN a Student submits the first question, THE Chat_Interface SHALL create a new Session
2. THE Chat_Interface SHALL maintain Session context for up to 10 message exchanges
3. WHEN a Student asks a follow-up question, THE AI_Assistant SHALL use Session history to provide contextual responses
4. WHEN a Student navigates away from the Home page, THE Chat_Interface SHALL preserve the Session for 30 minutes
5. WHEN a Student returns to the Home page within 30 minutes, THE Chat_Interface SHALL restore the previous Session
6. WHEN 30 minutes elapse without activity, THE Chat_Interface SHALL clear the Session

### Requirement 5: Error Handling

**User Story:** As a student, I want to see clear error messages when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. IF the GROQ_API does not respond within 5 seconds, THEN THE Chat_Interface SHALL display a timeout error message
2. IF the GROQ_API returns an error, THEN THE Chat_Interface SHALL display a user-friendly error message
3. IF the network connection fails, THEN THE Chat_Interface SHALL display a network error message
4. IF the GROQ_API rate limit is exceeded, THEN THE Chat_Interface SHALL display a rate limit message with retry guidance
5. WHEN an Error_State occurs, THE Chat_Interface SHALL allow the Student to retry the request
6. WHEN an Error_State occurs, THE Chat_Interface SHALL log the error details for debugging
7. THE Chat_Interface SHALL display error messages for 5 seconds before allowing dismissal

### Requirement 6: Question Type Handling

**User Story:** As a student, I want the AI to understand different types of questions, so that I receive relevant and helpful responses.

#### Acceptance Criteria

1. WHEN a Student asks about interview topics, THE AI_Assistant SHALL provide information about relevant Interview_Types and their coverage
2. WHEN a Student asks a technical learning question, THE AI_Assistant SHALL provide educational explanations with examples
3. WHEN a Student asks about career guidance, THE AI_Assistant SHALL provide advice related to the available Interview_Types
4. WHEN a Student asks about platform functionality, THE AI_Assistant SHALL explain MicroTrainer features (scoring, dashboard, interview flow)
5. WHEN a Student asks an off-topic question, THE AI_Assistant SHALL politely redirect to interview preparation topics
6. THE AI_Assistant SHALL detect question intent with at least 80% accuracy across question types

### Requirement 7: Mobile Responsiveness

**User Story:** As a student using a mobile device, I want the chat interface to work smoothly on my phone, so that I can ask questions anywhere.

#### Acceptance Criteria

1. THE Chat_Interface SHALL render correctly on screens with minimum width of 320px
2. THE Chat_Interface SHALL adjust input box height for mobile keyboards
3. THE Response_Display SHALL be scrollable on mobile devices
4. THE Chat_Interface SHALL support touch interactions (tap to send, swipe to scroll)
5. WHEN a mobile keyboard appears, THE Chat_Interface SHALL adjust viewport to keep input visible
6. THE Chat_Interface SHALL maintain readability on mobile devices (minimum 14px font size)

### Requirement 8: Accessibility

**User Story:** As a student using assistive technology, I want the chat interface to be accessible, so that I can use it effectively.

#### Acceptance Criteria

1. THE Chat_Interface SHALL provide ARIA labels for all interactive elements
2. THE Chat_Interface SHALL support keyboard navigation (Tab, Enter, Escape)
3. THE Chat_Interface SHALL announce loading states to screen readers
4. THE Chat_Interface SHALL announce new responses to screen readers
5. THE Chat_Interface SHALL maintain focus management during interactions
6. THE Chat_Interface SHALL provide sufficient color contrast (WCAG AA minimum 4.5:1 for text)
7. THE Response_Display SHALL support screen reader navigation through message history

### Requirement 9: Performance

**User Story:** As a student, I want the chat interface to respond quickly, so that I can get answers without waiting.

#### Acceptance Criteria

1. THE Chat_Interface SHALL render the initial UI within 100ms of page load
2. WHEN a Student types in the input box, THE Chat_Interface SHALL respond to keystrokes within 50ms
3. WHEN a response is received, THE Response_Display SHALL render the content within 200ms
4. THE Chat_Interface SHALL maintain smooth scrolling (60fps) when displaying long responses
5. THE Chat_Interface SHALL load conversation history within 500ms when restoring a Session

### Requirement 10: Integration with Existing Features

**User Story:** As a student, I want the chat feature to work seamlessly with the rest of the platform, so that I have a cohesive experience.

#### Acceptance Criteria

1. WHEN the AI_Assistant recommends an Interview_Type, THE Chat_Interface SHALL provide a clickable link to start that interview
2. WHEN a Student clicks a recommended interview link, THE Chat_Interface SHALL navigate to the interview page with the correct subject parameter
3. THE Chat_Interface SHALL use the existing GROQ_API integration from the backend
4. THE Chat_Interface SHALL maintain consistent styling with the existing Home page design (Tailwind CSS, color scheme, typography)
5. THE Chat_Interface SHALL preserve the existing decorative icons (pencil, plus, checkmark) or repurpose them functionally
6. WHEN a Student navigates to Dashboard or Trainer pages, THE Chat_Interface SHALL preserve the Session state

### Requirement 11: Content Quality

**User Story:** As a student, I want AI responses to be accurate and helpful, so that I can trust the information provided.

#### Acceptance Criteria

1. THE AI_Assistant SHALL provide factually accurate information about the 11 available Interview_Types
2. THE AI_Assistant SHALL avoid making promises about interview outcomes or job placement
3. THE AI_Assistant SHALL provide responses in a supportive and encouraging tone
4. THE AI_Assistant SHALL limit responses to 2-3 paragraphs for readability
5. WHEN providing code examples, THE AI_Assistant SHALL use proper syntax highlighting in Markdown_Content
6. THE AI_Assistant SHALL cite MicroTrainer features accurately (scoring system, adaptive teaching, problem solving)
7. WHEN uncertain about information, THE AI_Assistant SHALL acknowledge limitations rather than provide incorrect information

### Requirement 12: Rate Limiting and Resource Management

**User Story:** As a platform operator, I want to manage API usage responsibly, so that costs remain controlled and service remains available.

#### Acceptance Criteria

1. THE Chat_Interface SHALL limit students to 20 questions per Session
2. WHEN a Student reaches 20 questions, THE Chat_Interface SHALL display a message encouraging them to start an interview
3. THE Chat_Interface SHALL implement client-side request throttling (maximum 1 request per 2 seconds)
4. WHEN a Student submits questions too quickly, THE Chat_Interface SHALL queue requests and process them sequentially
5. THE AI_Assistant SHALL use the existing GROQ_API timeout configuration (10 seconds from api.js)
6. THE Chat_Interface SHALL cache Session data in browser localStorage to minimize server requests

## Notes

- The existing `/ask` endpoint in the backend supports adaptive teaching with session management and conversation history
- The backend already handles GROQ_API integration with error handling
- The Home page UI uses Framer Motion for animations and Tailwind CSS for styling
- The three decorative icons (pencil, plus, checkmark) can be repurposed or removed based on design decisions during implementation
- Consider adding analytics tracking for question types and response quality in future iterations
