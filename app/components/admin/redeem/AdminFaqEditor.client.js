'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFaqAction, updateFaqAction, deleteFaqAction } from '../../../actions/redeem-faq';
import Link from 'next/link';

const SCOPES = [
  { value: 'global', label: 'Global (English)' },
  { value: 'thailand', label: 'Thailand' },
  { value: 'uae', label: 'UAE (Arabic)' },
  { value: 'spain', label: 'Spain' },
  { value: 'indonesia', label: 'Indonesia' },
  { value: 'malaysia', label: 'Malaysia' },
  { value: 'vietnam', label: 'Vietnam' },
  { value: 'portugal', label: 'Portugal' },
  { value: 'germany', label: 'Germany' },
  { value: 'turkey', label: 'Turkey' },
  { value: 'russia', label: 'Russia' },
];

export default function AdminFaqEditor({ initialData = null }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      let res;
      if (initialData) {
        res = await updateFaqAction(initialData.id, formData);
      } else {
        res = await createFaqAction(formData);
      }
      
      if (res.error) {
        setError(res.error);
        setIsSubmitting(false);
      } else {
        router.push('/admin/redeem-faq');
        router.refresh();
      }
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    setIsSubmitting(true);
    try {
      const res = await deleteFaqAction(initialData.id, initialData.scope);
      if (res.error) {
        setError(res.error);
        setIsSubmitting(false);
      } else {
        router.push('/admin/redeem-faq');
        router.refresh();
      }
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
      {error && <div style={{ background: '#ff444422', color: '#ff4444', padding: '12px', borderRadius: '4px' }}>{error}</div>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label htmlFor="scope" style={{ fontWeight: 600 }}>Region Scope</label>
        <select 
          name="scope" 
          id="scope" 
          defaultValue={initialData?.scope || 'global'} 
          required
          style={{ padding: '10px', background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '4px' }}
        >
          {SCOPES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>Select which locale this FAQ will appear on.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label htmlFor="question" style={{ fontWeight: 600 }}>Question</label>
        <input 
          type="text" 
          name="question" 
          id="question" 
          defaultValue={initialData?.question || ''} 
          required
          placeholder="e.g. How do I redeem this code?"
          style={{ padding: '10px', background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '4px' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label htmlFor="answer" style={{ fontWeight: 600 }}>Answer</label>
        <textarea 
          name="answer" 
          id="answer" 
          defaultValue={initialData?.answer || ''} 
          required
          rows="4"
          placeholder="Enter the answer here..."
          style={{ padding: '10px', background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '4px', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label htmlFor="order_index" style={{ fontWeight: 600 }}>Order Index</label>
        <input 
          type="number" 
          name="order_index" 
          id="order_index" 
          defaultValue={initialData?.order_index || 0} 
          required
          style={{ padding: '10px', background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '4px' }}
        />
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>Lower numbers appear first.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ background: 'var(--color-primary)', color: '#000', padding: '10px 24px', borderRadius: '4px', border: 'none', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update FAQ' : 'Create FAQ')}
        </button>
        
        {initialData && (
          <button 
            type="button" 
            onClick={handleDelete}
            disabled={isSubmitting}
            style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: '10px 24px', borderRadius: '4px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            Delete
          </button>
        )}
        
        <Link 
          href="/admin/redeem-faq" 
          style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-dim)', textDecoration: 'none', marginLeft: 'auto' }}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
