export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" placeholder="John Doe" className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" placeholder="john@example.com" className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Save Changes
        </button>
      </div>
    </div>
  );
}
