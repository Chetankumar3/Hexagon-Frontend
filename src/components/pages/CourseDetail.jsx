import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import API_CONFIG from '../../config/api'
import { Timeline } from '../ui/timeline.jsx'
import { ChevronDown, ChevronUp, BookOpen, Clock, PlayCircle, FileText, CheckCircle, Star } from 'lucide-react';
import { AnimatedTestimonialsDemo } from '../ui/animated-testimonials-demo';
import { AnimatedTooltipPreview } from '../ui/animated-tooltip-preview';
import { WobbleCardDemo } from '../ui/wobble-card-demo';

// Helper function to format duration (estimated based on topic count)
const estimateDuration = (topicCount) => {
  const minutes = topicCount * 25; // Average 25 min per topic
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''}`.trim();
  }
  return `${mins} minutes`;
};

// Helper function to detect topic type from title
const detectTopicType = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('quiz') || lower.includes('assessment') || lower.includes('test') || lower.includes('exam')) {
    return 'quiz';
  }
  if (lower.includes('exercise') || lower.includes('practice') || lower.includes('assignment') || lower.includes('project')) {
    return 'document';
  }
  return 'video';
};

function authHeaders() {
  const token =
    localStorage.getItem('hexagon_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrollmentLoading, setEnrollmentLoading] = useState(false)
  const [viewTab, setViewTab] = useState('curriculum') // curriculum | weekly
  const [openChapters, setOpenChapters] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState('5');
  const [reviews, setReviews] = useState([])
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [postingReview, setPostingReview] = useState(false)


  const toggleChapter = (chapterId) => {
    setOpenChapters(prev =>
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const getTopicIcon = (type) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-5 h-5 text-gray-600" />;
      case 'quiz':
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
      case 'document':
        return <FileText className="w-5 h-5 text-gray-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-600" />;
    }
  };

  const calculateProgress = (topics) => {
    // For now, we'll calculate based on enrolled status and show 0% if not enrolled
    // In the future, this can be tracked per topic completion
    if (!isEnrolled || !topics || topics.length === 0) return 0;
    // Return a placeholder progress - you can enhance this with actual progress tracking
    // For now, return 0% - can be enhanced with actual completion tracking
    const completed = topics.filter(t => t.completed).length;
    return Math.round((completed / topics.length) * 100);
  };

  // Transform course curriculum data to display format
  const getCurriculumData = () => {
    if (!course?.curriculum || !Array.isArray(course.curriculum) || course.curriculum.length === 0) {
      return [];
    }
    return course.curriculum.map((chapter, index) => ({
      id: index + 1,
      title: chapter.chapterTitle || `Chapter ${index + 1}`,
      duration: estimateDuration(chapter.topics?.length || 0),
      topics: (chapter.topics || []).map((topic, topicIndex) => ({
        id: topicIndex + 1,
        title: topic,
        type: detectTopicType(topic),
        duration: "25 min", // Default duration
        completed: false // Can be enhanced with actual progress tracking
      }))
    }));
  };

  // Transform weekly plan data
  const getWeeklyPlanData = () => {
    if (!course?.weeklyPlan || !Array.isArray(course.weeklyPlan) || course.weeklyPlan.length === 0) {
      return [];
    }
    return course.weeklyPlan.map((week) => ({
      title: week.title || `Week ${week.week || ''}`,
      content: (
        <div>
          <p className="mb-4 text-zinc-700">
            {week.topics && week.topics.length > 0 ? (
              <div>
                <p className="mb-2 font-medium">Topics covered:</p>
                <ul className="list-disc list-inside space-y-1">
                  {week.topics.map((topic, idx) => (
                    <li key={idx} className="text-zinc-700">{topic}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-zinc-600">No topics specified for this week.</p>
            )}
          </p>
        </div>
      )
    }));
  };

  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          const res = await fetch(API_CONFIG.getApiUrl(`/courses/${encodeURIComponent(id)}`))
          const j = res.ok ? await res.json() : null
          if (!cancelled) {
            setCourse(j)
            // if curriculum missing, seed dummy once
            if (j && (!Array.isArray(j.curriculum) || j.curriculum.length === 0)) {
              const dummyCurr = [
                { chapterTitle: 'Introduction to the Course', topics: ['Overview', 'Goals', 'Assessment'] },
                { chapterTitle: 'Fundamentals', topics: ['Core Concepts', 'Key Terms', 'Tools Setup'] },
                { chapterTitle: 'Data Structures', topics: ['Arrays', 'Lists', 'Maps'] },
                { chapterTitle: 'Algorithms Basics', topics: ['Sorting', 'Searching', 'Complexity'] },
                { chapterTitle: 'Networking Basics', topics: ['HTTP', 'REST', 'APIs'] },
                { chapterTitle: 'Databases', topics: ['SQL', 'Modeling', 'Indexes'] },
                { chapterTitle: 'Backend Concepts', topics: ['Auth', 'Caching', 'Queues'] },
                { chapterTitle: 'Frontend Concepts', topics: ['Components', 'State', 'Routing'] },
                { chapterTitle: 'Testing & QA', topics: ['Unit', 'Integration', 'E2E'] },
                { chapterTitle: 'Capstone Project', topics: ['Planning', 'Implementation', 'Presentation'] },
              ]
              const dummyWeekly = Array.from({ length: 10 }).map((_, i) => ({
                week: i + 1,
                title: `Week ${i + 1}`,
                topics: dummyCurr[i] ? dummyCurr[i].topics : [],
              }))
              try {
                const putRes = await fetch(API_CONFIG.getApiUrl(`/courses/${encodeURIComponent(j._id)}`), {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', ...authHeaders() },
                  body: JSON.stringify({ curriculum: dummyCurr, weeklyPlan: dummyWeekly })
                })
                if (putRes.ok) {
                  const updated = await putRes.json()
                  setCourse(updated)
                } else {
                  setCourse({ ...j, curriculum: dummyCurr, weeklyPlan: dummyWeekly })
                }
              } catch {
                setCourse({ ...j, curriculum: dummyCurr, weeklyPlan: dummyWeekly })
              }
            }
            if (j?._id) {
              // Check enrollment status
              const statusRes = await fetch(API_CONFIG.getApiUrl(`/enrollments/status?courseId=${encodeURIComponent(j._id)}`), { headers: authHeaders() })
              if (statusRes.ok) {
                const status = await statusRes.json()
                setIsEnrolled(status.enrolled)
              }
            }
          }
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(API_CONFIG.getApiUrl(`/course-reviews/${encodeURIComponent(id)}`))
        const list = res.ok ? await res.json() : []
        if (!cancelled) setReviews(Array.isArray(list) ? list : [])
      } catch {
        if (!cancelled) setReviews([])
      }
    })()
    return () => { cancelled = true }
  }, [id])

  if (loading) return <div className="p-12">Loading...</div>
  if (!course) return <div className="p-12 text-red-500">Course not found.</div>

  const enrolled = Number(course.enrolledCount || 0)
  const duration = course.duration || ''
  const institute = course.institute || course.department || ''
  const instructor = course.professor || course.instructor || ''

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="w-full pt-8 flex justify-center px-5">
        <div className="w-full max-w-4xl">
          <section className="relative w-full px-1">
            <div className="relative h-64 md:h-72 w-full overflow-hidden bg-zinc-200 rounded-2xl">
              {course.image ? (
                <img src={course.image} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="relative -mt-22 md:-mt-26 mb-5 flex items-end gap-5 px-3 pb-3">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-xl border-[6px] border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <div className="h-full w-full rounded-lg bg-zinc-100" />
                )}
              </div>
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-zinc-900">{course.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {course.instituteLogo && (
                    <img src={course.instituteLogo} alt="Institute" className="h-6 w-6 rounded-sm object-cover ring-1 ring-zinc-200" />
                  )}
                  <p className="text-zinc-600">{institute}</p>
                </div>
              
              {Array.isArray(course.assistants) && course.assistants.length > 0 && (
                <div className="flex items-center gap-3 mt-2">
                  {course.assistants.slice(0, 4).map((a, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {a.avatar && <img src={a.avatar} alt={a.name} className="h-6 w-6 rounded-full object-cover ring-1 ring-zinc-200" />}
                      <span className="text-xs text-zinc-600">{a.name} ({a.role || 'TA'})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="ml-auto mb-2 flex gap-3 px-3">
              <button
                onClick={async () => {
                  setEnrollmentLoading(true)
                  try {
                    const url = API_CONFIG.getApiUrl('/enrollments')
                    const opts = isEnrolled
                      ? { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ courseId: course._id }) }
                      : { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ courseId: course._id }) }
                    const res = await fetch(url, opts)
                    if (res.ok) {
                      setIsEnrolled((v) => !v)
                      if (course.enrolledCount !== undefined) {
                        setCourse({ ...course, enrolledCount: Number(course.enrolledCount) + (isEnrolled ? -1 : 1) })
                      }
                    }
                  } catch {
                    // ignore
                  } finally {
                    setEnrollmentLoading(false)
                  }
                }}
                disabled={enrollmentLoading}
                className={`rounded-full px-4 py-2 text-sm font-medium ${isEnrolled ? 'ring-1 ring-zinc-300 text-zinc-700' : 'bg-indigo-500 text-white'}`}
              >
                {enrollmentLoading ? 'Loading...' : (isEnrolled ? 'Enrolled' : 'Enroll Now')}
              </button>
              <Link to="/courses" className="rounded-full px-4 py-2 text-sm font-medium ring-1 ring-zinc-300 text-zinc-800">All Courses</Link>
            </div>
          </div>
        </section>

        {/* Animated Tooltip - Course Instructors/Team */}
        <section className="mt-6 w-full px-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-center">Course Instructors & Team</h3>
            <AnimatedTooltipPreview />
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mt-3 flex w-full flex-col gap-6 px-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Course Reviews</h3>
            </div>
            {isEnrolled && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setReviewRating(n)} className={`p-1 ${reviewRating >= n ? 'text-amber-500' : 'text-zinc-300'}`} aria-label={`${n} stars`}>
                      <Star className="w-5 h-5" fill={reviewRating >= n ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e)=>setReviewText(e.target.value)}
                  rows={3}
                  placeholder="Share your experience..."
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
                <div className="mt-2 text-right">
                  <button
                    onClick={async () => {
                      if (!reviewText.trim()) return
                      setPostingReview(true)
                      try {
                        const res = await fetch(API_CONFIG.getApiUrl(`/course-reviews/${encodeURIComponent(id)}`), {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', ...authHeaders() },
                          body: JSON.stringify({ rating: reviewRating, content: reviewText.trim(), images: [] })
                        })
                        if (res.status === 201) {
                          const created = await res.json()
                          setReviews(arr => [created, ...arr])
                          setReviewText('')
                          setReviewRating(5)
                        }
                      } finally {
                        setPostingReview(false)
                      }
                    }}
                    disabled={postingReview}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {postingReview ? 'Posting…' : 'Post Review'}
                  </button>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="text-sm text-zinc-600">No reviews yet.</div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="rounded-xl border border-zinc-100 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`w-4 h-4 ${r.rating >= n ? 'text-amber-500' : 'text-zinc-300'}`} fill={r.rating >= n ? 'currentColor' : 'none'} />
                      ))}
                      <span className="text-xs text-zinc-500 ml-2">{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-[15px] leading-6 text-zinc-800 whitespace-pre-wrap">{r.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        


          <section className="mt-3 flex w-full flex-col gap-6 px-4">
            <aside className="w-full">
              <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                <div className="mb-4 text-zinc-700 whitespace-pre-line">{course.description}</div>
                <div className="mb-6 flex flex-wrap gap-4 text-sm text-zinc-700">
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1">Duration: {duration}</span>
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1">Enrolled: {enrolled}</span>
                  {instructor && (
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1">Instructor: {instructor}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowFeedback(true)}
                    className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ring-1 bg-zinc-900 text-white ring-zinc-900`}
                  >
                    Give Feedback
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">How to add/curate degrees</h3>
                  <p className="text-zinc-700">
                    Connect your profile, add this course to your degree plan, and track progress.
                    We can integrate an "Add to Degree" button here once your degree planner is ready.
                  </p>
                </div>
              </div>
            </aside>
          </section>

          {/* Wobble Card Section */}
          <section className="mt-6 w-full px-4">
            <WobbleCardDemo />
          </section>

          {showFeedback && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowFeedback(false)} />
              <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h4 className="text-lg font-semibold mb-4">Course Feedback</h4>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-zinc-800 mb-1">Rating</label>
                  <select
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 bg-white"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Very Poor</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-800 mb-1">Comments</label>
                  <textarea
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Share your thoughts about this course..."
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedback(false)}
                    className="rounded-full px-4 py-2 text-sm font-medium ring-1 ring-zinc-300 text-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowFeedback(false); setFeedbackText(''); setFeedbackRating('5'); }}
                    className={`rounded-full px-4 py-2 text-sm font-medium ring-1 bg-zinc-900 text-white ring-zinc-900`}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Curriculum / Weekly Plan Toggle and Content */}
          <section className="mt-6 w-full px-4 pb-10">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Course Content</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewTab('curriculum')}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium ring-1 ${viewTab === 'curriculum' ? 'bg-zinc-900 text-white ring-zinc-900' : 'ring-zinc-300 text-zinc-700'}`}
                  >
                    Curriculum
                  </button>
                  <button
                    onClick={() => setViewTab('weekly')}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium ring-1 ${viewTab === 'weekly' ? 'bg-zinc-900 text-white ring-zinc-900' : 'ring-zinc-300 text-zinc-700'}`}
                  >
                    Weekly Plan
                  </button>
                </div>
              </div>

              {viewTab === 'curriculum' && (() => {
                const curriculumData = getCurriculumData();
                if (curriculumData.length === 0) {
                  return (
                    <div className="text-center py-12 text-zinc-600">
                      <p>No curriculum available for this course yet.</p>
                    </div>
                  );
                }
                return (
                  <div className="min-h-screen bg-gray-100 p-6">
                    <div className="max-w-4xl mx-auto">
                      {/* Curriculum List */}
                      <div className="space-y-4">
                        {curriculumData.map((chapter) => {
                          const isOpen = openChapters.includes(chapter.id);
                          const progress = calculateProgress(chapter.topics);

                        return (
                          <div key={chapter.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                            {/* Chapter Header */}
                            <div
                              onClick={() => toggleChapter(chapter.id)}
                              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">
                                  {chapter.id}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                                    {chapter.title}
                                  </h3>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {chapter.duration}
                                    </span>
                                    <span>{chapter.topics.length} topics</span>
                                    {progress > 0 && (
                                      <span className="text-black font-semibold">{progress}% complete</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-gray-600">
                                {isOpen ? (
                                  <ChevronUp className="w-6 h-6" />
                                ) : (
                                  <ChevronDown className="w-6 h-6" />
                                )}
                              </div>
                            </div>

                            {/* Progress Bar */}
                            {progress > 0 && (
                              <div className="px-6 pb-2">
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-black transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Topics List */}
                            {isOpen && (
                              <div className="border-t border-gray-100">
                                {chapter.topics.map((topic, index) => (
                                  <div
                                    key={topic.id}
                                    className={`flex items-center justify-between p-4 mx-6 my-2 rounded-lg hover:bg-gray-50 transition cursor-pointer ${topic.completed ? 'bg-gray-50' : ''
                                      }`}
                                  >
                                    <div className="flex items-center gap-4 flex-1">
                                      <div className="flex items-center justify-center w-8 h-8 text-gray-400 font-medium">
                                        {index + 1}
                                      </div>
                                      {getTopicIcon(topic.type)}
                                      <span className={`${topic.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                        {topic.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="text-sm text-gray-500">{topic.duration}</span>
                                      {topic.completed && (
                                        <CheckCircle className="w-5 h-5 text-black fill-black" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {viewTab === 'weekly' && (() => {
                const weeklyData = getWeeklyPlanData();
                const timelineData = weeklyData.length > 0 
                  ? weeklyData
                  : (course.milestones && course.milestones.length > 0
                      ? course.milestones.map((m) => ({
                          title: m.title,
                          content: (
                            <div className="text-zinc-700" dangerouslySetInnerHTML={{ __html: m.content || '' }} />
                          ),
                        }))
                      : [
                        {
                          title: 'Week 1: Introduction',
                          content: (
                            <div>
                              <p className="mb-4 text-zinc-700">Get started with the fundamentals and overview of the course.</p>
                            </div>
                          )
                        }
                      ]);
                
                return <Timeline data={timelineData} />;
              })()}
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="mt-6 w-full px-4 pb-10">
            <div className="flex justify-center">
              <AnimatedTestimonialsDemo />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
