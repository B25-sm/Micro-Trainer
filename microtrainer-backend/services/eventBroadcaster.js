/**
 * Event Broadcaster
 * 
 * Broadcasts real-time events to connected clients via Socket.io
 */

/**
 * Broadcast status update to student and admins
 */
function broadcastStatusUpdate(studentId, statusData) {
  if (!global.io) {
    console.warn('Socket.io not initialized');
    return;
  }
  
  // Broadcast to student
  global.io.to(`student:${studentId}`).emit('status:update', {
    studentId,
    ...statusData,
    timestamp: new Date().toISOString()
  });
  
  // Broadcast to admins
  global.io.to('admin').emit('student:status_change', {
    studentId,
    ...statusData,
    timestamp: new Date().toISOString()
  });
  
  console.log(`📡 Broadcasted status update for student ${studentId}`);
}

/**
 * Broadcast activity completion
 */
function broadcastActivityCompleted(studentId, activityData) {
  if (!global.io) {
    console.warn('Socket.io not initialized');
    return;
  }
  
  const event = {
    studentId,
    ...activityData,
    timestamp: new Date().toISOString()
  };
  
  // Broadcast to student
  global.io.to(`student:${studentId}`).emit('activity:completed', event);
  
  // Broadcast to admins
  global.io.to('admin').emit('student:activity', event);
  
  console.log(`📡 Broadcasted activity completion for student ${studentId}`);
}

/**
 * Broadcast streak update
 */
function broadcastStreakUpdate(studentId, streakData) {
  if (!global.io) {
    console.warn('Socket.io not initialized');
    return;
  }
  
  const event = {
    studentId,
    ...streakData,
    timestamp: new Date().toISOString()
  };
  
  // Broadcast to student
  global.io.to(`student:${studentId}`).emit('streak:updated', event);
  
  // Broadcast to admins
  global.io.to('admin').emit('student:streak_update', event);
  
  console.log(`📡 Broadcasted streak update for student ${studentId}`);
}

/**
 * Broadcast badge earned
 */
function broadcastBadgeEarned(studentId, badgeData) {
  if (!global.io) {
    console.warn('Socket.io not initialized');
    return;
  }
  
  const event = {
    studentId,
    ...badgeData,
    timestamp: new Date().toISOString()
  };
  
  // Broadcast to student
  global.io.to(`student:${studentId}`).emit('badge:earned', event);
  
  // Broadcast to admins
  global.io.to('admin').emit('student:badge_earned', event);
  
  console.log(`📡 Broadcasted badge earned for student ${studentId}`);
}

/**
 * Broadcast assessment available
 */
function broadcastAssessmentAvailable(studentId, assessmentData) {
  if (!global.io) {
    console.warn('Socket.io not initialized');
    return;
  }
  
  const event = {
    studentId,
    ...assessmentData,
    timestamp: new Date().toISOString()
  };
  
  // Broadcast to student
  global.io.to(`student:${studentId}`).emit('assessment:available', event);
  
  console.log(`📡 Broadcasted assessment available for student ${studentId}`);
}

/**
 * Broadcast at-risk alert to admins
 */
function broadcastAtRiskAlert(studentId, alertData) {
  if (!global.io) {
    console.warn('Socket.io not initialized');
    return;
  }
  
  const event = {
    studentId,
    ...alertData,
    timestamp: new Date().toISOString()
  };
  
  // Broadcast to admins only
  global.io.to('admin').emit('alert:at_risk', event);
  
  console.log(`📡 Broadcasted at-risk alert for student ${studentId}`);
}

module.exports = {
  broadcastStatusUpdate,
  broadcastActivityCompleted,
  broadcastStreakUpdate,
  broadcastBadgeEarned,
  broadcastAssessmentAvailable,
  broadcastAtRiskAlert
};
