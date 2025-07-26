const request = require('supertest');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../app');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const server = createServer(app);
const io = new Server(server);

describe('Socket.io Tests', () => {
  let testUser, testProduct, testOrder, authToken, clientSocket;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      isVerified: true
    });

    // Create test product
    testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 50,
      sku: 'TEST-001',
      slug: 'test-product',
      category: new mongoose.Types.ObjectId(),
      vendor: new mongoose.Types.ObjectId()
    });

    // Create test order
    testOrder = await Order.create({
      orderNumber: 'TEST-ORDER-001',
      user: testUser._id,
      items: [{
        product: testProduct._id,
        name: testProduct.name,
        sku: testProduct.sku,
        quantity: 1,
        price: testProduct.price,
        total: testProduct.price,
        vendor: new mongoose.Types.ObjectId()
      }],
      subtotal: testProduct.price,
      total: testProduct.price,
      paymentMethod: 'stripe',
      shippingMethod: 'standard'
    });

    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await mongoose.connection.close();
    server.close();
  });

  beforeEach((done) => {
    clientSocket = Client(`http://localhost:${server.address().port}`, {
      auth: { token: authToken }
    });
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  describe('Connection Tests', () => {
    test('should connect with valid token', (done) => {
      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });
    });

    test('should reject connection without token', (done) => {
      const unauthorizedSocket = Client(`http://localhost:${server.address().port}`);
      
      unauthorizedSocket.on('connect_error', (error) => {
        expect(error.message).toBe('Authentication error');
        unauthorizedSocket.disconnect();
        done();
      });
    });
  });

  describe('Order Status Updates', () => {
    test('should emit order status update', (done) => {
      clientSocket.emit('order_status_update', {
        orderId: testOrder._id,
        status: 'shipped',
        trackingNumber: 'TRACK123'
      });

      clientSocket.on('order_updated', (data) => {
        expect(data.orderId).toBe(testOrder._id.toString());
        expect(data.status).toBe('shipped');
        expect(data.trackingNumber).toBe('TRACK123');
        done();
      });
    });

    test('should handle invalid order ID', (done) => {
      clientSocket.emit('order_status_update', {
        orderId: new mongoose.Types.ObjectId(),
        status: 'shipped'
      });

      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Order not found');
        done();
      });
    });
  });

  describe('Inventory Updates', () => {
    test('should emit inventory update', (done) => {
      clientSocket.emit('inventory_update', {
        productId: testProduct._id,
        stock: 25
      });

      clientSocket.on('inventory_updated', (data) => {
        expect(data.productId).toBe(testProduct._id.toString());
        expect(data.newStock).toBe(25);
        expect(data.isLowStock).toBe(false);
        done();
      });
    });

    test('should detect low stock', (done) => {
      clientSocket.emit('inventory_update', {
        productId: testProduct._id,
        stock: 5
      });

      clientSocket.on('inventory_updated', (data) => {
        expect(data.isLowStock).toBe(true);
        done();
      });
    });
  });

  describe('Product View Tracking', () => {
    test('should track product view', (done) => {
      clientSocket.emit('product_viewed', {
        productId: testProduct._id
      });

      // Wait a bit for the async operation
      setTimeout(async () => {
        const updatedProduct = await Product.findById(testProduct._id);
        expect(updatedProduct.views).toBe(testProduct.views + 1);
        done();
      }, 100);
    });
  });

  describe('Chat Messages', () => {
    test('should send and receive messages', (done) => {
      const messageData = {
        recipientId: testUser._id,
        message: 'Hello, this is a test message',
        type: 'text'
      };

      clientSocket.emit('send_message', messageData);

      clientSocket.on('message_sent', (data) => {
        expect(data.senderId).toBe(testUser._id.toString());
        expect(data.message).toBe(messageData.message);
        expect(data.type).toBe('text');
        done();
      });
    });
  });

  describe('Typing Indicators', () => {
    test('should emit typing status', (done) => {
      clientSocket.emit('typing', {
        recipientId: testUser._id,
        isTyping: true
      });

      clientSocket.on('user_typing', (data) => {
        expect(data.userId).toBe(testUser._id.toString());
        expect(data.isTyping).toBe(true);
        done();
      });
    });
  });
}); 