const jwt = require('jsonwebtoken');
const UserService = require('../services/userService');
const OrderService = require('../services/orderService');
const ProductService = require('../services/productService');
const { getMessage } = require('./i18n');

const userService = new UserService();
const orderService = new OrderService();
const productService = new ProductService();

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
    const user = await userService.getById(decoded.userId);
    
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
    console.log(`User connected: ${socket.user.id}`);
    
    // Store user connection
    connectedUsers.set(socket.user.id, {
      socketId: socket.id,
      user: socket.user,
      connectedAt: new Date()
    });

    // Join user room
    socket.join(`user_${socket.user.id}`);

    // Join admin room if user is admin
    if (socket.user.role === 'admin') {
      adminUsers.add(socket.user.id);
      socket.join('admin_room');
    }

    // Handle order status updates
    socket.on('order_status_update', async (data) => {
      try {
        const { orderId, status, trackingNumber, trackingUrl } = data;
        
        const order = await orderService.getById(orderId);
        if (!order) {
          socket.emit('error', { message: 'socket.order_not_found' });
          return;
        }

        // Get user details
        const user = await userService.getById(order.userId);

        // Update order status
        const updateData = { status };
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (trackingUrl) updateData.trackingUrl = trackingUrl;
        
        if (status === 'shipped') {
          updateData.shippedAt = new Date();
        } else if (status === 'delivered') {
          updateData.deliveredAt = new Date();
        }

        await orderService.update(orderId, updateData);

        // Emit to specific user
        io.to(`user_${order.userId}`).emit('order_updated', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status,
          trackingNumber,
          trackingUrl,
          updatedAt: new Date()
        });

        // Emit to admin room
        io.to('admin_room').emit('order_status_changed', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: `${user.firstName} ${user.lastName}`,
          status,
          updatedAt: new Date()
        });

      } catch (error) {
        socket.emit('error', { message: 'socket.error_updating_order' });
      }
    });

    // Handle product stock updates
    socket.on('product_stock_update', async (data) => {
      try {
        const { productId, stock } = data;
        
        const product = await productService.getProductById(productId);
        if (!product) {
          socket.emit('error', { message: 'socket.product_not_found' });
          return;
        }

        await productService.updateStock(productId, stock, 'set');

        // Emit to admin room
        io.to('admin_room').emit('product_stock_changed', {
          productId: product.id,
          productName: product.name,
          stock,
          updatedAt: new Date()
        });

      } catch (error) {
        socket.emit('error', { message: 'socket.error_updating_stock' });
      }
    });

    // Handle user notifications
    socket.on('send_notification', async (data) => {
      try {
        const { userId, type, title, message, data: notificationData } = data;
        
        // Check if user is connected
        const userConnection = connectedUsers.get(userId);
        if (userConnection) {
          io.to(userConnection.socketId).emit('notification', {
            type,
            title,
            message,
            data: notificationData,
            timestamp: new Date()
          });
        }

      } catch (error) {
        socket.emit('error', { message: 'socket.error_sending_notification' });
      }
    });

    // Handle admin broadcasts
    socket.on('admin_broadcast', async (data) => {
      try {
        const { message, type = 'info' } = data;
        
        // Check if user is admin
        if (socket.user.role !== 'admin') {
          socket.emit('error', { message: 'socket.admin_only' });
          return;
        }

        // Broadcast to all connected users
        io.emit('admin_broadcast', {
          message,
          type,
          from: socket.user.firstName,
          timestamp: new Date()
        });

      } catch (error) {
        socket.emit('error', { message: 'socket.error_broadcasting' });
      }
    });

    // Handle user typing indicators
    socket.on('typing_start', (data) => {
      const { room } = data;
      socket.to(room).emit('user_typing', {
        userId: socket.user.id,
        userName: socket.user.firstName,
        room
      });
    });

    socket.on('typing_stop', (data) => {
      const { room } = data;
      socket.to(room).emit('user_stopped_typing', {
        userId: socket.user.id,
        room
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
      
      // Remove from connected users
      connectedUsers.delete(socket.user.id);
      
      // Remove from admin users if admin
      if (socket.user.role === 'admin') {
        adminUsers.delete(socket.user.id);
      }

      // Emit user disconnected to admin room
      io.to('admin_room').emit('user_disconnected', {
        userId: socket.user.id,
        userName: socket.user.firstName,
        disconnectedAt: new Date()
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', { message: 'socket.internal_error' });
    });
  });

  // Utility functions for external use
  const sendToUser = (userId, event, data) => {
    const userConnection = connectedUsers.get(userId);
    if (userConnection) {
      io.to(userConnection.socketId).emit(event, data);
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