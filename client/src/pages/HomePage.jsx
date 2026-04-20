import { useEffect, useState } from 'react';
import ProviderCard from '../components/ProviderCard';
import api from '../utils/api';
import { UZ_HOME_SERVICE_CATEGORIES } from '../utils/categories';

function HomePage() {
  const [providers, setProviders] = useState([]);
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category === 'Boshqa' && customCategory.trim()) {
        params.category = customCategory.trim();
      } else if (category && category !== 'Boshqa') {
        params.category = category;
      }
      if (search) params.search = search;
      const { data } = await api.get('/providers', { params });
      setProviders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  return (
    <div className="container page">
      <section className="hero hero-grid">
        <div>
          <div className="hero-chip">DEMO</div>
          <h1 className="hero-title">UstaTop.uz xizmatlar bozori</h1>
          <p className="hero-subtitle">
            Elektrik, santexnik, konditsioner va boshqa uy ustalarini bir joyda ko'ring, rasmlari bilan tanishing va tez buyurtma bering.
          </p>
        </div>

        <div className="hero-kpi">
          <div>
            <span>Top kategoriyalar</span>
            <strong>15+</strong>
          </div>
          <div>
            <span>Premium profillar</span>
            <strong>Ha</strong>
          </div>
          <div>
            <span>Buyurtma tizimi</span>
            <strong>Ichida</strong>
          </div>
        </div>
      </section>

      <div className="toolbar">
        <div className="grid-2 mb-12">
          <div className="field">
            <label>Kategoriya</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Barchasi</option>
              {UZ_HOME_SERVICE_CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          {category === 'Boshqa' && (
            <div className="field">
              <label>Boshqa kategoriya</label>
              <input
                type="text"
                placeholder="Masalan: Pechka ustasi"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            </div>
          )}
          <div className="field">
            <label>Qidiruv</label>
            <input
              type="text"
              placeholder="Usta nomi bo'yicha qidirish"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <button onClick={loadProviders}>Filtrlash</button>
      </div>

      {loading ? (
        <div className="panel">Ustalar yuklanmoqda...</div>
      ) : providers.length === 0 ? (
        <div className="panel">Hozircha mos usta topilmadi.</div>
      ) : (
        <div className="cards">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
