# Requirements Document

## Introduction

The Structured Learning Path feature provides a guided, curriculum-based learning mode for MicroTrainer. Students can select a technology (Python, Java, JavaScript, Django, React, Node.js, etc.) and follow a predefined sequence of concepts from beginner to advanced levels. The system teaches each concept adaptively, assesses understanding through cross-questions, and enforces a 60% comprehension threshold before allowing progression to the next concept. This feature complements the existing free-form "Ask Anything" chat mode by offering structured, goal-oriented learning paths.

## Glossary

- **Student**: A user who is learning through the MicroTrainer platform
- **Technology**: A programming language or framework (e.g., Python, Java, JavaScript, Django, React, Node.js)
- **Concept**: A discrete learning unit within a technology curriculum (e.g., Variables, Functions, OOP)
- **Curriculum**: The ordered list of concepts for a specific technology
- **Understanding_Percentage**: A numerical score (0-100%) representing the student's comprehension of a concept
- **Comprehension_Threshold**: The minimum understanding percentage (60%) required to progress to the next concept
- **Adaptive_Teaching_System**: The existing system that adjusts teaching content based on student level (Beginner/Intermediate/Advanced)
- **Cross_Question**: A question asked by the system to assess student understanding of a concept
- **Learning_Path_System**: The system component that manages structured learning paths
- **Progress_Tracker**: The component that records and persists student progress through concepts
- **Assessment_Engine**: The component that evaluates student understanding based on responses
- **Course**: The complete set of concepts for a technology
- **Teaching_Session**: An interaction where the system teaches a concept and assesses understanding

## Requirements

### Requirement 1: Technology Selection

**User Story:** As a student, I want to select a technology to learn, so that I can follow a structured curriculum for that technology.

#### Acceptance Criteria

1. THE Learning_Path_System SHALL provide a list of available technologies including Python, Java, JavaScript, Django, React, and Node.js
2. WHEN a student selects a technology, THE Learning_Path_System SHALL load the curriculum for that technology
3. WHEN a student selects a technology, THE Learning_Path_System SHALL retrieve the student's progress for that technology
4. THE Learning_Path_System SHALL display the total number of concepts in the selected technology's curriculum

### Requirement 2: Curriculum Structure

**User Story:** As a student, I want each technology to have a structured list of concepts, so that I can learn in a logical progression from beginner to advanced topics.

#### Acceptance Criteria

1. THE Learning_Path_System SHALL store a curriculum for each technology containing an ordered list of concepts
2. THE Learning_Path_System SHALL order concepts from beginner to advanced within each curriculum
3. THE Learning_Path_System SHALL store a title for each concept
4. THE Learning_Path_System SHALL store a description for each concept
5. THE Learning_Path_System SHALL store learning objectives for each concept
6. THE Learning_Path_System SHALL store teaching content for each concept that adapts based on student level

### Requirement 3: Sequential Learning Enforcement

**User Story:** As a student, I want to complete concepts in order, so that I build foundational knowledge before advancing to complex topics.

#### Acceptance Criteria

1. WHEN a student starts a new technology, THE Learning_Path_System SHALL set the first concept as the current concept
2. THE Learning_Path_System SHALL prevent students from accessing concepts beyond the current concept
3. WHEN a student completes the current concept, THE Learning_Path_System SHALL unlock the next concept in the curriculum
4. THE Learning_Path_System SHALL allow students to review previously completed concepts

### Requirement 4: Concept Teaching Process

**User Story:** As a student, I want the system to teach me each concept adaptively, so that the content matches my skill level.

#### Acceptance Criteria

1. WHEN a student begins a concept, THE Learning_Path_System SHALL use the Adaptive_Teaching_System to present teaching content
2. THE Learning_Path_System SHALL adjust teaching content based on the student's current level (Beginner, Intermediate, or Advanced)
3. WHEN teaching a concept, THE Learning_Path_System SHALL ask cross-questions to check understanding
4. THE Learning_Path_System SHALL collect student responses to cross-questions for assessment

### Requirement 5: Understanding Assessment

**User Story:** As a student, I want my understanding to be assessed accurately, so that I only progress when I have sufficient comprehension.

#### Acceptance Criteria

1. WHEN a student completes cross-questions for a concept, THE Assessment_Engine SHALL calculate an Understanding_Percentage
2. THE Assessment_Engine SHALL base the Understanding_Percentage on correctness of answers to cross-questions
3. THE Assessment_Engine SHALL base the Understanding_Percentage on depth of understanding shown in responses
4. THE Assessment_Engine SHALL base the Understanding_Percentage on the student's ability to explain the concept
5. THE Assessment_Engine SHALL store the Understanding_Percentage for each concept attempt

### Requirement 6: Progression Threshold

**User Story:** As a student, I want to progress to the next concept only when I understand the current one, so that I don't advance with knowledge gaps.

#### Acceptance Criteria

1. WHEN the Understanding_Percentage is greater than or equal to 60%, THE Learning_Path_System SHALL mark the concept as completed
2. WHEN the Understanding_Percentage is greater than or equal to 60%, THE Learning_Path_System SHALL unlock the next concept
3. WHEN the Understanding_Percentage is less than 60%, THE Learning_Path_System SHALL initiate re-teaching for the current concept
4. THE Learning_Path_System SHALL use the Comprehension_Threshold value of 60% for all progression decisions

### Requirement 7: Re-teaching Logic

**User Story:** As a student, I want the system to re-teach concepts I don't understand, so that I can master the material before moving forward.

#### Acceptance Criteria

1. WHEN the Understanding_Percentage is less than 60%, THE Learning_Path_System SHALL re-explain the concept using different teaching approaches
2. THE Learning_Path_System SHALL use different examples when re-teaching a concept
3. THE Learning_Path_System SHALL use different analogies when re-teaching a concept
4. THE Learning_Path_System SHALL ask different cross-questions during re-teaching
5. WHEN re-teaching is complete, THE Assessment_Engine SHALL reassess the student's understanding
6. THE Learning_Path_System SHALL repeat the re-teaching process until the Understanding_Percentage reaches 60% or higher

### Requirement 8: Progress Tracking and Persistence

**User Story:** As a student, I want my progress to be saved, so that I can resume learning where I left off.

#### Acceptance Criteria

1. THE Progress_Tracker SHALL record which concepts are completed for each technology
2. THE Progress_Tracker SHALL record the Understanding_Percentage for each completed concept
3. THE Progress_Tracker SHALL record the current concept for each technology
4. THE Progress_Tracker SHALL persist progress data across sessions
5. WHEN a student returns to a technology, THE Learning_Path_System SHALL restore the student's progress
6. THE Progress_Tracker SHALL calculate and store the number of completed concepts for each technology
7. THE Progress_Tracker SHALL calculate and store the total number of concepts for each technology

### Requirement 9: Progress Visualization

**User Story:** As a student, I want to see my progress through a course, so that I can track my learning journey.

#### Acceptance Criteria

1. THE Learning_Path_System SHALL display the current concept number and total concept count
2. THE Learning_Path_System SHALL display a progress indicator showing percentage of course completion
3. THE Learning_Path_System SHALL display completed concepts with a visual indicator
4. THE Learning_Path_System SHALL display the current concept with a visual indicator
5. THE Learning_Path_System SHALL display locked concepts with a visual indicator
6. THE Learning_Path_System SHALL display the Understanding_Percentage for each completed concept

### Requirement 10: Course Completion

**User Story:** As a student, I want to receive recognition when I complete a course, so that I feel accomplished and can demonstrate my learning.

#### Acceptance Criteria

1. WHEN all concepts in a technology are completed, THE Learning_Path_System SHALL mark the course as complete
2. WHEN a course is marked complete, THE Learning_Path_System SHALL award a certificate or badge to the student
3. WHEN a course is marked complete, THE Learning_Path_System SHALL calculate an overall mastery score
4. THE Learning_Path_System SHALL base the overall mastery score on the Understanding_Percentage values of all concepts
5. THE Learning_Path_System SHALL store course completion status in the student's profile

### Requirement 11: User Interface - Learning Mode Selection

**User Story:** As a student, I want to choose between free-form chat and guided courses, so that I can select the learning style that suits my needs.

#### Acceptance Criteria

1. THE Learning_Path_System SHALL provide two learning modes on the Learn page: "Ask Anything" and "Guided Course"
2. WHEN a student selects "Ask Anything", THE Learning_Path_System SHALL activate the existing free-form chat interface
3. WHEN a student selects "Guided Course", THE Learning_Path_System SHALL display the technology selection screen
4. THE Learning_Path_System SHALL persist the student's last selected learning mode

### Requirement 12: User Interface - Technology Selection Screen

**User Story:** As a student, I want to see available technologies and my progress, so that I can choose what to learn or resume.

#### Acceptance Criteria

1. THE Learning_Path_System SHALL display all available technologies on the technology selection screen
2. THE Learning_Path_System SHALL display the number of completed concepts for each technology
3. THE Learning_Path_System SHALL display the total number of concepts for each technology
4. THE Learning_Path_System SHALL display a progress percentage for each technology
5. THE Learning_Path_System SHALL display a visual indicator for technologies with in-progress courses
6. THE Learning_Path_System SHALL display a visual indicator for completed courses

### Requirement 13: User Interface - Concept List View

**User Story:** As a student, I want to see the list of concepts in a course, so that I understand the curriculum structure and my position within it.

#### Acceptance Criteria

1. THE Learning_Path_System SHALL display the ordered list of concepts for the selected technology
2. THE Learning_Path_System SHALL display the title for each concept
3. THE Learning_Path_System SHALL display the description for each concept
4. THE Learning_Path_System SHALL visually distinguish completed concepts from incomplete concepts
5. THE Learning_Path_System SHALL visually distinguish the current concept from other concepts
6. THE Learning_Path_System SHALL visually distinguish locked concepts from accessible concepts
7. WHEN a student selects a completed concept, THE Learning_Path_System SHALL allow review of that concept
8. WHEN a student selects the current concept, THE Learning_Path_System SHALL start the teaching session
9. WHEN a student selects a locked concept, THE Learning_Path_System SHALL display a message indicating the concept is not yet accessible

### Requirement 14: User Interface - Teaching Interface

**User Story:** As a student, I want a clear teaching interface, so that I can focus on learning the current concept.

#### Acceptance Criteria

1. THE Learning_Path_System SHALL display the current concept title during a teaching session
2. THE Learning_Path_System SHALL display the current concept number and total concept count during a teaching session
3. THE Learning_Path_System SHALL display a progress indicator showing position within the course
4. THE Learning_Path_System SHALL use a chat-based interface similar to the existing Learn page
5. THE Learning_Path_System SHALL display teaching content from the Adaptive_Teaching_System
6. THE Learning_Path_System SHALL display cross-questions during the teaching session
7. THE Learning_Path_System SHALL provide an input field for student responses

### Requirement 15: User Interface - Progress Dashboard

**User Story:** As a student, I want to see an overview of my progress across all technologies, so that I can track my overall learning achievements.

#### Acceptance Criteria

1. THE Learning_Path_System SHALL provide a progress dashboard showing all technologies
2. THE Learning_Path_System SHALL display the completion percentage for each technology on the dashboard
3. THE Learning_Path_System SHALL display the number of completed courses on the dashboard
4. THE Learning_Path_System SHALL display earned certificates and badges on the dashboard
5. THE Learning_Path_System SHALL display the overall mastery score for completed courses on the dashboard

### Requirement 16: Integration with Adaptive Teaching System

**User Story:** As a student, I want the structured learning path to use adaptive teaching, so that content matches my skill level.

#### Acceptance Criteria

1. THE Learning_Path_System SHALL use the existing Adaptive_Teaching_System for content delivery
2. THE Learning_Path_System SHALL pass the student's current level (Beginner, Intermediate, or Advanced) to the Adaptive_Teaching_System
3. THE Learning_Path_System SHALL pass the concept content to the Adaptive_Teaching_System for adaptation
4. THE Adaptive_Teaching_System SHALL return adapted teaching content based on the student's level

### Requirement 17: Integration with Student Profile

**User Story:** As a student, I want my course completions tracked in my profile, so that my achievements are recorded.

#### Acceptance Criteria

1. THE Learning_Path_System SHALL store course completion data in the student's profile
2. THE Learning_Path_System SHALL store earned certificates and badges in the student's profile
3. THE Learning_Path_System SHALL store overall mastery scores in the student's profile
4. WHEN a student views their profile, THE Learning_Path_System SHALL display completed courses
5. WHEN a student views their profile, THE Learning_Path_System SHALL display earned certificates and badges
