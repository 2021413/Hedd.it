import Image from "next/image";
import Link from "next/link";
import { FiMail, FiBell, FiShare2, FiCalendar } from "react-icons/fi";

interface ProfileHeaderProps {
  user: {
    username: string;
    displayName: string;
    avatar: string | null;
    banner: string | null;
    bio: string;
    joinDate: string;
    isCurrentUser: boolean;
    isSubscribed: boolean;
  };
  onSubscribe: () => void;
}

export default function ProfileHeader({ user, onSubscribe }: ProfileHeaderProps) {
  return (
    <>
      <div className="relative mb-6">
        <div className="relative h-36 bg-neutral-900 rounded-2xl overflow-hidden">
          {user.banner && (
            <Image
              src={user.banner}
              alt="Bannière"
              fill
              sizes="100vw"
              priority
              className="object-cover rounded-2xl"
              unoptimized
            />
          )}
        </div>

        <div className="absolute -bottom-14 left-8">
          <div className="w-28 h-28 rounded-full border-4 border-[#1E1E1E] overflow-hidden bg-neutral-800">
            {user.avatar && (
              <Image
                src={user.avatar}
                alt={`Avatar de ${user.displayName}`}
                width={112}
                height={112}
                priority
                className="object-cover"
                unoptimized
              />
            )}
            {!user.avatar && (
              <div className="flex items-center justify-center h-full text-3xl text-gray-400">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-16 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {user.username ? `u/${user.username}` : 'Utilisateur'}
            </h1>
            <p className="text-gray-400">{user.displayName}</p>
            {user.bio && (
              <p className="text-gray-300 mt-4 max-w-2xl">
                {user.bio}
              </p>
            )}
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            {user.isCurrentUser ? (
              <>
                <Link
                  href="/settings"
                  className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                >
                  Modifier le profil
                </Link>
                <button className="px-4 py-2 border border-green-700 text-white rounded-lg hover:bg-green-700">
                  <FiShare2 className="inline mr-2" /> Partager
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onSubscribe}
                  className={`px-4 py-2 ${
                    user.isSubscribed
                      ? "bg-neutral-800 hover:bg-neutral-700"
                      : "bg-green-700 hover:bg-green-800"
                  } text-white rounded-lg flex items-center`}
                >
                  <FiBell className="inline mr-2" />
                  {user.isSubscribed ? "Abonné" : "S'abonner"}
                </button>
                <button className="px-4 py-2 border border-green-700 text-white rounded-lg hover:bg-green-700 flex items-center">
                  <FiMail className="inline mr-2" /> Message
                </button>
                <button className="px-4 py-2 border border-green-700 text-white rounded-lg hover:bg-green-700">
                  <FiShare2 className="inline mr-2" /> Partager
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center text-gray-400 mt-4">
          <FiCalendar className="mr-2" />
          <span>Membre depuis: {user.joinDate}</span>
        </div>
      </div>
    </>
  );
} 