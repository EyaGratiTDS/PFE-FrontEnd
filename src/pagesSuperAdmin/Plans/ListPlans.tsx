import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlanCardAdmin from '../../cards/PlanCardAdmin';
import { planService } from '../../services/api';
import { Plan } from '../../services/Plan';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import PlanStatsCards from '../../cards/PlanStatsCards';

const AddPlanModal: React.FC<{ 
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newPlan: Plan) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [durationDays, setDurationDays] = useState('30');
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('0');
    setDurationDays('30');
    setIsActive(true);
    setIsDefault(false);
    setFeatures([]);
    setNewFeature('');
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    
    if (features.length === 0) {
      toast.error('Please add at least one feature');
      return;
    }
    
    const newPlan: Omit<Plan, 'id' | 'created_at' | 'updated_at'> = {
      name,
      description,
      price,
      duration_days: Number(durationDays),
      features,
      is_active: isActive,
      is_default: isDefault
    };

    setLoading(true);
    try {
      const response = await planService.createPlan(newPlan);
      
      if (response.data) {
        toast.success('Plan created successfully!');
        onCreate(response.data as Plan);
        resetForm();
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to create plan:', error);
      toast.error(error.response?.data?.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create New Plan</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Premium Plan"
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (days) *
                </label>
                <input
                  type="number"
                  id="duration"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="30"
                />
              </div>
              
              <div className="flex flex-col justify-end space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Active Plan
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Default Plan
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe the plan features and benefits..."
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Features *
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">{features.length} added</span>
              </div>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                  className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add a feature"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  disabled={!newFeature.trim()}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              
              {features.length > 0 ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 max-h-40 overflow-y-auto">
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-md">
                        <span className="text-gray-800 dark:text-gray-200">{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FaTimes />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  No features added yet
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim() || features.length === 0}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Plan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ListPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    free: 0,
    default: 0
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await planService.getAllPlans();
        
        if (response.data) {
          setPlans(response.data);
        } else {
          setPlans([]);
          toast.error('No plan data received from server');
        }
      } catch (error) {
        console.error('Failed to fetch plans', error);
        toast.error('Failed to load plans. Please try again.');
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    if (plans.length > 0) {
      const total = plans.length;
      const active = plans.filter(plan => plan.is_active).length;
      const free = plans.filter(plan => Number(plan.price) === 0).length;
      const defaultPlans = plans.filter(plan => plan.is_default).length;

      setStats({ total, active, free, default: defaultPlans });
    } else {
      setStats({ total: 0, active: 0, free: 0, default: 0 });
    }
  }, [plans]);

  const handleCreatePlan = async (newPlan: Plan) => {
    try {
      setPlans(prev => [newPlan, ...prev]);
      
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        active: prev.active + (newPlan.is_active ? 1 : 0),
        free: prev.free + (Number(newPlan.price) === 0 ? 1 : 0),
        default: prev.default + (newPlan.is_default ? 1 : 0)
      }));
    } catch (error: any) {
      console.error('Failed to create plan:', error);
    }
  };

  const togglePlanStatus = async (planId: number, isActive: boolean) => {
    try {
      setPlans(prevPlans =>
        prevPlans.map(plan =>
          plan.id === planId ? { ...plan, is_active: isActive } : plan
        )
      );

      await planService.togglePlanStatus(planId.toString());
      toast.success(`Plan ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Failed to toggle plan status', error);
      toast.error('Failed to update plan status');

      // Revert UI update on error
      setPlans(prevPlans =>
        prevPlans.map(plan =>
          plan.id === planId ? { ...plan, is_active: !isActive } : plan
        )
      );
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      // Trouver le plan avant suppression pour mettre à jour les stats
      const deletedPlan = plans.find(p => p.id === planId);
      if (!deletedPlan) return;

      try {
        await planService.deletePlan(planId.toString());
        
        // Mettre à jour l'état des plans
        setPlans(prev => prev.filter(plan => plan.id !== planId));
        toast.success('Plan deleted successfully');
        
        // Mettre à jour les statistiques
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          active: prev.active - (deletedPlan.is_active ? 1 : 0),
          free: prev.free - (Number(deletedPlan.price) === 0 ? 1 : 0),
          default: prev.default - (deletedPlan.is_default ? 1 : 0)
        }));
      } catch (error) {
        console.error('Failed to delete plan', error);
        toast.error('Failed to delete plan');
      }
    }
  };

  const setDefaultPlan = async (planId: number) => {
    try {
      // First, remove default status from all plans
      const updatedPlans = plans.map(plan => ({
        ...plan,
        is_default: plan.id === planId
      }));
      
      setPlans(updatedPlans);
      
      // Then make API call to set the new default
      await planService.updatePlan(planId.toString(), { is_default: true });
      
      // Also update any other plan that was default to false
      const previousDefault = plans.find(p => p.is_default && p.id !== planId);
      if (previousDefault) {
        await planService.updatePlan(previousDefault.id.toString(), { is_default: false });
      }
      
      toast.success('Default plan updated successfully');
    } catch (error) {
      console.error('Failed to set default plan', error);
      toast.error('Failed to update default plan');
      setPlans(plans);
    }
  };

  const handleEditPlan = async (plan: Plan) => {
    // Implement your edit modal logic here
    console.log('Edit plan:', plan);
    toast.info('Edit plan functionality to be implemented');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 sm:p-6 lg:px-8 xl:px-28 w-full max-w-[90rem] mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <AddPlanModal 
        isOpen={showAddPlanModal}
        onClose={() => setShowAddPlanModal(false)}
        onCreate={handleCreatePlan}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Plan Management</h1>
          <p className="text-primary mt-1 sm:mt-2 text-sm sm:text-base">
            View and manage all subscription plans
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddPlanModal(true)}
            className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg transition-colors h-10 sm:h-12 text-sm sm:text-base"
          >
            <FaPlus className="mr-2" />
            <span>Add Plan</span>
          </button>
        </div>
      </div>

      <PlanStatsCards
        stats={{
          total: stats.total,
          active: stats.active,
          free: stats.free,
          default: stats.default
        }}
      />

      {plans.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-xl max-w-2xl mx-auto">
            <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">No plans yet</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Get started by creating your first subscription plan.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddPlanModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-600 focus:outline-none"
              >
                <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                Add Plan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan: Plan) => (
            <PlanCardAdmin
              key={plan.id}
              plan={plan}
              isCurrent={false}
              onEdit={() => handleEditPlan(plan)}
              onDelete={() => handleDeletePlan(plan.id!)}
              onToggleStatus={() => togglePlanStatus(plan.id!, !plan.is_active)}
              onSetDefault={() => setDefaultPlan(plan.id!)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListPlans;