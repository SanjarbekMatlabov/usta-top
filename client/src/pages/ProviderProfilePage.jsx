import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { buildProviderMedia } from '../utils/providerMedia';

function ProviderProfilePage() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [reviewForm, setReviewForm] = useState({ order_id: '', rating: 5, comment: '' });
  const [orderForm, setOrderForm] = useState({ title: '', description: '', address: '', commission: 0 });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    const [providerRes, reviewsRes] = await Promise.all([
      api.get(`/providers/${providerId}`),
      api.get(`/reviews/provider/${providerId}`),
    ]);
    setProvider(providerRes.data);
    setReviews(reviewsRes.data);

    if (user?.role === 'user') {
      try {
        const eligibleRes = await api.get(`/reviews/eligible-orders/${providerId}`);
        setEligibleOrders(eligibleRes.data);
      } catch {
        setEligibleOrders([]);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [providerId, user?.role]);

  const media = useMemo(() => (provider ? buildProviderMedia(provider) : null), [provider]);

  const submitReview = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.post('/reviews', {
        provider_id: Number(providerId),
        order_id: Number(reviewForm.order_id),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setReviewForm({ order_id: '', rating: 5, comment: '' });
      setMessage('Sharh saqlandi');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Sharh yuborishda xatolik');
    }
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (user?.role !== 'user') {
      navigate('/login');
      return;
    }

    try {
      await api.post('/orders', {
        provider_id: Number(providerId),
        title: orderForm.title,
        description: orderForm.description,
        address: orderForm.address,
        commission: Number(orderForm.commission),
      });
      setOrderForm({ title: '', description: '', address: '', commission: 0 });
      setMessage('Buyurtma yuborildi');
    } catch (err) {
      setError(err.response?.data?.detail || 'Buyurtma yaratishda xatolik');
    }
  };

  if (!provider || !media) {
    return <div className="container page"><div className="panel">Yuklanmoqda...</div></div>;
  }

  return (
    <div className="container page stack">
      <section className="provider-hero">
        <div className="provider-hero-media" style={{ backgroundImage: `url(${media.coverImage})` }}>
          <div className="provider-hero-overlay">
            <span className="hero-chip">{provider.category}</span>
            {provider.premium && <span className="badge badge-premium">Premium</span>}
          </div>
        </div>

        <div className="provider-hero-content">
          <div className="badge-row mb-12">
            <span className="badge">Joylashuv: {provider.location || 'Kiritilmagan'}</span>
            <span className="badge">Narx: {provider.pricing || 'Kelishiladi'}</span>
            <span className="badge">Reyting: {provider.average_rating.toFixed(1)} ⭐</span>
            <span className="badge">Sharhlar: {provider.total_reviews}</span>
          </div>
          <h1 className="hero-title">{provider.full_name}</h1>
          <p className="hero-subtitle">{provider.description || "Usta haqida qo'shimcha ma'lumot kiritilmagan."}</p>

          <div className="stats-grid mb-12">
            <div className="stat-item">
              <p className="stat-label">Kategoriya</p>
              <p className="stat-value">{provider.category}</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Reyting</p>
              <p className="stat-value">{provider.average_rating.toFixed(1)} ⭐</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Sharhlar</p>
              <p className="stat-value">{provider.total_reviews}</p>
            </div>
          </div>

          {user?.role === 'user' && (
            <a className="btn" href="#buyurtma">Buyurtma berish</a>
          )}
        </div>
      </section>

      <div className="profile-layout">
        <main className="profile-main stack">
          <section className="panel">
            <h2 className="mb-12">Ko'nikmalar</h2>
            <p className="muted">{provider.skills || "Ko'nikmalar kiritilmagan."}</p>
          </section>

          <section className="panel">
            <div className="section-head">
              <h2>Qilingan ishlar galereyasi</h2>
              <span className="muted">Demo rasmlar orqali portfolio ko'rinish</span>
            </div>
            <div className="gallery-grid">
              {media.galleryImages.map((image, index) => (
                <figure key={image} className={`gallery-item gallery-item-${index + 1}`}>
                  <img src={image} alt={`${provider.full_name} portfolio ${index + 1}`} loading="lazy" />
                </figure>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2 className="mb-12">Sharhlar</h2>
            {reviews.length === 0 ? (
              <div className="empty-state">Hozircha sharhlar yo'q.</div>
            ) : (
              <div className="cards">
                {reviews.map((review) => (
                  <div key={review.id} className="card">
                    <h3 className="card-title">{review.rating} ⭐ baho</h3>
                    <p className="muted">{review.comment || 'Izoh qoldirilmagan'}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="panel" id="buyurtma">
            <h2 className="mb-12">Buyurtma yaratish</h2>
            {user?.role === 'user' ? (
              <form className="form" onSubmit={submitOrder}>
                <div className="field">
                  <label>Xizmat nomi</label>
                  <input
                    type="text"
                    placeholder="Masalan: Konditsionerni tekshirish"
                    value={orderForm.title}
                    onChange={(e) => setOrderForm({ ...orderForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Tafsilot</label>
                  <textarea
                    placeholder="Muammo yoki kerakli xizmat haqida yozing"
                    value={orderForm.description}
                    onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                  />
                </div>
                <div className="grid-2-compact">
                  <div className="field">
                    <label>Manzil</label>
                    <input
                      type="text"
                      placeholder="Manzil"
                      value={orderForm.address}
                      onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                    />
                  </div>
                  {/* <div className="field">
                    <label>Komissiya</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      value={orderForm.commission}
                      onChange={(e) => setOrderForm({ ...orderForm, commission: e.target.value })}
                    />
                  </div> */}
                </div>
                {error && <p className="error">{error}</p>}
                {message && <p className="success">{message}</p>}
                <button type="submit">Buyurtmani yuborish</button>
              </form>
            ) : (
              <div className="empty-state">
                Buyurtma berish uchun <Link to="/login">akkauntga kiring</Link>.
              </div>
            )}
          </section>
        </main>

        <aside className="profile-aside stack">
          <section className="panel order-card">
            <div className="section-head">
              <h3>Tezkor ma'lumot</h3>
              <span className="hero-chip">24/7 demo tizim</span>
            </div>
            <div className="soft-list">
              <div>
                <span>Kategoriya</span>
                <strong>{provider.category}</strong>
              </div>
              <div>
                <span>Hudud</span>
                <strong>{provider.location || 'Kiritilmagan'}</strong>
              </div>
              <div>
                <span>Yulduz</span>
                <strong>{provider.average_rating.toFixed(1)} / 5</strong>
              </div>
              <div>
                <span>Premium</span>
                <strong>{provider.premium ? 'Ha' : 'Yo\'q'}</strong>
              </div>
            </div>
          </section>

          <section className="panel">
            <h3 className="mb-12">Sharh qoldirish</h3>
            {user?.role === 'user' && eligibleOrders.length > 0 ? (
              <form className="form" onSubmit={submitReview}>
                <div className="field">
                  <label>Buyurtma</label>
                  <select
                    value={reviewForm.order_id}
                    onChange={(e) => setReviewForm({ ...reviewForm, order_id: e.target.value })}
                    required
                  >
                    <option value="">Buyurtmani tanlang</option>
                    {eligibleOrders.map((order) => (
                      <option key={order.id} value={order.id}>{order.title} (#{order.id})</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Baho</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} yulduz</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Izoh</label>
                  <textarea
                    placeholder="Sharhingiz"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  />
                </div>
                {error && <p className="error">{error}</p>}
                {message && <p className="success">{message}</p>}
                <button type="submit" className="full">Sharh yuborish</button>
              </form>
            ) : (
              <div className="empty-state">Sharh qoldirish uchun yakunlangan buyurtma kerak.</div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default ProviderProfilePage;
