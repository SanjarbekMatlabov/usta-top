import { Link } from 'react-router-dom';
import { buildProviderMedia } from '../utils/providerMedia';

function ProviderCard({ provider }) {
  const media = buildProviderMedia(provider);

  return (
    <Link className="provider-card" to={`/providers/${provider.id}`}>
      <div className="provider-card-media" style={{ backgroundImage: `url(${media.coverImage})` }}>
        <div className="provider-card-glow" />
        <div className="provider-card-badges">
          {provider.premium && <span className="badge badge-premium">Premium</span>}
          <span className="badge">{provider.category}</span>
        </div>
      </div>

      <div className="provider-card-body">
        <h3 className="provider-card-title">{provider.full_name}</h3>
        <p className="provider-card-description">{provider.description}</p>

        <div className="provider-card-meta">
          <span>{provider.location || 'Kiritilmagan'}</span>
          <span>⭐ {provider.average_rating.toFixed(1)} ({provider.total_reviews})</span>
        </div>

        <div className="provider-card-footer">
          <span className="provider-card-link">Profilni ochish</span>
          <span className="provider-card-arrow">→</span>
        </div>
      </div>
    </Link>
  );
}

export default ProviderCard;
