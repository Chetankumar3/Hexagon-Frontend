import { Link } from 'react-router-dom'
import React, { useMemo, useState } from 'react'
import CourseCard from '../ui/CourseCard.jsx'

const seedChallenges = [
  { id: 'h1', type: 'Hackathon', title: 'AI Build Sprint', description: '48h AI hack to build real products.', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1400', organizer: 'OpenAI Community', duration: '48 hours' },
  { id: 'q1', type: 'Quiz', title: 'Web Security Quiz', description: 'Test your XSS, CSRF and OAuth know-how.', image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?q=80&w=1400', organizer: 'Security Club', duration: '30 mins' },
  { id: 'e1', type: 'Event', title: 'Frontend Conf 2025', description: 'Talks and workshops on React and performance.', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400', organizer: 'JS Delhi', duration: '2 days' },
  { id: 'b1', type: 'Bounty', title: 'UI Bug Bounty', description: 'Fix critical UI issues and earn rewards.', image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1400', organizer: 'Hexagon', duration: '1 week' },
  { id: 'h2', type: 'Hackathon', title: 'Web3 Weekend', description: 'Ship a dApp in a weekend and win grants.', image: 'https://images.unsplash.com/photo-1642782845006-9c158e8bafaa?q=80&w=1400', organizer: 'Ethereum India', duration: '36 hours' },
  { id: 'q2', type: 'Quiz', title: 'DSA Rapid-Fire', description: 'Fast-paced DSA questions—arrays, trees, graphs.', image: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?q=80&w=1400', organizer: 'Algo Nights', duration: '25 mins' },
  { id: 'e2', type: 'Event', title: 'Cloud Builders Meetup', description: 'Kubernetes, Terraform, and platform talks.', image: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1400', organizer: 'Cloud Native Pune', duration: '1 day' },
  { id: 'b2', type: 'Bounty', title: 'API Reliability Bounty', description: 'Harden retries, timeouts, and circuit breakers.', image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1400', organizer: 'Hexagon', duration: '10 days' },
  { id: 'h3', type: 'Hackathon', title: 'Design Systems Jam', description: 'Build a scalable design system with tokens.', image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1400', organizer: 'Figma Circle', duration: '24 hours' },
  { id: 'q3', type: 'Quiz', title: 'HTTP & REST Quiz', description: 'Headers, caching, status codes, and auth.', image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=1400', organizer: 'Backend Guild', duration: '20 mins' },
  { id: 'e3', type: 'Event', title: 'Mobile Dev Day', description: 'React Native vs Flutter, perf and tooling.', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1400', organizer: 'Mobile Mumbai', duration: '1 day' },
  { id: 'b3', type: 'Bounty', title: 'Accessibility Fixathon', description: 'Improve a11y scores across key pages.', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1400', organizer: 'Hexagon', duration: '2 weeks' },
]

export default function Challenges() {
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('All')

  const kinds = ['All', 'Hackathon', 'Quiz', 'Event', 'Bounty']

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return seedChallenges.filter((c) => {
      const matchesKind = kind === 'All' || c.type === kind
      if (!q) return matchesKind
      const hay = `${c.title} ${c.description} ${c.organizer}`.toLowerCase()
      return matchesKind && hay.includes(q)
    })
  }, [query, kind])

  return (
    <div className="min-h-screen w-full bg-white flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold pt-3 pb-2">Challenges</h1>
        </div>

        <div className="mb-12 grid grid-cols-1 md:grid-cols-[1fr,220px] gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, description, or organizer"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 bg-white"
          >
            {kinds.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pb-12">
          {filtered.map((c) => (
            <Link key={c.id} to={`/challenges/${c.id}`} className="block w-full transition-transform hover:-translate-y-0.5">
              <CourseCard
                title={`${c.type}: ${c.title}`}
                description={c.description}
                duration={c.duration}
                department={c.organizer}
                image={c.image}
                professor={null}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}


