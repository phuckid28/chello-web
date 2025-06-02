# Chello Web (Frontend)

## Project Description
The Chello Web is a Single-Page Application (SPA) built with React.js. It serves as the frontend for the Chello full-stack application, communicating with the backend API to manage and display user and post data.

## Technologies Used
- React.js (v18+)
- React Router DOM (routing)
- Axios (HTTP requests)
- Tailwind CSS (or CSS Modules/SCSS)
- State management (Redux Toolkit / Zustand / Context API) (if used)
- Form handling (Formik or React Hook Form)

## Setup and Installation

### Prerequisites
- Node.js (version ≥ 16.x)
- npm or Yarn
- Git

### 1. Clone the repository
```bash
git clone https://github.com/phuckid28/chello-web.git
cd chello-web
```

### 2. Install dependencies
Using npm:
```bash
npm install
```
Or using Yarn:
```bash
yarn install
```

### 3. Create environment file
If the frontend requires environment variables (e.g., API endpoint, Google OAuth credentials), create a `.env` file with:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=<your-google-client-id>
```
React only reads environment variables prefixed with `REACT_APP_`.

### 4. Run the application
- **Development**:
  ```bash
  npm start
  ```
  Or:
  ```bash
  yarn start
  ```
  The app will run at `http://localhost:3000`.
- **Production build**:
  ```bash
  npm run build
  ```

## Project Structure
```
chello-web/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/       # Reusable components (Navbar.js, Footer.js, PostCard.js)
│   ├── pages/            # Main pages (HomePage.js, LoginPage.js, RegisterPage.js, ProfilePage.js, PostDetailPage.js, CreateEditPostPage.js)
│   ├── hooks/            # Custom hooks (useAuth.js, useFetch.js)
│   ├── context/          # Context API or store (AuthContext.js, PostContext.js)
│   ├── services/         # API service functions (userService.js, postService.js)
│   ├── utils/            # Utility functions (formatDate.js, validateEmail.js)
│   ├── App.js            # Routing and layout setup
│   ├── index.js          # React entry point
│   └── index.css         # Global styles or Tailwind import
├── .env                  # Environment variables
├── package.json
└── tailwind.config.js    # If using Tailwind CSS
```

## Detailed Module Descriptions

- **`src/App.js`**
  ```jsx
  import { BrowserRouter, Routes, Route } from 'react-router-dom';
  import HomePage from './pages/HomePage';
  import LoginPage from './pages/LoginPage';
  import RegisterPage from './pages/RegisterPage';
  import ProfilePage from './pages/ProfilePage';
  import PostDetailPage from './pages/PostDetailPage';
  import CreateEditPostPage from './pages/CreateEditPostPage';
  import PrivateRoute from './components/PrivateRoute';

  function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/posts/create" element={<CreateEditPostPage />} />
            <Route path="/posts/edit/:id" element={<CreateEditPostPage />} />
          </Route>
          <Route path="/posts/:id" element={<PostDetailPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  export default App;
  ```

- **`src/services/userService.js`**
  ```js
  import axios from 'axios';

  const API_URL = process.env.REACT_APP_API_URL;

  export const register = async (userData) => {
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return response.data;
  };

  export const login = async (credentials) => {
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    localStorage.setItem('token', response.data.token);
    return response.data;
  };

  export const getProfile = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };
  ```

- **`src/pages/LoginPage.js`**
  - A form for entering `email` and `password`.
  - On submit, calls `login()` from `userService`, stores token in localStorage, and navigates to Home or Profile.

- **`src/pages/HomePage.js`**
  - Fetches posts with `postService.getAllPosts()` and displays them as a list or grid using `PostCard` components.

- **`src/pages/PostDetailPage.js`**
  - On mount, retrieves the post ID from `useParams()` and fetches post details with `postService.getPostById(id)`.

- **`src/components/Navbar.js`**
  - Displays logo, navigation links (Home, Login/Logout, Profile).
  - Checks authentication status (based on token or context). 
  - If authenticated, shows user dropdown and Logout; otherwise shows Login/Register links.

- **`src/components/PrivateRoute.js`**
  - Protects routes that require authentication. 
  - If no valid token, redirects to `/login`.

## Usage

1. **Running the Frontend**
   - Open a terminal, navigate to `chello-web`, install dependencies, configure `.env`, then run:
     ```bash
     npm start
     ```
   - The React app runs at `http://localhost:3000`.
   - Navigate to the homepage to view posts and handle user actions.

2. **Basic Flow**
   - **Register / Login**  
     - User submits credentials → Frontend calls `/api/users/register` or `/api/users/login` → Backend returns JWT → Frontend stores JWT and redirects.
   - **Viewing Posts**  
     - Frontend calls `GET /api/posts` → Backend returns posts → Frontend displays them using `PostCard`.
   - **Creating / Editing Posts**  
     - Authenticated users can access Create/Edit Post forms.  
     - On submit, calls `POST /api/posts` or `PUT /api/posts/:id` with JWT header.  
     - Backend validates, updates DB, returns post → Frontend shows success or redirects.
   - **Deleting Posts**  
     - If user is author or admin, Delete button is visible → calls `DELETE /api/posts/:id` with JWT.  
     - Backend deletes post → Frontend updates UI.
   - **Viewing Profile**  
     - Frontend calls `GET /api/users/profile` with JWT → Backend returns user data → Frontend displays it on Profile page.

3. **Error Handling**
   - **Backend**  
     - Errors are caught by `errorHandler` middleware and returned as JSON:
       ```json
       {
         "message": "Error message",
         "stack": "Stack trace (if not in production)"
       }
       ```
   - **Frontend**  
     - Use `try/catch` for API calls and display error messages via toast notifications or inline.

## Contribution Guidelines
1. Fork the repository.
2. Create a new branch: `git checkout -b feature/feature-name`.
3. Implement changes with clear commit messages.
4. Push to your branch: `git push origin feature/feature-name`.
5. Open a Pull Request against `main` or `master`.
6. Await review and merge.

## Contact
- **Author**: phuckid28
- **GitHub**: https://github.com/phuckid28
- **Email**: `<your_email>@domain.com`
