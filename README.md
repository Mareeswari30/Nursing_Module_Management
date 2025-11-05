# Patient Care Record Management System


## Key Features

- **Patient Management**
  - Add new patients with details such as name, age, assigned nurse, room number, and care notes.
  - Edit patient care notes and room numbers directly in the table for quick updates.
  - Delete patient records with confirmation prompts.

- **Search Functionality**
  - Filter patients by name in real-time using a debounced search input.

- **Responsive and Interactive UI**
  - Clean and modern interface using **Material-UI (MUI)** components.
  - Editable table fields for a seamless update experience.
  - Modal dialog for adding new patients.
- **Therapy Management**
  - Schedule therapy sessions for patients, including therapy type, therapist, and timing.
  - Update therapy session status (Pending, In Progress, Completed) directly from the table.
- **Shift Planner**
  -Assign nurses to different shifts and manage their schedules efficiently.
  -View shifts in a tabular format with clear start and end times.
- **Vital Tracker**
   -Record and monitor patient vital signs such as temperature, blood pressure, heart rate, and oxygen levels.


## Technologies Used

- **Frontend:**
  - React (Functional Components, Hooks)
  - Material-UI (MUI) for UI components
  - Axios for HTTP requests

- **Backend:**
  - Node.js with Express
  - REST API endpoints for patient CRUD operations



## What I Did in This Project

1. **Designed the React frontend** to display a dynamic patient table with search, add, edit, and delete capabilities.
2. **Implemented CRUD operations** using Axios to communicate with the backend REST API.
3. **Created an editable table experience**, allowing in-place updates for room numbers and care notes.
4. **Added search and filter functionality** with debounced input for performance optimization.
5. **Handled API inconsistencies** by normalizing incoming patient data into a consistent format.
6. **Styled the UI using Material-UI**, creating a professional, modern, and intuitive interface.
7. **Setup version control with Git**, demonstrating workflow management and collaboration readiness.

---

## How to Run the Project

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mareeswari30/Nursing_Module_Management
   cd Patient-Care_Record
