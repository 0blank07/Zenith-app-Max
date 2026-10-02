'use server';

import { revalidatePath } from 'next/cache';
import { getBlogSessionUser } from '../../src/lib/server/blog/auth.mjs';
import * as faqRepo from '../../src/lib/server/redeem-codes/faq-repository.mjs';
import { REDEEM_ROUTE_CONFIG } from '../../src/lib/server/redeem-codes/constants.mjs';

async function requireAdmin() {
  const user = await getBlogSessionUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function createFaqAction(formData) {
  await requireAdmin();
  
  const scope = formData.get('scope');
  const question = formData.get('question');
  const answer = formData.get('answer');
  const orderIndex = parseInt(formData.get('order_index') || '0', 10);

  if (!scope || !question || !answer) {
    return { error: 'Scope, question, and answer are required.' };
  }

  await faqRepo.createFaq({ scope, question, answer, order_index: orderIndex });
  
  // Revalidate the affected scope path
  const route = Object.values(REDEEM_ROUTE_CONFIG).find(r => r.scope === scope);
  if (route) {
    revalidatePath(route.path);
  }
  revalidatePath('/admin/redeem-faq');
  
  return { success: true };
}

export async function updateFaqAction(id, formData) {
  await requireAdmin();
  
  const scope = formData.get('scope');
  const question = formData.get('question');
  const answer = formData.get('answer');
  const orderIndex = parseInt(formData.get('order_index') || '0', 10);

  if (!scope || !question || !answer) {
    return { error: 'Scope, question, and answer are required.' };
  }

  await faqRepo.updateFaq(id, { scope, question, answer, order_index: orderIndex });
  
  const route = Object.values(REDEEM_ROUTE_CONFIG).find(r => r.scope === scope);
  if (route) {
    revalidatePath(route.path);
  }
  revalidatePath('/admin/redeem-faq');
  
  return { success: true };
}

export async function deleteFaqAction(id, scope) {
  await requireAdmin();
  await faqRepo.deleteFaq(id);
  
  const route = Object.values(REDEEM_ROUTE_CONFIG).find(r => r.scope === scope);
  if (route) {
    revalidatePath(route.path);
  }
  revalidatePath('/admin/redeem-faq');
  
  return { success: true };
}
