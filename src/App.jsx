import Navbar from './components/Navbar/Navbar.jsx'
import Footer from './components/Footer/Footer.jsx'
import Header from './components/Header/Header.jsx'
import { GlowingEffectDemo } from './components/GlowingEffectDemo.jsx'
import { AppleCardsCarouselDemo } from './components/ui/Applecards.jsx'
import { MacbookScrollDemo } from './components/ui/macbook-scroll-demo.jsx'
import Testimonials from './components/Testimonials.jsx'
import Login from './components/pages/Login.jsx'
import Signup from './components/pages/Signup.jsx'
import Profile from './components/pages/Profile.jsx'
import ProfileEdit from './components/pages/ProfileEdit.jsx'
import PostCreate from './components/pages/PostCreate.jsx'
import PublicProfile from './components/pages/PublicProfile.jsx'
import About from './components/pages/About.jsx'
import Courses from './components/pages/courses.jsx'
import CourseDetail from './components/pages/CourseDetail.jsx'
import CourseCreate from './components/pages/CourseCreate.jsx'
import Dashboard from './components/pages/dashboard.jsx'
import Challenges from './components/pages/challenges.jsx'
import ChallengeDetail from './components/pages/ChallengeDetail.jsx'
import Reels from './components/pages/reels.jsx'
import ReelsStudio from './components/pages/ReelsStudio.jsx'
import VR from './components/pages/VR.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Loading from './components/Loading.jsx'
import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import TrustedBy from './components/TrustedBy';

function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isHomePage && <Navbar />}
      <main className="flex-1">
        <Outlet />
        {isHomePage && (
          <>
            <Header />
            {/* Navbar after Header on homepage */}
            <Navbar />
            {/* Apple Cards Carousel Section - comes right after the hero */}
            <section className="w-full bg-white">
              <AppleCardsCarouselDemo />
            </section>
            
            {/* Macbook Scroll Section - below Apple Cards */}
            <section className="w-full bg-white">
              <MacbookScrollDemo />
            </section>
            
            {/* Testimonials Section (forced white bg) */}
            <div className="w-full bg-white">
            <Testimonials />
            </div>
            <div className="w-full bg-white">
            <TrustedBy />
            </div>
            {/* Glowing Effect Section */}
            <section className="w-full bg-white py-16">
              <GlowingEffectDemo />
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Home: Landing page with Header */}
          <Route index element={<div></div>} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
          <Route path="post/create" element={<ProtectedRoute><PostCreate /></ProtectedRoute>} />
          <Route path="u/:accountRef" element={<PublicProfile />} />
          <Route path="about" element={<About />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="courses/create" element={<CourseCreate />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="challenges/:id" element={<ChallengeDetail />} />
          <Route path="reels" element={<Reels />} />
          <Route path="reels/studio" element={<ReelsStudio />} />
          <Route path="vr" element={<VR />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="loading" element={<Loading />} />
          <Route path="*" element={<div className="text-center p-8"><h1>404 - Page Not Found</h1></div>} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App