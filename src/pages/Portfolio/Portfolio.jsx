export default function Portfolio() {
  const investments = [
    { id: 1, name: "Solar Investment", amount: "$1,200", status: "Active" },
    { id: 2, name: "Real Estate Share", amount: "$2,500", status: "Pending" },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">My Portfolio</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold">Project</th>
              <th className="text-left py-3 px-4 font-semibold">Amount</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">{item.name}</td>
                <td className="py-3 px-4">{item.amount}</td>
                <td className="py-3 px-4">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
