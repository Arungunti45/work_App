import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

const db = admin.firestore();

const initialCategories = [
  { id: 'cat_construction', name: 'Construction', slug: 'construction', type: 'Main Category' },
  { id: 'cat_hospitality', name: 'Hospitality', slug: 'hospitality', type: 'Main Category' },
  { id: 'cat_office', name: 'Office', slug: 'office', type: 'Main Category' },
  { id: 'cat_other', name: 'Other Jobs', slug: 'other-jobs', type: 'Main Category' },
  
  // Subcategories
  { id: 'sub_plumber', name: 'Plumber', slug: 'plumber', type: 'Subcategory', parentCategoryId: 'cat_construction' },
  { id: 'sub_electrician', name: 'Electrician', slug: 'electrician', type: 'Subcategory', parentCategoryId: 'cat_construction' },
  { id: 'sub_mason', name: 'Mason', slug: 'mason', type: 'Subcategory', parentCategoryId: 'cat_construction' },
  { id: 'sub_carpenter', name: 'Carpenter', slug: 'carpenter', type: 'Subcategory', parentCategoryId: 'cat_construction' },
  { id: 'sub_painter', name: 'Painter', slug: 'painter', type: 'Subcategory', parentCategoryId: 'cat_construction' },
  { id: 'sub_daily_labour', name: 'Daily Labour', slug: 'daily-labour', type: 'Subcategory', parentCategoryId: 'cat_construction' },
  
  { id: 'sub_cook', name: 'Cook', slug: 'cook', type: 'Subcategory', parentCategoryId: 'cat_hospitality' },
  { id: 'sub_hotel_worker', name: 'Hotel Worker', slug: 'hotel-worker', type: 'Subcategory', parentCategoryId: 'cat_hospitality' },
  
  { id: 'sub_data_entry', name: 'Data Entry', slug: 'data-entry', type: 'Subcategory', parentCategoryId: 'cat_office' },
  { id: 'sub_receptionist', name: 'Receptionist', slug: 'receptionist', type: 'Subcategory', parentCategoryId: 'cat_office' },
  
  { id: 'sub_driver', name: 'Driver', slug: 'driver', type: 'Subcategory', parentCategoryId: 'cat_other' },
  { id: 'sub_delivery', name: 'Delivery Worker', slug: 'delivery-worker', type: 'Subcategory', parentCategoryId: 'cat_other' },
  { id: 'sub_security', name: 'Security Guard', slug: 'security-guard', type: 'Subcategory', parentCategoryId: 'cat_other' },
];

const initialSkills = [
  { id: 'skill_plumbing', name: 'Plumbing', slug: 'plumbing', categoryId: 'sub_plumber' },
  { id: 'skill_wiring', name: 'Electrical Wiring', slug: 'electrical-wiring', categoryId: 'sub_electrician' },
  { id: 'skill_driving', name: 'Driving', slug: 'driving', categoryId: 'sub_driver' },
  { id: 'skill_cleaning', name: 'Cleaning', slug: 'cleaning', categoryId: 'cat_hospitality' },
];

export const seedDatabase = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  
  const userDoc = await db.collection('users').doc(request.auth.uid).get();
  if (userDoc.data()?.role !== 'ADMIN') {
    throw new HttpsError('permission-denied', 'Must be an admin to seed database.');
  }

  const batch = db.batch();

  for (const cat of initialCategories) {
    const ref = db.collection('categories').doc(cat.id);
    batch.set(ref, {
      ...cat,
      status: 'ACTIVE',
      sortOrder: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  for (const skill of initialSkills) {
    const ref = db.collection('skills').doc(skill.id);
    batch.set(ref, {
      ...skill,
      status: 'ACTIVE',
      sortOrder: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  await batch.commit();

  return { success: true, message: 'Database seeded successfully with initial categories and skills.' };
});
