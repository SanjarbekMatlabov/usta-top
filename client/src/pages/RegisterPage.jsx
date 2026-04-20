import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || "Ro'yxatdan o'tishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page">
      <div className="center-card stack">
        <section className="hero">
          <h1 className="hero-title">Ro'yxatdan o'tish</h1>
          <p className="hero-subtitle">Foydalanuvchi yoki usta sifatida ro'yxatdan o'ting va platformadan foydalanishni boshlang.</p>
        </section>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Ism-familiya</label>
            <input
              type="text"
              placeholder="Ism-familiya"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Parol</label>
            <input
              type="password"
              placeholder="Parol (kamida 6 ta belgi)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div className="field">
            <label>Rol</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">Oddiy foydalanuvchi</option>
              <option value="provider">Usta (xizmat ko'rsatuvchi)</option>
            </select>
          </div>

          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Kutilmoqda...' : "Ro'yxatdan o'tish"}</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
