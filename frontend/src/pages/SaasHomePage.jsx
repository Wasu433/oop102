import { Link } from 'react-router-dom'

const features = [
  {
    icon: (
      <svg className="w-7 h-7 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Real-Time Pricing',
    desc: 'Live market data updated daily from trusted Thai automotive sources.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
    title: 'Comprehensive Database',
    desc: 'Over 50,000 car models across all major brands available in Thailand.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: 'Developer-First',
    desc: 'RESTful JSON API with clear documentation, SDKs, and sandbox environment.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: '99.9% Uptime SLA',
    desc: 'pro-grade infrastructure with global CDN and redundant failover.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    title: 'Flexible Filtering',
    desc: 'Filter by brand, model year, fuel type, province, and condition.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: '24/7 Support',
    desc: 'Dedicated technical support for standard and pro customers.',
  },
]

const steps = [
  { step: '01', title: 'Sign Up', desc: 'Create a free account and get your API key instantly.' },
  { step: '02', title: 'Integrate', desc: 'Add one line to your app — works with any language or framework.' },
  { step: '03', title: 'Ship', desc: 'Access live Thai car pricing data in your product today.' },
]

export default function SaasHomePage() {
  return (
    <div className="bg-navy">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-24 pb-20 text-center">
        <span className="inline-block bg-mid bg-opacity-30 text-light text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-light border-opacity-30">
          Thai Car Pricing API
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          Car Price Data,<br />
          <span className="text-light">One API Away.</span>
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
          Access real-time Thai car market pricing for every make, model, and year.
          Build apps, power valuations, and automate pricing — all from a single REST API.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/pricing" className="btn-primary text-base">
            Get Started Free
          </Link>
          <Link to="/api" className="btn-outline text-base">
            View API Docs
          </Link>
        </div>

        {/* Stat bar */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto">
          {[['50K+', 'Car Models'], ['200+', 'Brands'], ['Daily', 'Updates']].map(([val, label]) => (
            <div key={label} className="card text-center">
              <div className="text-2xl font-bold text-light">{val}</div>
              <div className="text-xs text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-blue bg-opacity-40 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-4">Everything you need</h2>
          <p className="text-center text-gray-400 mb-12">Powerful features built for developers and businesses alike.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="card hover:border-opacity-60 transition-all duration-200">
                <div className="mb-4">{icon}</div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-4">Get started in minutes</h2>
          <p className="text-center text-gray-400 mb-14">No complex setup. No SDKs required.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-mid flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                  {step}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center card">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to integrate?</h2>
          <p className="text-gray-400 mb-6">Start with 500 free requests per month. No credit card required.</p>
          <Link to="/pricing" className="btn-primary inline-block">
            See Pricing Plans
          </Link>
        </div>
      </section>
    </div>
  )
}
