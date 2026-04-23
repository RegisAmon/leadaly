import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    return <div>Non autorisé</div>;
  }

  const { users } = await clerkClient();
  const user = await users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress;
  const firstName = user.firstName;
  const lastName = user.lastName;
  void lastName; // used for workspace name generation

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenue{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="text-gray-600 mb-6">{email}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Crédits restants</p>
            <p className="text-3xl font-bold text-blue-600">—</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Campagnes actives</p>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Leads totaux</p>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
