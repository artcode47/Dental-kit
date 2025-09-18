const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'dental-kit-41955'
  });
}

const db = admin.firestore();

async function createIndexes() {
  try {
    console.log('Creating Firestore indexes...');

    // Create products index
    const productsIndex = {
      collectionGroup: 'products',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'createdAt', order: 'ASCENDING' },
        { fieldPath: 'stock', order: 'ASCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    };

    // Create orders index
    const ordersIndex = {
      collectionGroup: 'orders',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    };

    // Create the indexes
    const [productsIndexOp] = await db.createIndex(productsIndex);
    console.log('Products index creation started:', productsIndexOp.name);

    const [ordersIndexOp] = await db.createIndex(ordersIndex);
    console.log('Orders index creation started:', ordersIndexOp.name);

    // Wait for indexes to be created
    console.log('Waiting for indexes to be created...');
    await productsIndexOp.promise();
    await ordersIndexOp.promise();

    console.log('All indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

createIndexes();
