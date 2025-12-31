import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_CONFIG from '../../config/api'
import { Plus, X, Trash2 } from 'lucide-react'

function authHeaders() {
  const token =
    localStorage.getItem('hexagon_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function CourseCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    duration: '', 
    department: '', 
    institute: '',
    instituteLogo: '',
    professor: '', 
    instructor: '',
    image: '',
    enrolledCount: '0',
    assistants: [],
    curriculum: [],
    weeklyPlan: [],
    milestones: []
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('basic') // basic, team, curriculum, weekly, milestones

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const onImageFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const dataUrl = await fileToDataUrl(f)
    setForm((s) => ({ ...s, image: String(dataUrl) }))
  }

  const onInstituteLogoFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const dataUrl = await fileToDataUrl(f)
    setForm((s) => ({ ...s, instituteLogo: String(dataUrl) }))
  }

  // Assistants management
  const addAssistant = () => {
    setForm({
      ...form,
      assistants: [...form.assistants, { name: '', role: 'TA', avatar: '' }]
    })
  }

  const updateAssistant = (index, field, value) => {
    const updated = [...form.assistants]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, assistants: updated })
  }

  const removeAssistant = (index) => {
    setForm({
      ...form,
      assistants: form.assistants.filter((_, i) => i !== index)
    })
  }

  // Curriculum management
  const addCurriculumChapter = () => {
    setForm({
      ...form,
      curriculum: [...form.curriculum, { chapterTitle: '', topics: [''] }]
    })
  }

  const updateCurriculumChapter = (index, field, value) => {
    const updated = [...form.curriculum]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, curriculum: updated })
  }

  const addCurriculumTopic = (chapterIndex) => {
    const updated = [...form.curriculum]
    updated[chapterIndex].topics = [...updated[chapterIndex].topics, '']
    setForm({ ...form, curriculum: updated })
  }

  const updateCurriculumTopic = (chapterIndex, topicIndex, value) => {
    const updated = [...form.curriculum]
    updated[chapterIndex].topics[topicIndex] = value
    setForm({ ...form, curriculum: updated })
  }

  const removeCurriculumTopic = (chapterIndex, topicIndex) => {
    const updated = [...form.curriculum]
    updated[chapterIndex].topics = updated[chapterIndex].topics.filter((_, i) => i !== topicIndex)
    setForm({ ...form, curriculum: updated })
  }

  const removeCurriculumChapter = (index) => {
    setForm({
      ...form,
      curriculum: form.curriculum.filter((_, i) => i !== index)
    })
  }

  // Weekly Plan management
  const addWeeklyPlan = () => {
    setForm({
      ...form,
      weeklyPlan: [...form.weeklyPlan, { week: form.weeklyPlan.length + 1, title: '', topics: [''] }]
    })
  }

  const updateWeeklyPlan = (index, field, value) => {
    const updated = [...form.weeklyPlan]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, weeklyPlan: updated })
  }

  const addWeeklyTopic = (weekIndex) => {
    const updated = [...form.weeklyPlan]
    updated[weekIndex].topics = [...updated[weekIndex].topics, '']
    setForm({ ...form, weeklyPlan: updated })
  }

  const updateWeeklyTopic = (weekIndex, topicIndex, value) => {
    const updated = [...form.weeklyPlan]
    updated[weekIndex].topics[topicIndex] = value
    setForm({ ...form, weeklyPlan: updated })
  }

  const removeWeeklyTopic = (weekIndex, topicIndex) => {
    const updated = [...form.weeklyPlan]
    updated[weekIndex].topics = updated[weekIndex].topics.filter((_, i) => i !== topicIndex)
    setForm({ ...form, weeklyPlan: updated })
  }

  const removeWeeklyPlan = (index) => {
    setForm({
      ...form,
      weeklyPlan: form.weeklyPlan.filter((_, i) => i !== index)
    })
  }

  // Milestones management
  const addMilestone = () => {
    setForm({
      ...form,
      milestones: [...form.milestones, { title: '', content: '' }]
    })
  }

  const updateMilestone = (index, field, value) => {
    const updated = [...form.milestones]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, milestones: updated })
  }

  const removeMilestone = (index) => {
    setForm({
      ...form,
      milestones: form.milestones.filter((_, i) => i !== index)
    })
  }

  const onSave = async () => {
    setSaving(true)
    setError('')
    try {
      // Clean up empty curriculum topics
      const cleanedCurriculum = form.curriculum.map(ch => ({
        chapterTitle: ch.chapterTitle.trim(),
        topics: ch.topics.filter(t => t.trim()).map(t => t.trim())
      })).filter(ch => ch.chapterTitle)

      // Clean up empty weekly plan topics
      const cleanedWeeklyPlan = form.weeklyPlan.map(wp => ({
        week: wp.week,
        title: wp.title.trim(),
        topics: wp.topics.filter(t => t.trim()).map(t => t.trim())
      })).filter(wp => wp.title || wp.topics.length > 0)

      // Clean up assistants
      const cleanedAssistants = form.assistants.filter(a => a.name.trim())

      const payload = {
        title: String(form.title || '').trim(),
        description: String(form.description || '').trim(),
        duration: String(form.duration || '').trim(),
        department: String(form.department || '').trim(),
        institute: String(form.institute || '').trim(),
        instituteLogo: String(form.instituteLogo || '').trim(),
        professor: String(form.professor || '').trim(),
        instructor: String(form.instructor || '').trim(),
        image: String(form.image || '').trim(),
        enrolledCount: Number(form.enrolledCount) || 0,
        assistants: cleanedAssistants,
        curriculum: cleanedCurriculum,
        weeklyPlan: cleanedWeeklyPlan,
        milestones: form.milestones.filter(m => m.title.trim() || m.content.trim())
      }

      const res = await fetch(API_CONFIG.getApiUrl('/courses'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j?.error || 'Failed to create course')
      } else {
        navigate('/courses')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[70vh] w-full flex justify-center pt-20 pb-10 bg-white">
      <div className="w-full max-w-4xl p-6">
        <h1 className="text-2xl font-semibold mb-6">Create Course</h1>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-zinc-200">
          {['basic', 'team', 'curriculum', 'weekly', 'milestones'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-zinc-900 text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {tab}
            </button>
          ))}
          </div>
          
        {error && <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
          <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Title *</label>
              <input name="title" value={form.title} onChange={onChange} className="w-full rounded-lg border border-zinc-300 px-3 py-2" required />
          </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Description *</label>
              <textarea name="description" value={form.description} onChange={onChange} className="w-full rounded-lg border border-zinc-300 px-3 py-2" rows={6} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Duration *</label>
                <input name="duration" value={form.duration} onChange={onChange} placeholder="e.g., 12 weeks" className="w-full rounded-lg border border-zinc-300 px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Department *</label>
                <input name="department" value={form.department} onChange={onChange} placeholder="e.g., CSE, ECE" className="w-full rounded-lg border border-zinc-300 px-3 py-2" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Institute</label>
                <input name="institute" value={form.institute} onChange={onChange} placeholder="e.g., MIT, Stanford" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Initial Enrollment</label>
                <input name="enrolledCount" value={form.enrolledCount} onChange={onChange} type="number" min="0" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Professor</label>
                <input name="professor" value={form.professor} onChange={onChange} className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Instructor</label>
                <input name="instructor" value={form.instructor} onChange={onChange} className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
            </div>
          </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Course Image</label>
              {form.image && (
                <img src={form.image} alt="Preview" className="h-36 w-full rounded-xl object-cover ring-1 ring-zinc-200 mb-2" />
              )}
              <input type="file" accept="image/*" onChange={onImageFile} className="text-sm mb-2" />
              <input name="image" value={form.image} onChange={onChange} placeholder="or paste an image URL" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Institute Logo</label>
              {form.instituteLogo && (
                <img src={form.instituteLogo} alt="Logo Preview" className="h-24 w-24 rounded-lg object-cover ring-1 ring-zinc-200 mb-2" />
              )}
              <input type="file" accept="image/*" onChange={onInstituteLogoFile} className="text-sm mb-2" />
              <input name="instituteLogo" value={form.instituteLogo} onChange={onChange} placeholder="or paste a logo URL" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
            </div>
          </div>
        )}

        {/* Team/Assistants Tab */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Teaching Assistants</h3>
              <button
                onClick={addAssistant}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
              >
                <Plus className="w-4 h-4" /> Add Assistant
              </button>
            </div>

            {form.assistants.length === 0 && (
              <div className="text-sm text-zinc-500 text-center py-8 border border-dashed border-zinc-300 rounded-lg">
                No assistants added yet. Click "Add Assistant" to add one.
              </div>
            )}

            {form.assistants.map((assistant, index) => (
              <div key={index} className="border border-zinc-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Assistant {index + 1}</h4>
                  <button
                    onClick={() => removeAssistant(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
                    <label className="block text-xs text-zinc-600 mb-1">Name *</label>
                    <input
                      value={assistant.name}
                      onChange={(e) => updateAssistant(index, 'name', e.target.value)}
                      placeholder="Assistant name"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">Role</label>
                    <input
                      value={assistant.role}
                      onChange={(e) => updateAssistant(index, 'role', e.target.value)}
                      placeholder="TA, Instructor, etc."
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
            </div>
            <div>
                    <label className="block text-xs text-zinc-600 mb-1">Avatar URL</label>
                    <input
                      value={assistant.avatar}
                      onChange={(e) => updateAssistant(index, 'avatar', e.target.value)}
                      placeholder="Avatar image URL"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Curriculum Tab */}
        {activeTab === 'curriculum' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Curriculum Chapters</h3>
              <button
                onClick={addCurriculumChapter}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
              >
                <Plus className="w-4 h-4" /> Add Chapter
              </button>
            </div>

            {form.curriculum.length === 0 && (
              <div className="text-sm text-zinc-500 text-center py-8 border border-dashed border-zinc-300 rounded-lg">
                No curriculum chapters added yet. Click "Add Chapter" to add one.
              </div>
            )}

            {form.curriculum.map((chapter, chapterIndex) => (
              <div key={chapterIndex} className="border border-zinc-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Chapter {chapterIndex + 1}</h4>
                  <button
                    onClick={() => removeCurriculumChapter(chapterIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Chapter Title *</label>
                  <input
                    value={chapter.chapterTitle}
                    onChange={(e) => updateCurriculumChapter(chapterIndex, 'chapterTitle', e.target.value)}
                    placeholder="e.g., Introduction to Programming"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs text-zinc-600">Topics</label>
                    <button
                      onClick={() => addCurriculumTopic(chapterIndex)}
                      className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Topic
                    </button>
                  </div>
                  {chapter.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="flex items-center gap-2 mb-2">
                      <input
                        value={topic}
                        onChange={(e) => updateCurriculumTopic(chapterIndex, topicIndex, e.target.value)}
                        placeholder={`Topic ${topicIndex + 1}`}
                        className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => removeCurriculumTopic(chapterIndex, topicIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Weekly Plan Tab */}
        {activeTab === 'weekly' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Weekly Plan</h3>
              <button
                onClick={addWeeklyPlan}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
              >
                <Plus className="w-4 h-4" /> Add Week
              </button>
          </div>

            {form.weeklyPlan.length === 0 && (
              <div className="text-sm text-zinc-500 text-center py-8 border border-dashed border-zinc-300 rounded-lg">
                No weekly plans added yet. Click "Add Week" to add one.
              </div>
            )}

            {form.weeklyPlan.map((week, weekIndex) => (
              <div key={weekIndex} className="border border-zinc-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Week {week.week}</h4>
                  <button
                    onClick={() => removeWeeklyPlan(weekIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">Week Number</label>
                    <input
                      type="number"
                      value={week.week}
                      onChange={(e) => updateWeeklyPlan(weekIndex, 'week', parseInt(e.target.value) || 1)}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">Week Title</label>
                    <input
                      value={week.title}
                      onChange={(e) => updateWeeklyPlan(weekIndex, 'title', e.target.value)}
                      placeholder="e.g., Week 1: Introduction"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs text-zinc-600">Topics</label>
                    <button
                      onClick={() => addWeeklyTopic(weekIndex)}
                      className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Topic
                    </button>
                  </div>
                  {week.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="flex items-center gap-2 mb-2">
                      <input
                        value={topic}
                        onChange={(e) => updateWeeklyTopic(weekIndex, topicIndex, e.target.value)}
                        placeholder={`Topic ${topicIndex + 1}`}
                        className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => removeWeeklyTopic(weekIndex, topicIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Course Milestones</h3>
              <button
                onClick={addMilestone}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
              >
                <Plus className="w-4 h-4" /> Add Milestone
              </button>
            </div>

            {form.milestones.length === 0 && (
              <div className="text-sm text-zinc-500 text-center py-8 border border-dashed border-zinc-300 rounded-lg">
                No milestones added yet. Click "Add Milestone" to add one.
              </div>
            )}

            {form.milestones.map((milestone, index) => (
              <div key={index} className="border border-zinc-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Milestone {index + 1}</h4>
                  <button
                    onClick={() => removeMilestone(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
            </button>
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Title *</label>
                  <input
                    value={milestone.title}
                    onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                    placeholder="e.g., Week 1: Introduction"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Content</label>
                  <textarea
                    value={milestone.content}
                    onChange={(e) => updateMilestone(index, 'content', e.target.value)}
                    placeholder="Milestone description or content (supports HTML)"
                    rows={4}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save Button */}
        <div className="pt-6 mt-6 border-t border-zinc-200 flex items-center justify-between">
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !form.title || !form.description || !form.duration || !form.department}
            className="px-6 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </div>
    </div>
  )
}
