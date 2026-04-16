export default function ShiftFilter({ active, onChange }) {
  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'morning', label: 'Morning (6am–6pm)' },
    { key: 'night', label: 'Night (6pm–6am)' },
  ]

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            active === tab.key
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
