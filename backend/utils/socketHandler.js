const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { getMessage } = require('./i18n');

// Store connected users
const connectedUsers = new Map();
const adminUsers = new Set();

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};

const socketHandler = (io) => {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);
    
    // Store user connection
    connectedUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      user: socket.user,
      connectedAt: new Date()
    });

    // Join user room
    socket.join(`user_${socket.user._id}`);

    // Join admin room if user is admin
    if (socket.user.role === 'admin') {
      adminUsers.add(socket.user._id.toString());
      socket.join('admin_room');
    }

    // Handle order status updates
    socket.on('order_status_update', async (data) => {
      try {
        const { orderId, status, trackingNumber, trackingUrl } = data;
        
        const order = await Order.findById(orderId).populate('user', 'email firstName lastName');
        if (!order) {
          socket.emit('error', { message: 'socket.order_not_found' });
          return;
        }

        // Update order status
        order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (trackingUrl) order.trackingUrl = trackingUrl;
        
        if (status === 'shipped') {
          order.shippedAt = new Date();
        } else if (status === 'delivered') {
          order.deliveredAt = new Date();
        }

        await order.save();

        // Emit to specific user
        io.to(`user_${order.user._id}`).emit('order_updated', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status,
          trackingNumber,
          trackingUrl,
          updatedAt: new Date()
        });

        // Emit to admin room
        io.to('admin_room').emit('order_status_changed', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          customerName: `${order.user.firstName} ${order.user.lastName}`,
          status,
          updatedAt: new Date()
        });

      } catch (error) {
        socket.emit('error', { message: 'socket.error_updating_order' });
      }
    });

    // Handle inventory updates
    socket.on('inventory_update', async (data) => {
      try {
        const { productId, stock } = data;
        
        const product = await Product.findById(productId);
        if (!product) {
          socket.emit('error', { message: 'socket.product_not_found' });
          return;
        }

        const oldStock = product.stock;
        product.stock = stock;
        await product.save();

        // Emit to all connected users
        io.emit('inventory_updated', {
          productId: product._id,
          productName: product.name,
          oldStock,
          newStock: stock,
          isLowStock: stock <= 10,
          isOutOfStock: stock === 0
        });

      } catch (error) {
        socket.emit('error', { message: 'socket.error_updating_inventory' });
      }
    });

    // Handle new order notifications
    socket.on('new_order', async (data) => {
      try {
        const { orderId } = data;
        
        const order = await Order.findById(orderId)
          .populate('user', 'email firstName lastName')
          .populate('items.product', 'name');

        if (!order) {
          socket.emit('error', { message: 'socket.order_not_found' });
          return;
        }

        // Emit to admin room
        io.to('admin_room').emit('new_order_received', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          customerName: `${order.user.firstName} ${order.user.lastName}`,
          customerEmail: order.user.email,
          total: order.total,
          items: order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price
          })),
          createdAt: order.createdAt
        });

      } catch (error) {
        socket.emit('error', { message: 'socket.error_processing_order' });
      }
    });

    // Handle chat messages
    socket.on('send_message', async (data) => {
      try {
        const { recipientId, message, type = 'text' } = data;
        
        const messageData = {
          senderId: socket.user._id,
          senderName: `${socket.user.firstName} ${socket.user.lastName}`,
          recipientId,
          message,
          type,
          timestamp: new Date()
        };

        // Send to recipient if online
        const recipientSocket = connectedUsers.get(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket.socketId).emit('new_message', messageData);
        }

        // Send back to sender for confirmation
        socket.emit('message_sent', messageData);

        // If recipient is admin, also send to admin room
        if (adminUsers.has(recipientId)) {
          io.to('admin_room').emit('admin_message', messageData);
        }

      } catch (error) {
        socket.emit('error', { message: 'socket.error_sending_message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { recipientId, isTyping } = data;
      
      const recipientSocket = connectedUsers.get(recipientId);
      if (recipientSocket) {
        io.to(recipientSocket.socketId).emit('user_typing', {
          userId: socket.user._id,
          userName: `${socket.user.firstName} ${socket.user.lastName}`,
          isTyping
        });
      }
    });

    // Handle product view tracking
    socket.on('product_viewed', async (data) => {
      try {
        const { productId } = data;
        
        // Update product view count
        await Product.findByIdAndUpdate(productId, {
          $inc: { viewCount: 1 }
        });

        // Emit to admin room for analytics
        io.to('admin_room').emit('product_viewed', {
          productId,
          userId: socket.user._id,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Error tracking product view:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
      
      // Remove from connected users
      connectedUsers.delete(socket.user._id.toString());
      
      // Remove from admin users if applicable
      if (adminUsers.has(socket.user._id.toString())) {
        adminUsers.delete(socket.user._id.toString());
      }
    });
  });

  // Utility functions to send notifications
  const sendToUser = (userId, event, data) => {
    const userSocket = connectedUsers.get(userId);
    if (userSocket) {
      io.to(userSocket.socketId).emit(event, data);
    }
  };

  const sendToAll = (event, data) => {
    io.emit(event, data);
  };

  const sendToAdmins = (event, data) => {
    io.to('admin_room').emit(event, data);
  };

  const getConnectedUsersCount = () => {
    return connectedUsers.size;
  };

  const getConnectedUsers = () => {
    return Array.from(connectedUsers.values());
  };

  return {
    sendToUser,
    sendToAll,
    sendToAdmins,
    getConnectedUsersCount,
    getConnectedUsers
  };
};

module.exports = socketHandler; 