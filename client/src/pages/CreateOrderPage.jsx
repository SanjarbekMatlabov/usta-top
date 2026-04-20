import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

function CreateOrderPage() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    commission: 0,
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/orders', {
        provider_id: Number(providerId),
        title: form.title,
        description: form.description,
        address: form.address,
        commission: Number(form.commission),
      });
      navigate(`/providers/${providerId}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Buyurtma yaratishda xatolik');
    }
  };

  return (
    <div className="container page">
      <div className="center-card stack">
        <section className="hero">
          <h1 className="hero-title">Buyurtma yaratish</h1>
          <p className="hero-subtitle">Ustaga topshiriq haqida aniq ma'lumot bering, bu tezroq javob olishga yordam beradi.</p>
        </section>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Xizmat nomi</label>
            <input
              type="text"
              placeholder="Masalan: Oshxona elektr simini ta'mirlash"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Muammo tafsiloti</label>
            <textarea
              placeholder="Muammoni batafsil yozing"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Manzil</label>
            <input
              type="text"
              placeholder="Manzil"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          {/* <div className="field">
            <label>Komissiya (MVP)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              value={form.commission}
              onChange={(e) => setForm({ ...form, commission: e.target.value })}
            />
          </div> */}
          {error && <p className="error">{error}</p>}
          <button type="submit">Buyurtmani yuborish</button>
        </form>
      </div>
    </div>
  );
}

export default CreateOrderPage;
