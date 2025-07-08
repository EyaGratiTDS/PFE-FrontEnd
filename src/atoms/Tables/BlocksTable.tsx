import React from 'react';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { Block } from '../../services/vcard';
import { getBlockIcon } from '../../services/blockIcons';
import { motion } from 'framer-motion';

interface BlocksTableProps {
  blocks: Block[];
  onToggleStatus: (blockId: string) => void;
}

const renderStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
      Inactive
    </span>
  );
};

const BlockRow: React.FC<{ 
  block: Block; 
  onToggleStatus: (blockId: string) => void;
}> = ({ block, onToggleStatus }) => {
  const { icon: Icon, gradient, shadow } = getBlockIcon(block.type_block);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex justify-center">
          <div className={`p-3 rounded-full bg-gradient-to-br ${gradient} ${shadow} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </td>
      
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {block.type_block}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {block.name}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {block.description || 'N/A'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {renderStatusBadge(block.status || false)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggleStatus(block.id)}
            className={`p-2 rounded-lg flex items-center ${
              block.status
                ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/50 dark:text-yellow-300'
                : 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-800/50 dark:text-green-300'
            } transition-colors duration-200`}
            title={block.status ? "Deactivate" : "Activate"}
          >
            {block.status 
              ? <><FaToggleOff className="mr-1" /> Disable</>
              : <><FaToggleOn className="mr-1" /> Enable</>}
          </motion.button>
        </div>
      </td>
    </tr>
  );
};

const BlocksTable: React.FC<BlocksTableProps> = ({
  blocks,
  onToggleStatus
}) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow w-full max-w-full">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Icon
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {blocks.length > 0 ? (
            blocks.map((block) => (
              <BlockRow
                key={block.id}
                block={block}
                onToggleStatus={onToggleStatus}
              />
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center">
                <div className="text-center py-4">
                  <div className="text-gray-400 text-3xl mb-2">📦</div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    No blocks found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-xs">
                    Create your first block to get started
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BlocksTable;