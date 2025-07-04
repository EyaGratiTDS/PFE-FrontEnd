import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { User } from '../../services/user';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface UserChartsProps {
  users: User[];
}

const UserCharts: React.FC<UserChartsProps> = ({ users }) => {
  const roleData = {
    labels: ['Users', 'Admins', 'Super Admins'],
    datasets: [
      {
        label: 'User Roles',
        data: [
          users.filter(u => u.role === 'user').length,
          users.filter(u => u.role === 'admin').length,
          users.filter(u => u.role === 'superAdmin').length,
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const statusData = {
    labels: ['Active', 'Inactive', 'Verified', 'Not Verified'],
    datasets: [
      {
        label: 'User Status',
        data: [
          users.filter(u => u.isActive).length,
          users.filter(u => !u.isActive).length,
          users.filter(u => u.isVerified).length,
          users.filter(u => !u.isVerified).length,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#333',
          font: {
            size: 12
          }
        }
      }
    },
  };

  // Options spécifiques pour Pie Chart
  const pieOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'User Roles',
        color: '#6B7280',
        font: {
          size: 16,
          weight: 'bold' as 'bold' // Correction ici
        }
      }
    }
  };

  // Options spécifiques pour Bar Chart
  const barOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'User Status',
        color: '#6B7280',
        font: {
          size: 16,
          weight: 'bold' as 'bold' // Correction ici
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">User Roles Distribution</h3>
        <div className="h-72">
          <Pie 
            data={roleData} 
            options={pieOptions}
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">User Status Overview</h3>
        <div className="h-72">
          <Bar 
            data={statusData} 
            options={barOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default UserCharts;