import { useEffect, useState } from 'react';
import api from '../utils/api';
import { UZ_HOME_SERVICE_CATEGORIES } from '../utils/categories';

const initialForm = {
  category: '',
  skills: '',
  description: '',
  pricing: '',
  location: '',
};

function ProviderDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setError('');
    try {
      const profileRes = await api.get('/providers/me/profile');
      setProfile(profileRes.data);
      setForm({
        category: profileRes.data.category,
        skills: profileRes.data.skills,
        description: profileRes.data.description,
        pricing: profileRes.data.pricing,
        location: profileRes.data.location,
      });

      if (UZ_HOME_SERVICE_CATEGORIES.includes(profileRes.data.category) && profileRes.data.category !== 'Boshqa') {
        setSelectedCategory(profileRes.data.category);
        setCustomCategory('');
      } else {
        setSelectedCategory('Boshqa');
        setCustomCategory(profileRes.data.category || '');
      }
    } catch {
      setProfile(null);
      setForm(initialForm);
      setSelectedCategory('');
      setCustomCategory('');
    }

    try {
      const ordersRes = await api.get('/orders/provider/incoming');
      setOrders(ordersRes.data);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!selectedCategory) {
      setError('Kategoriyani tanlang');
      return;
    }

    const resolvedCategory = selectedCategory === 'Boshqa' ? customCategory.trim() : selectedCategory;
    if (!resolvedCategory) {
      setError('Boshqa kategoriya nomini kiriting');
      return;
    }

    const payload = { ...form, category: resolvedCategory };

    try {
      if (profile) {
        const { data } = await api.put('/providers/me/profile', payload);
        setProfile(data);
      } else {
        const { data } = await api.post('/providers/me/profile', payload);
        setProfile(data);
      }
      setMessage('Profil saqlandi');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.detail || 'Profilni saqlashda xatolik');
    }
  };

  const upgradePremium = async () => {
    setMessage('');
    setError('');
    try {
      const { data } = await api.patch('/providers/me/premium');
      setProfile(data);
      setMessage('Siz premium ustaga aylandingiz');
    } catch (err) {
      setError(err.response?.data?.detail || "Premiumga o'tishda xatolik");
    }
  };

  const updateOrder = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/provider`, {
        status,
        provider_response: status === 'completed' ? 'Buyurtma bajarildi' : 'Buyurtma qabul qilindi',
      });
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.detail || 'Buyurtmani yangilashda xatolik');
    }
  };

  return (
    <div className="container page stack">
      <section className="hero hero-grid">
        <div>
          <div className="hero-chip">Usta boshqaruv markazi</div>
          <h1 className="hero-title">Usta kabineti</h1>
          <p className="hero-subtitle">Profilingizni to'ldiring, buyurtmalarni boshqaring va premium holatga o'ting.</p>
        </div>
        <div className="hero-kpi">
          <div>
            <span>Holat</span>
            <strong>{profile ? 'Faol' : 'Yangi profil'}</strong>
          </div>
          <div>
            <span>Buyurtmalar</span>
            <strong>{orders.length}</strong>
          </div>
          <div>
            <span>Premium</span>
            <strong>{profile?.premium ? 'Ha' : "Yo'q"}</strong>
          </div>
        </div>
      </section>

      <form className="form" onSubmit={saveProfile}>
        <h2>Profil ma'lumotlari</h2>
        <div className="field">
          <label>Kategoriya</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
            <option value="">Kategoriyani tanlang</option>
            {UZ_HOME_SERVICE_CATEGORIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        {selectedCategory === 'Boshqa' && (
          <div className="field">
            <label>Boshqa kategoriya nomi</label>
            <input
              type="text"
              placeholder="Masalan: Ventilyatsiya ustasi"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              required
            />
          </div>
        )}

        <div className="field">
          <label>Ko'nikmalar</label>
          <textarea
            placeholder="Ko'nikmalar"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Ta'rif</label>
          <textarea
            placeholder="Ta'rif"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid-2-compact">
          <div className="field">
            <label>Narx siyosati</label>
            <input
              type="text"
              placeholder="Narx siyosati"
              value={form.pricing}
              onChange={(e) => setForm({ ...form, pricing: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Joylashuv</label>
            <input
              type="text"
              placeholder="Joylashuv"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
        </div>
        <button type="submit">Profilni saqlash</button>
      </form>

      {profile && (
        <div className="panel">
          <h3 className="mb-8">Profil holati</h3>
          <div className="badge-row mb-12">
            <span className={`status ${profile.premium ? 'status-ok' : 'status-muted'}`}>
              Premium: {profile.premium ? 'Ha' : "Yo'q"}
            </span>
            <span className="badge">Kategoriya: {profile.category}</span>
            <span className="badge">Reyting: {profile.average_rating.toFixed(1)} ⭐</span>
          </div>
          {!profile.premium && <button onClick={upgradePremium}>Premiumga o'tish</button>}
        </div>
      )}

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <h2>Kiruvchi buyurtmalar</h2>
      {orders.length === 0 ? (
        <div className="panel">Hozircha buyurtmalar yo'q.</div>
      ) : (
        <div className="cards">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <h3 className="card-title">{order.title}</h3>
              <div className="card-meta">
                <p><strong>Tavsif:</strong> {order.description || 'Kiritilmagan'}</p>
                <p><strong>Manzil:</strong> {order.address || 'Kiritilmagan'}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status ${order.status === 'completed' ? 'status-ok' : 'status-muted'}`}>
                    {order.status}
                  </span>
                </p>
              </div>
              <div className="actions">
                <button className="btn-secondary" type="button" onClick={() => updateOrder(order.id, 'pending')}>Pending</button>
                <button type="button" onClick={() => updateOrder(order.id, 'completed')}>Completed</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProviderDashboardPage;
