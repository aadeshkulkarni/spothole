# Pothole Portal - Technical Specification & Functional Scope

## 1. Vision & Mission

**Vision:** To create a transparent and collaborative platform that connects citizens and government authorities to efficiently identify and resolve public infrastructure issues like potholes, fostering civic engagement and improving road safety across India.

**Mission:** To build an accessible, intuitive, and multi-lingual web application where citizens can easily report infrastructure problems, and government bodies can receive, track, and act on these reports in a timely manner, ultimately making our public spaces better and safer.

---

## 2. User Roles & Stories

We will have three primary user roles:

1.  **Citizen (Unauthenticated/Authenticated):** Any member of the public.
2.  **Authority:** A verified representative from a government body or municipal corporation.
3.  **Admin:** A superuser who manages the platform.

### Citizen User Stories

-   **As a citizen, I want to** visit the website and immediately see a map of reported potholes in my area without needing to sign up.
-   **As a citizen, I want to** sign in easily using my Google account to be able to report a pothole.
-   **As a citizen, I want to** easily report a new pothole by uploading a photo/video and having the location automatically detected from my device.
-   **As a citizen, I want to** earn points and badges for my reports to feel recognized for my civic contributions (Gamification).
-   **As a citizen, I want to** view the status of any reported pothole (e.g., `Reported`, `Work in Progress`, `Resolved`).
-   **As a citizen, I want to** use the application in my preferred language from a selection of major Indian languages.
-   **As a citizen, I want to** see a heatmap to quickly understand which areas have the highest concentration of problems.

### Authority User Stories

-   **As an authority, I want to** log in to a secure dashboard specific to my designated jurisdiction (e.g., a specific city or district).
-   **As an authority, I want to** see a list and map view of all pending pothole reports in my area.
-   **As an authority, I want to** update the status of a report to keep citizens informed of progress.
-   **As an authority, I want to** add official comments or photos (e.g., a picture of the repaired road).
-   **As an authority, I want to** access simple analytics, such as the number of reports received vs. resolved in a given period.

### Admin User Stories

-   **As an admin, I want to** manage the platform, including verifying and creating accounts for new authorities.
-   **As an admin, I want to** define and manage geographical jurisdictions for the authorities.
-   **As an admin, I want to** have the ability to moderate content, removing spam or inappropriate reports.

---

## 3. System Flowchart

Here is a simplified flowchart of the core user journeys.

### Citizen Reporting Flow

```
[Start] --> [Open Web App] --> [View Pothole Map]
   |
   '--> [Click "Report Pothole"] --> [Grant Location Permission]
                                       |
                                       '--> [Capture/Upload Photo/Video] --> [Add Optional Details] --> [Submit]
                                                                                                        |
                                                                                                        '--> [Report appears on map with "Reported" status]
                                                                                                        |
                                                                                                        '--> [User receives points/acknowledgement] --> [End]
```

### Authority Workflow

```
[Start] --> [Log In to Dashboard] --> [View New Reports in Jurisdiction]
   |
   '--> [Select a Report] --> [Review Details & Photo]
                                |
                                '--> [Update Status (e.g., "In Progress")] --> [Add Notes/Proof of Work] --> [Save Update]
                                                                                                              |
                                                                                                              '--> [Status is updated publicly on the main map] --> [End]
```

---

## 4. Proposed Technology Stack

This stack is chosen for rapid development, scalability, and a rich, modern user experience.

-   **Frontend:** **Next.js (React Framework)** with TypeScript for a fast, server-rendered, and scalable user interface.
-   **Styling:** **Tailwind CSS** for a utility-first approach to design, enabling rapid and consistent styling.
-   **Mapping:** **Leaflet** with **OpenStreetMap** for a powerful, open-source, and free mapping solution. We will use `react-leaflet` for integration.
-   **Backend:** **Node.js** with **Express.js** and TypeScript, providing a robust and efficient API.
-   **Database:** **MongoDB** with **Mongoose ODM**. Its document-based structure is perfect for storing report data, and it has powerful geospatial query capabilities.
-   **Cloud Storage:** **AWS S3** for storing user-uploaded images and videos securely and efficiently.
-   **Authentication:** **NextAuth.js** for handling user authentication, starting with Google SSO for simplicity and ease of use.
-   **Internationalization (i18n):** `next-intl` to handle multi-language support seamlessly within Next.js.

---

## 5. Development Roadmap (Phased Approach)

We will build the application in phases to ensure we can launch a useful product quickly and iterate based on feedback.

### Phase 1: MVP (Minimum Viable Product)

The goal of the MVP is to get the core reporting functionality into the hands of citizens as quickly as possible.

-   **Features:**
    -   Public-facing map to view all reported potholes.
    -   Citizen reporting via Google SSO authenticated accounts (Image and Geolocation are mandatory).
    -   A simple, manually updated status system (`Reported`, `Resolved`).
    -   The entire application will be in English only for the MVP.
    -   Basic UI for mobile and desktop.

### Phase 2: User Engagement & Authority Tools

-   **Features:**
    -   Citizen user accounts (sign up, log in, view my reports).
    -   Gamification system (points for reporting, leaderboards).
    -   Authority user role with a secure login.
    -   Authority dashboard to view and update the status of reports within their jurisdiction.
    -   Advanced filtering for citizens (by status, date).

### Phase 3: Polish & Scale

-   **Features:**
    -   Full multi-language support for major Indian languages.
    -   Heatmap visualization.
    -   Admin dashboard for platform management.
    -   Analytics and reporting for authorities.
    -   Improved content moderation tools.
