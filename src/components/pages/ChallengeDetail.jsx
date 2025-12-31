import React from 'react'
import { Link, useParams } from 'react-router-dom'
import MCQQuiz from './quiz.jsx'

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

const FALLBACK = {
  title: 'Challenge',
  description: 'Details coming soon.',
  image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400',
  organizer: 'Hexagon',
  duration: 'TBD',
}

export default function ChallengeDetail() {
  const { id } = useParams()
  
  // Find challenge by ID
  const c = seedChallenges.find(challenge => challenge.id === id) || FALLBACK
  
  // If it's a Quiz type, show the quiz component
  if (c.type === 'Quiz' && c.id) {
    return <MCQQuiz />
  }

  return (
    <div className="min-h-screen w-full bg-white flex justify-center">
      <div className="w-full max-w-5xl pt-8">
        <section className="relative w-full px-4">
          <div className="relative h-72 md:h-80 w-full overflow-hidden bg-zinc-200">
            <img src={c.image} alt={c.title} className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="relative -mt-24 md:-mt-28 mb-4 flex items-end gap-4 px-4 pb-4">
            <div className="h-24 w-24 md:h-28 md:w-28 rounded-xl border-[6px] border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
              <img src={c.image} alt={c.title} className="h-full w-full object-cover rounded-lg" />
            </div>
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-zinc-900">{c.title}</h2>
              <p className="text-zinc-600">{c.organizer}</p>
            </div>
            <div className="ml-auto mb-2 flex gap-3">
              <a href="#" className="rounded-full px-4 py-2 text-sm font-medium bg-zinc-900 text-white">Apply / Register</a>
              <Link to="/challenges" className="rounded-full px-4 py-2 text-sm font-medium ring-1 ring-zinc-300 text-zinc-800">All Challenges</Link>
            </div>
          </div>
        </section>

        <section className="mt-3 flex w-full flex-col gap-6 px-4 pb-10">
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm">
            <div className="mb-4 text-zinc-700 whitespace-pre-line">{c.description}</div>
            <div className="text-sm text-zinc-700">Duration: {c.duration}</div>
          </div>
        </section>
      </div>
    </div>
  )
}


