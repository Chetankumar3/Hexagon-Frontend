import { Home, Bell, LogOut, Menu, Calendar, Clock, ChevronDown, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import React, { useEffect, useMemo, useState } from 'react';
import API_CONFIG from '../../config/api';
import { TimelineDemo } from '../ui/timeline-demo';

function authHeaders() {
  const token =
    localStorage.getItem('hexagon_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function LearningDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentTab, setCurrentTab] = useState('in_progress');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [meRes, enrRes, crsRes] = await Promise.all([
          fetch(API_CONFIG.getApiUrl('/users/me'), { headers: { ...authHeaders() } }),
          fetch(API_CONFIG.getApiUrl('/enrollments/me'), { headers: { ...authHeaders() } }),
          fetch(API_CONFIG.getApiUrl('/courses')),
        ]);
        const meJ = meRes.ok ? await meRes.json() : null;
        const enr = enrRes.ok ? await enrRes.json() : [];
        const crs = crsRes.ok ? await crsRes.json() : [];
        if (!cancelled) {
          setMe(meJ);
          setEnrollments(Array.isArray(enr) ? enr : []);
          setAllCourses(Array.isArray(crs) ? crs : []);
        }
        // try load profile
        try {
          const accountId = meJ?._id || meJ?.id || meJ?.username;
          if (accountId) {
            const prRes = await fetch(API_CONFIG.getApiUrl(`/profiles?accountId=${encodeURIComponent(accountId)}`));
            const arr = prRes.ok ? await prRes.json() : [];
            if (!cancelled) setProfile(arr?.[0] || null);
          }
        } catch {
          // Ignore profile fetch errors
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true };
  }, []);

  const courses = useMemo(() => {
    const idToEnrollment = new Map(enrollments.map(e => [String(e.courseId), e]));
    return allCourses
      .filter(c => idToEnrollment.has(String(c._id)))
      .map(c => {
        const e = idToEnrollment.get(String(c._id));
        return {
          id: String(c._id),
          title: c.title,
          duration: c.duration,
          date: '',
          progress: 0,
          status: e?.status || 'enrolled',
        };
      });
  }, [enrollments, allCourses]);

  const counts = useMemo(() => {
    const total = courses.length;
    const completed = courses.filter(c => c.status === 'completed').length;
    const inProgress = courses.filter(c => c.status === 'enrolled').length;
    const assigned = inProgress;
    return { total, completed, inProgress, assigned };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (currentTab === 'completed') return courses.filter(c => c.status === 'completed');
    if (currentTab === 'assigned') return courses.filter(c => c.status === 'enrolled');
    return courses;
  }, [courses, currentTab]);

  const progressData = [
    { day: 'SAT', theory: 60, practice: 40 },
    { day: 'SUN', theory: 80, practice: 50 },
    { day: 'MON', theory: 90, practice: 70 },
    { day: 'TUE', theory: 85, practice: 65 },
    { day: 'WED', theory: 75, practice: 55 },
    { day: 'THU', theory: 80, practice: 60 },
    { day: 'FRI', theory: 95, practice: 75 },
  ];

  const challenges = [
    { id: 'h1', type: 'Hackathon', title: 'AI Build Sprint', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1200', duration: '48h' },
    { id: 'q1', type: 'Quiz', title: 'Web Security Quiz', image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?q=80&w=1200', duration: '30m' },
    { id: 'b1', type: 'Bounty', title: 'UI Bug Bounty', image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200', duration: '1w' },
  ];

  return (
    <div className="min-h-screen w-full bg-white flex justify-center">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Hello {profile?.displayName || me?.username || 'there'}!</h1>
                  <p className="text-gray-600 mb-1">Good to see you back!</p>
                  <p className="text-gray-400 text-sm">Your personalized learning overview</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-gray-700">{counts.inProgress}</span>
                    <div className="text-sm">
                      <div className="text-gray-600">Courses</div>
                      <div className="text-gray-400">In progress</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-gray-900">{counts.completed}</span>
                    <div className="text-sm">
                      <div className="text-gray-600">Courses</div>
                      <div className="text-gray-400">Completed</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-gray-500">{counts.assigned}</span>
                    <div className="text-sm">
                      <div className="text-gray-600">Courses</div>
                      <div className="text-gray-500">Assigned</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                      <circle cx="64" cy="64" r="56" stroke="#000000" strokeWidth="8" fill="none" strokeDasharray="351.86" strokeDashoffset="175.93" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">50%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">You have <span className="font-semibold">12</span> assigned courses</p>
                </div>
              </div>
            </div>


            {/* Course Tabs */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex gap-6 border-b mb-4">
                <button onClick={() => setCurrentTab('in_progress')} className={`pb-2 px-1 font-semibold ${currentTab === 'in_progress' ? 'text-gray-900 border-b-2 border-black' : 'text-gray-400'}`}>In progress</button>
                <button onClick={() => setCurrentTab('completed')} className={`pb-2 px-1 font-semibold ${currentTab === 'completed' ? 'text-gray-900 border-b-2 border-black' : 'text-gray-400'}`}>Completed</button>
                <button onClick={() => setCurrentTab('assigned')} className={`pb-2 px-1 font-semibold ${currentTab === 'assigned' ? 'text-gray-900 border-b-2 border-black' : 'text-gray-400'}`}>Assigned</button>
              </div>

              <div className="space-y-4">
                {(loading ? [] : filteredCourses).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <div className="text-2xl">💻</div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Dui nunc mat ut ...</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration || '—'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{course.date || ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                          <circle cx="32" cy="32" r="28" stroke="#000000" strokeWidth="4" fill="none" strokeDasharray="175.93" strokeDashoffset="35.19" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-900">{course.progress}%</span>
                        </div>
                      </div>
                      <button className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition">
                        <ArrowRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Career Path Advise */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Career Path Advise</h3>
                  <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Dui nunc mart et .....</p>
                </div>
                <div className="text-5xl">💡</div>
              </div>
              <button className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition">
                Explore
              </button>
            </div>

            {/* Your Progress */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Your Progress</h3>
                <button className="text-sm text-gray-400 flex items-center gap-1">
                  Select Course <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-4 mb-4">
                <button className="px-4 py-2 text-sm font-semibold text-gray-900 border-b-2 border-black">Day-wise</button>
                <button className="px-4 py-2 text-sm font-semibold text-gray-400">Achievements</button>
                <button className="px-4 py-2 text-sm font-semibold text-gray-400">Leaderboard</button>
              </div>
              <div className="flex items-end justify-between h-64 gap-4 mb-4">
                {progressData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full flex flex-col items-center gap-1 h-full justify-end">
                      <div className="w-full bg-gray-700 rounded-t" style={{ height: `${data.theory}%` }}></div>
                      <div className="w-full bg-black rounded-t" style={{ height: `${data.practice}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-400 mt-2">{data.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                  <span className="text-gray-600">Theory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-black rounded-full"></div>
                  <span className="text-gray-600">Practice</span>
                </div>
              </div>
            </div>

            {/* Upcoming Challenges */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Upcoming Challenges</h3>
                <Link to="/challenges" className="text-sm text-zinc-700 hover:underline">View all</Link>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {challenges.map((c) => (
                  <Link key={c.id} to={`/challenges/${c.id}`} className="flex items-center gap-4 p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition">
                    <img src={c.image} alt={c.title} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">{c.type}</div>
                      <div className="font-semibold text-gray-900 truncate">{c.title}</div>
                      <div className="text-xs text-zinc-600">Duration: {c.duration}</div>
                    </div>
                    <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Analysis Section */}
        <div className="w-full mt-12 space-y-6">
          {/* Heat Map - Activity Calendar */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Activity Heat Map</h3>
            <p className="text-sm text-gray-500 mb-6">Your learning activity over the past year</p>
            <div className="overflow-x-auto">
              <div className="flex gap-1 mb-2">
                {Array.from({ length: 53 }, (_, weekIndex) => {
                  const weekData = Array.from({ length: 7 }, (_, dayIndex) => {
                    // Generate random activity levels (0-4) for heat map
                    const activityLevel = Math.floor(Math.random() * 5);
                    return activityLevel;
                  });
                  return (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {weekData.map((level, dayIndex) => {
                        const intensity = level / 4;
                        const bgColor = intensity === 0 ? '#ebedf0' :
                          intensity <= 0.25 ? '#9be9a8' :
                          intensity <= 0.5 ? '#40c463' :
                          intensity <= 0.75 ? '#30a14e' : '#216e39';
                        return (
                          <div
                            key={dayIndex}
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: bgColor }}
                            title={`Activity level: ${level}`}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                <span>Less</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-gray-200"></div>
                  <div className="w-3 h-3 rounded-sm bg-green-200"></div>
                  <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                  <div className="w-3 h-3 rounded-sm bg-green-600"></div>
                  <div className="w-3 h-3 rounded-sm bg-green-800"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Progress Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Skill Progress</h3>
              <div className="space-y-4">
                {[
                  { skill: 'JavaScript', progress: 85, color: 'bg-black' },
                  { skill: 'React', progress: 75, color: 'bg-gray-800' },
                  { skill: 'Node.js', progress: 70, color: 'bg-gray-700' },
                  { skill: 'Python', progress: 65, color: 'bg-gray-600' },
                  { skill: 'DSA', progress: 80, color: 'bg-gray-900' },
                  { skill: 'System Design', progress: 60, color: 'bg-gray-500' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.skill}</span>
                      <span className="text-sm text-gray-600">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Performance Line Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Performance</h3>
              <div className="relative h-64">
                <div className="absolute inset-0 flex items-end justify-between gap-2">
                  {[
                    { month: 'Jan', value: 65 },
                    { month: 'Feb', value: 72 },
                    { month: 'Mar', value: 68 },
                    { month: 'Apr', value: 80 },
                    { month: 'May', value: 75 },
                    { month: 'Jun', value: 85 },
                    { month: 'Jul', value: 78 },
                    { month: 'Aug', value: 82 },
                    { month: 'Sep', value: 88 },
                    { month: 'Oct', value: 90 },
                    { month: 'Nov', value: 85 },
                    { month: 'Dec', value: 92 },
                  ].map((data, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                        <div
                          className="w-full bg-black rounded-t"
                          style={{ height: `${(data.value / 100) * 200}px` }}
                          title={`${data.month}: ${data.value}%`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{data.month}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between text-xs text-gray-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Course Completion Distribution */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Course Categories</h3>
              <div className="space-y-4">
                {[
                  { category: 'Web Development', count: 12, total: 20, color: 'bg-black' },
                  { category: 'Data Science', count: 8, total: 15, color: 'bg-gray-800' },
                  { category: 'Mobile Dev', count: 5, total: 10, color: 'bg-gray-700' },
                  { category: 'System Design', count: 6, total: 12, color: 'bg-gray-600' },
                  { category: 'DevOps', count: 4, total: 8, color: 'bg-gray-500' },
                ].map((item, idx) => {
                  const percentage = (item.count / item.total) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                        <span className="text-sm text-gray-600">{item.count}/{item.total}</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className={`${item.color} h-3 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">{Math.round(percentage)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quiz Performance Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz Performance</h3>
              <div className="relative h-64">
                <div className="absolute inset-0 flex items-end justify-between gap-2">
                  {[
                    { week: 'W1', score: 72, max: 100 },
                    { week: 'W2', score: 78, max: 100 },
                    { week: 'W3', score: 85, max: 100 },
                    { week: 'W4', score: 82, max: 100 },
                    { week: 'W5', score: 88, max: 100 },
                    { week: 'W6', score: 90, max: 100 },
                    { week: 'W7', score: 87, max: 100 },
                    { week: 'W8', score: 92, max: 100 },
                  ].map((data, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center gap-1" style={{ height: '200px' }}>
                        <div
                          className="flex-1 bg-gray-700 rounded-t"
                          style={{ height: `${(data.score / data.max) * 200}px` }}
                          title={`${data.week}: ${data.score}%`}
                        ></div>
                        <div
                          className="flex-1 bg-black rounded-t opacity-50"
                          style={{ height: `${(data.max / data.max) * 200}px` }}
                          title="Max"
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{data.week}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-700 rounded"></div>
                  <span className="text-gray-600">Your Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-black rounded opacity-50"></div>
                  <span className="text-gray-600">Max Score</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="w-full bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Learning Journey</h3>
            <TimelineDemo />
          </div>
        </div>
      </div>
    </div>
  );
}