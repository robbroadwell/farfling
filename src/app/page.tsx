import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-100 p-4">
      <div className="max-w-7xl mx-auto">
        <input
          type="text"
          placeholder="Search adventures"
          className="w-full mb-4 p-3 rounded-md border border-gray-300"
        />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['Hiking', 'Cycling', 'Skiing', 'Kayaking', 'Climbing'].map((type) => (
            <button
              key={type}
              className="flex-shrink-0 px-4 py-2 bg-white border rounded-full text-sm"
            >
              {type}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Adventure cards go here */}
          <div className="rounded-lg overflow-hidden shadow bg-white">
            <img
              src="/sample-hiking.jpg"
              alt="Hiking the Dolomites"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">Hiking the Dolomites</h2>
              <p className="text-sm text-gray-500">Cortina d'Ampezzo, Italy</p>
              <p className="text-sm text-gray-700 mt-2">Amanda S.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
