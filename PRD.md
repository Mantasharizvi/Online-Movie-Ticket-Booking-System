# Product Requirements Document (PRD)
## Online Movie Ticket Booking System

### 1. Executive Summary
**Purpose**: One-page overview for the MCA Major Project: Online Movie Ticket Booking System.

#### Components:
- **Problem Statement**: Moviegoers face inconvenience waiting in long queues to purchase tickets and often miss out on preferred seats. Theater administrations lack automated, centralized systems for managing showtimes, seat allocation, and revenue tracking.
- **Proposed Solution**: A comprehensive web-based Online Movie Ticket Booking System featuring two main components: a User Panel for browsing movies and booking tickets, and an Admin Panel for comprehensive theater and system management.
- **Business Impact**: 
  - Increased ticket sales through 24/7 accessibility.
  - Enhanced user satisfaction with interactive seat selection.
  - Improved administrative efficiency in managing movies, screens, and bookings.
- **Timeline**: 12 weeks (Academic Project Timeline).
- **Resources Required**: 1-2 Student Developers, minimal hosting/cloud budget.
- **Success Metrics**: Functional seat-booking mechanism, successful end-to-end payment simulation (optional/dummy), and complete admin management CRUD operations.

### 2. Problem Definition

#### 2.1 Customer Problem
- **Who**: Target user personas include Moviegoers (Users) and Theater Managers (Admins).
- **What**: Need for an intuitive online platform to check movie schedules and book tickets, and a dashboard to manage theater operations.
- **When**: Anytime users want to plan a movie outing; daily operational management for admins.
- **Where**: Web browser (accessible via desktop and mobile).
- **Why**: Manual ticketing is slow, error-prone, and provides a poor customer experience.
- **Impact**: Loss of potential revenue and dissatisfaction among cinemagoers due to unoptimized manual processes.

#### 2.2 Market Opportunity
- **Market Size**: Academic project scope, simulating a medium-to-large local multiplex chain.
- **Growth Rate**: High demand for digitalization in local entertainment sectors.
- **Competition**: Existing giants like BookMyShow, Fandango. This project aims to replicate their core functionalities for educational demonstration.
- **Timing**: Aligns with the MCA major project submission deadlines.

### 3. Solution Overview

#### 3.1 Proposed Solution
- **High-Level Description**: A full-stack web application permitting users to register, view active movies, select specific showtimes, pick seats from an interactive layout, and generate a ticket. Admins can add/remove movies, manage screens, and view booking metrics.
- **Key Capabilities**: Interactive seat layout mapping, role-based access control (Admin vs User), PDF/Email ticket generation, and real-time seat availability updates.
- **User Journey**: 
  - **User**: Lands on homepage → Views current movies → Selects movie & showtime → Chooses seats → Completes booking → Receives e-ticket.
  - **Admin**: Logs in → Views dashboard metrics → Adds new movie releases → Schedules shows → Manages users and bookings.

#### 3.2 In Scope
- **User Panel**: Registration/Login, Browse Movies, Search/Filter, View Movie Details/Trailers, Select Showtime, Interactive Seat Booking, Booking History, Profile Management.
- **Admin Panel**: Secure Login, Dashboard Analytics (Total Sales, Bookings), Manage Movies (CRUD), Manage Theaters/Screens, Manage Showtimes, View All Bookings, Manage Users.

#### 3.3 Out of Scope
- Integration with real Payment Gateways (will use simulated/dummy payment flow).
- Mobile application (iOS/Android native apps).
- Complex promotional offers or loyalty reward systems.

#### 3.4 MVP Definition
- **Core Features**: Dual panels (Admin/User), Movie CRUD, Show scheduling, Interactive seat selection, and basic ticket summary generation.
- **Success Criteria**: A user can successfully book a seat which instantly becomes unavailable to other users. Admins can successfully list a new movie.

### 4. User Stories & Requirements

#### 4.1 User Stories
**User Panel:**
```text
As a User, I strongly want to browse currently running and upcoming movies so that I can decide what to watch.
As a User, I want to select specific seats from a visual layout so that I get my preferred viewing angle.
As a User, I want to view my past and current bookings so that I can keep track of my tickets.
```

**Admin Panel:**
```text
As an Admin, I want to add new movies with posters, synopses, and cast details so that users have up-to-date choices.
As an Admin, I want to schedule showtimes for different screens so that users can book slots accordingly.
As an Admin, I want to view total revenue and daily bookings to monitor business performance.
```

#### 4.2 Functional Requirements
| ID | Requirement | Priority | Notes |
|----|------------|----------|-------|
| FR1 | User Authentication & Authorization (Role-based) | P0 | Crucial for Admin vs User |
| FR2 | Interactive Seat Selection Interface | P0 | Core feature |
| FR3 | Movie & Show CRUD Operations | P0 | Admin capability |
| FR4 | Search and Filter Movies by Genre/Language | P1 | Better UX |
| FR5 | Dummy Payment Integration | P1 | Complete booking flow |
| FR6 | Ticket Generation/Download (PDF format) | P2 | Nice to have |

#### 4.3 Non-Functional Requirements
- **Performance**: Seat locking mechanism must respond in < 1s to prevent double-booking.
- **Security**: Passwords must be hashed; API endpoints must be protected by JWT or session auth.
- **Usability**: Responsive design for clear seat selection on smaller screens.

### 5. Design & User Experience

#### 5.1 Design Principles
- **Clarity**: Movies and showtimes must be heavily visual and easy to scan.
- **Feedback**: Immediate visual feedback when a seat is selected, booked, or unavailable.
- **Simplicity**: The checkout flow should require minimal clicks.

#### 5.2 Information Architecture
- **User**: Home | Movies | Theaters | My Bookings | Profile
- **Admin**: Dashboard | Movies Management | Screens & Shows | Bookings Log | Users

### 6. Technical Specifications

#### 6.1 Architecture Overview
- Client-Server Architecture utilizing the **MERN Stack**:
  - **Frontend (Client)**: React.js (for dynamic, interactive user interfaces like seat selection).
  - **Backend (Server)**: Node.js with Express.js (RESTful API development).
  - **Database**: MongoDB (NoSQL database for flexible document storage of movies, theatres, and bookings).
- MVC (Model-View-Controller) pattern for backend logic.

#### 6.2 Data Flow (Seat Booking)
User requests seats -> Server checks concurrent availability -> Server temporarily locks seats -> User confirms payment -> Server finalizes booking -> Database updated.

#### 6.3 Project Folder Structure
```text
online_movie_ticket_booking_system/
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # Logic for routes (e.g., bookingController.js)
│   │   ├── models/         # Mongoose Schemas (Movie, User, Theater, Booking)
│   │   ├── routes/         # API Endpoints
│   │   ├── middleware/     # Auth (JWT) and Error handling
│   │   ├── config/         # Database connection (MongoDB)
│   │   └── server.js       # Entry point
│   └── .env                # Port, Mongo URI, JWT Secret
├── frontend/               # React (Vite) or Next.js
│   ├── public/
│   ├── src/
│   │   ├── assets/         # Images, global CSS
│   │   ├── components/     # Reusable UI (Button, Input, MovieCard)
│   │   ├── features/       # Specialized logic (SeatSelection, Payment)
│   │   ├── hooks/          # Custom hooks (useAuth, useFetch)
│   │   ├── services/       # API calls using Axios or Fetch
│   │   ├── store/          # Global state (Redux Toolkit or Context API)
│   │   └── App.js/page.js
└── package.json            # Root scripts to run both apps
```

### 7. Timeline & Milestones (Proposed)
| Milestone | Deliverables |
|-----------|--------------|
| Week 1-2 | Requirements Gathering & UI/UX Wireframing |
| Week 3-4 | Database Design & Backend Setup (Authentication) |
| Week 5-6 | Admin Panel Development (Movie/Show CRUD) |
| Week 7-8 | User Panel Development & Seat Selection UI |
| Week 9-10 | Integration, Booking Flow & Payment Simulation |
| Week 11-12| Testing, Bug Fixing, and Final Project Presentation |

### 8. Team & Resources
- **Developer(s)**: [Student Name]
- **Role**: Full-Stack Development, Database Design, Testing.
