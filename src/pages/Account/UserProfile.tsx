import React, { useState, useEffect } from 'react';
import { User } from '../../services/user';
import { API_BASE_URL } from '../../config/constants';
import useColorMode from '../../hooks/useColorMode';
import {
  User as UserIcon,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Briefcase,
  Edit3
} from 'lucide-react';

interface UserProfileProps {
  userData: User;
  onEditProfile?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userData, onEditProfile }) => {
  const [colorMode] = useColorMode();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (userData?.avatar) {
      setAvatarPreview(userData.avatar);
    }
  }, [userData]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <div className={`${colorMode === 'light' ? 'light-mode' : ''} bg-gray-50 dark:bg-gray-900 min-h-screen py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className={`${colorMode === 'light' ? 'profile-card' : ''} bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden`}>
          {/* Cover Photo */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white dark:bg-gray-800 p-1 sm:p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 relative">
            {/* Avatar */}
            <div className="absolute -top-12 sm:-top-16 left-4 sm:left-6 border-4 border-white dark:border-gray-800 rounded-full shadow-lg">
              <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={`${API_BASE_URL}${avatarPreview}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl sm:text-3xl font-semibold text-gray-500 dark:text-gray-300">
                    {getInitials(userData.name)}
                  </span>
                )}
              </div>
            </div>

            {/* User Details */}
            <div className="ml-24 sm:ml-36 pt-1 space-y-1 sm:space-y-2">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {userData.name || 'Your Name'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{userData.email || 'email@example.com'}</span>
              </p>
              <div className="mt-1 sm:mt-2 flex flex-wrap gap-1 sm:gap-2">
                {['Professional', 'Designer', 'Active'].map((badge, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs rounded-full font-medium"
                    style={{
                      backgroundColor: index === 0 ? '#dbeafe' : index === 1 ? '#e9d5ff' : '#dcfce7',
                      color: index === 0 ? '#1e40af' : index === 1 ? '#6b21a8' : '#166534'
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
          {/* Left Column */}
          <div className="md:col-span-1">
            {/* About Card */}
            <div className={`${colorMode === 'light' ? 'card' : ''} bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6`}>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                About
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Professional designer with expertise in UI/UX and brand identity. Passionate about creating beautiful and functional designs that solve real-world problems.
              </p>

              <div className="mt-4 space-y-2 sm:space-y-3">
                {[
                  { icon: MapPin, text: 'Paris, France' },
                  { icon: Phone, text: '+216 25 285 386' },
                  { icon: Briefcase, text: 'Software Engineering' },
                  { 
                    icon: Calendar, 
                    text: userData.created_at 
                      ? `Joined ${formatDate(userData.created_at).split(',')[0]}`
                      : 'Joined April 2022'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 truncate">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Card */}
            <div className={`${colorMode === 'light' ? 'card' : ''} bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6`}>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {['UI Design', 'Figma', 'Prototyping', 'User Research', 'Adobe CC', 'Design Systems'].map((skill) => (
                  <div 
                    key={skill}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm text-gray-800 dark:text-gray-200"
                    style={{
                      backgroundColor: colorMode === 'light' ? '#f3f4f6' : '#374151'
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2">
            {/* Projects Card */}
            <div className={`${colorMode === 'light' ? 'card' : ''} bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6`}>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Recent Projects
              </h2>

              <div className="space-y-4 sm:space-y-5">
                {[
                  { 
                    title: 'E-commerce Redesign', 
                    description: 'Complete overhaul of the product listing and checkout experience',
                    status: 'Completed'
                  },
                  {
                    title: 'Mobile App UI Kit',
                    description: 'Design system with components for iOS and Android applications',
                    status: 'In Progress'
                  },
                  {
                    title: 'Brand Identity',
                    description: 'Logo and visual identity for a new tech startup',
                    status: 'Planning'
                  }
                ].map((project, index) => (
                  <div 
                    key={index}
                    className={`pb-4 sm:pb-5 ${index < 2 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div className="flex-1">
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          {project.title}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {project.description}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap mt-1 sm:mt-0
                        ${project.status === 'Completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                          project.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                          'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'}`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Card */}
            <div className={`${colorMode === 'light' ? 'card' : ''} bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6`}>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Recent Activity
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {[
                  {
                    icon: UserIcon,
                    color: 'blue',
                    text: 'updated your profile picture',
                    date: userData.updated_at ? formatDate(userData.updated_at) : '2 days ago'
                  },
                  {
                    icon: Briefcase,
                    color: 'purple',
                    text: 'completed the E-commerce Redesign project',
                    date: '5 days ago'
                  },
                  {
                    icon: UserIcon,
                    color: 'green',
                    text: 'updated your profile information',
                    date: '1 week ago'
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
                        bg-${activity.color}-100 dark:bg-${activity.color}-900`}
                      >
                        <activity.icon className={`w-3 h-3 sm:w-4 sm:h-4 text-${activity.color}-600 dark:text-${activity.color}-300`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                        <span className="font-medium">You</span> {activity.text}
                      </p>
                      <p className="text-[0.65rem] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {activity.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;