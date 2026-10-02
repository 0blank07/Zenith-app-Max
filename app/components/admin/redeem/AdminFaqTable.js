'use client';

import Link from 'next/link';

export default function AdminFaqTable({ faqs }) {
  if (!faqs || faqs.length === 0) {
    return (
      <div style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-dim)' }}>No FAQs found. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-surface)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
            <th style={{ padding: '16px', fontWeight: 600 }}>Scope / Region</th>
            <th style={{ padding: '16px', fontWeight: 600 }}>Question</th>
            <th style={{ padding: '16px', fontWeight: 600 }}>Order</th>
            <th style={{ padding: '16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {faqs.map((faq) => (
            <tr key={faq.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '16px' }}>
                <span style={{ 
                  background: 'rgba(0,194,168,0.1)', 
                  color: 'var(--color-primary)', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {faq.scope}
                </span>
              </td>
              <td style={{ padding: '16px' }}>{faq.question}</td>
              <td style={{ padding: '16px' }}>{faq.order_index}</td>
              <td style={{ padding: '16px', textAlign: 'right' }}>
                <Link 
                  href={`/admin/redeem-faq/edit/${faq.id}`}
                  style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
