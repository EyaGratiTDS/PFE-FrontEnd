import { useState, useEffect } from 'react';
import { planService } from '../services/api';
import { Plan } from '../services/Plan';

const PricingPlan = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await planService.getAllPlans();
                
                if (response.data) {
                    // Filtrer uniquement les plans actifs
                    const activePlans = response.data.filter(plan => plan.is_active);
                    setPlans(activePlans);
                } else {
                    setError(response.message || 'Impossible de charger les plans de tarification');
                }
            } catch (err: any) {
                console.error('Erreur lors du chargement des plans:', err);
                setError('Erreur de connexion au serveur');
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    if (loading) {
        return (
            <div className="container-fluid py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '400px' }}>
                <div className="container">
                    <div className="text-center">
                        <h2>Loading Plans...</h2>
                        <div className="spinner-border text-primary mt-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid py-5" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="container">
                    <div className="alert alert-danger text-center">
                        <h4>Erreur de chargement</h4>
                        <p>{error}</p>
                        <button 
                            className="btn btn-primary mt-3"
                            onClick={() => window.location.reload()}
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="container-fluid py-5" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="container">
                    <div className="text-center">
                        <h4>Aucun plan disponible</h4>
                        <p className="text-muted">Les plans de tarification ne sont pas encore configurés.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="container py-5">
                {/* Section Title */}
                <div className="text-center mb-5">
                    <h5 className="text-primary text-uppercase fw-bold">Pricing Plans</h5>
                    <h1 className="mb-4">Choose the Perfect NexCard Plan</h1>
                    <div className="mx-auto" style={{ width: '80px', height: '3px', backgroundColor: '#06A3DA' }}></div>
                </div>

                {/* Plans Grid */}
                <div className="row g-4 justify-content-center">
                    {plans.map((plan) => (
                        <div key={plan.id} className="col-lg-4 col-md-6">
                            <div className={`card h-100 shadow-sm border-0 ${plan.is_default ? 'border-primary' : ''}`}
                                 style={{ 
                                     borderRadius: '15px',
                                     transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                 }}>
                                
                                {/* Popular Badge */}
                                {plan.is_default && (
                                    <div className="position-absolute top-0 end-0 bg-primary text-white px-3 py-1"
                                         style={{ borderRadius: '0 15px 0 15px' }}>
                                        <small className="fw-bold">Most Popular</small>
                                    </div>
                                )}

                                <div className="card-body text-center p-4 d-flex flex-column h-100">
                                    {/* Icon */}
                                    <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                         style={{ width: '70px', height: '70px' }}>
                                        <i className="fa fa-star text-white" style={{ fontSize: '1.5rem' }}></i>
                                    </div>

                                    {/* Plan Name */}
                                    <h4 className="text-primary fw-bold">{plan.name}</h4>
                                    <p className="text-muted small mb-4">{plan.description}</p>

                                    {/* Price */}
                                    <div className="mb-4">
                                        <h1 className="display-4 fw-bold text-dark mb-0">
                                            <small className="text-muted">$</small>
                                            {plan.price}
                                            {plan.price !== '0' && (
                                                <small className="text-muted">
                                                    /{plan.duration_days === 30 ? 'mo' : 
                                                      plan.duration_days === 365 ? 'yr' : 
                                                      `${plan.duration_days}d`}
                                                </small>
                                            )}
                                        </h1>
                                    </div>

                                    {/* Features */}
                                    <ul className="list-unstyled mb-4 flex-grow-1">
                                        {plan.features.map((feature: string, idx: number) => (
                                            <li key={idx} className="mb-2 d-flex align-items-center">
                                                <i className="fa fa-check text-success me-2"></i>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Button - Always at bottom */}
                                    <div className="mt-auto">
                                        <button className={`btn w-100 py-2 rounded-pill fw-bold ${
                                            plan.is_default ? 'btn-primary' : 'btn-outline-primary'
                                        }`}>
                                            {plan.price === '0' ? 'Start Free' : 'Get Started'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PricingPlan;