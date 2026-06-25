/**
 * Email Service
 * 
 * Handles all email notifications using SMTP
 * Supports: Daily reminders, weekly summaries, streak congratulations, at-risk alerts
 */

const nodemailer = require('nodemailer');

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@microtrainer.com';
const FROM_NAME = process.env.FROM_NAME || 'MicroTrainer';

/**
 * Send email via SMTP
 */
async function sendEmail(to, subject, htmlContent, textContent, options = {}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP email is not configured. Email not sent.');
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
      text: textContent,
      attachments: options.attachments || [],
    });

    console.log(`✅ Email sent to ${to}: ${subject}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send daily reminder email
 */
async function sendDailyReminder(studentEmail, studentName, streak, technology) {
  const subject = `🎯 Time to practice ${technology} - Keep your ${streak}-day streak!`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .streak { font-size: 48px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 MicroTrainer</h1>
          <p>Your Daily Practice Reminder</p>
        </div>
        <div class="content">
          <h2>Hi ${studentName}! 👋</h2>
          <p>It's time to practice <strong>${technology}</strong> and keep your streak alive!</p>
          
          <div class="streak">🔥 ${streak} Day Streak</div>
          
          <p>You've been doing great! Don't break your momentum now.</p>
          
          <p><strong>Today's Mini-Assessment is ready:</strong></p>
          <ul>
            <li>✅ 5-10 minutes</li>
            <li>✅ ${technology}-specific questions</li>
            <li>✅ Instant feedback</li>
          </ul>
          
          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/engagement" class="button">
              Start Today's Practice →
            </a>
          </center>
          
          <p style="margin-top: 30px; color: #666;">
            <em>"Success is the sum of small efforts repeated day in and day out."</em>
          </p>
        </div>
        <div class="footer">
          <p>© 2026 MicroTrainer. All rights reserved.</p>
          <p><a href="${process.env.FRONTEND_URL}/settings/notifications">Notification Preferences</a> | <a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `
Hi ${studentName}!

It's time to practice ${technology} and keep your ${streak}-day streak alive!

🔥 ${streak} Day Streak

You've been doing great! Don't break your momentum now.

Today's Mini-Assessment is ready:
- 5-10 minutes
- ${technology}-specific questions
- Instant feedback

Start practicing: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/engagement

"Success is the sum of small efforts repeated day in and day out."

---
© 2026 MicroTrainer. All rights reserved.
Notification Preferences: ${process.env.FRONTEND_URL}/settings/notifications
Unsubscribe: ${process.env.FRONTEND_URL}/unsubscribe
  `;
  
  return sendEmail(studentEmail, subject, htmlContent, textContent);
}

/**
 * Send weekly progress summary email
 */
async function sendWeeklySummary(studentEmail, studentName, weeklyStats) {
  const {
    activeDays,
    totalActivities,
    averageScore,
    currentStreak,
    technologiesPracticed,
    weakAreas,
    engagementScore
  } = weeklyStats;
  
  const subject = `📊 Your Weekly Progress Summary - ${activeDays}/7 days active`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .stat-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .stat-label { color: #666; font-size: 14px; }
        .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
        .tech-tag { display: inline-block; background: #e0e7ff; color: #4c51bf; padding: 5px 15px; margin: 5px; border-radius: 20px; }
        .weak-area { background: #fef2f2; color: #991b1b; padding: 5px 15px; margin: 5px; border-radius: 20px; display: inline-block; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Weekly Progress Report</h1>
          <p>Your learning journey this week</p>
        </div>
        <div class="content">
          <h2>Hi ${studentName}! 👋</h2>
          <p>Here's how you did this week:</p>
          
          <div class="stat-box">
            <div class="stat-label">Active Days</div>
            <div class="stat-value">${activeDays}/7 days</div>
          </div>
          
          <div class="stat-box">
            <div class="stat-label">Activities Completed</div>
            <div class="stat-value">${totalActivities}</div>
          </div>
          
          <div class="stat-box">
            <div class="stat-label">Average Score</div>
            <div class="stat-value">${Math.round(averageScore)}%</div>
          </div>
          
          <div class="stat-box">
            <div class="stat-label">Current Streak</div>
            <div class="stat-value">🔥 ${currentStreak} days</div>
          </div>
          
          <div class="stat-box">
            <div class="stat-label">Engagement Score</div>
            <div class="stat-value">${engagementScore}/100</div>
          </div>
          
          <h3>Technologies Practiced:</h3>
          <div>
            ${technologiesPracticed.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
          </div>
          
          ${weakAreas.length > 0 ? `
            <h3 style="margin-top: 30px;">⚠️ Areas Needing Practice:</h3>
            <div>
              ${weakAreas.map(area => `<span class="weak-area">${area}</span>`).join('')}
            </div>
          ` : ''}
          
          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/engagement" class="button">
              View Full Dashboard →
            </a>
          </center>
          
          <p style="margin-top: 30px; color: #666;">
            <strong>Keep it up!</strong> Consistency is the key to mastery.
          </p>
        </div>
        <div class="footer">
          <p>© 2026 MicroTrainer. All rights reserved.</p>
          <p><a href="${process.env.FRONTEND_URL}/settings/notifications">Notification Preferences</a> | <a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `
Weekly Progress Report

Hi ${studentName}!

Here's how you did this week:

Active Days: ${activeDays}/7 days
Activities Completed: ${totalActivities}
Average Score: ${Math.round(averageScore)}%
Current Streak: 🔥 ${currentStreak} days
Engagement Score: ${engagementScore}/100

Technologies Practiced: ${technologiesPracticed.join(', ')}

${weakAreas.length > 0 ? `Areas Needing Practice: ${weakAreas.join(', ')}` : ''}

View Full Dashboard: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/engagement

Keep it up! Consistency is the key to mastery.

---
© 2026 MicroTrainer. All rights reserved.
  `;
  
  return sendEmail(studentEmail, subject, htmlContent, textContent);
}

/**
 * Send streak congratulation email
 */
async function sendStreakCongratulations(studentEmail, studentName, streak) {
  const milestones = {
    7: { emoji: '⚡', title: 'Week Warrior', message: 'You practiced for 7 days straight!' },
    30: { emoji: '🏆', title: 'Month Master', message: 'An entire month of consistent practice!' },
    100: { emoji: '💯', title: 'Century Club', message: '100 days! You are unstoppable!' }
  };
  
  const milestone = milestones[streak] || { emoji: '🔥', title: 'Streak Master', message: `${streak} days of dedication!` };
  
  const subject = `${milestone.emoji} Congratulations! ${streak}-Day Streak Achievement!`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; text-align: center; border-radius: 0 0 10px 10px; }
        .badge { font-size: 120px; margin: 20px 0; }
        .streak-number { font-size: 72px; font-weight: bold; color: #f5576c; margin: 20px 0; }
        .button { display: inline-block; background: #f5576c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 CONGRATULATIONS! 🎉</h1>
          <p>${milestone.title}</p>
        </div>
        <div class="content">
          <div class="badge">${milestone.emoji}</div>
          
          <h2>Amazing, ${studentName}!</h2>
          
          <div class="streak-number">${streak} DAYS</div>
          
          <p style="font-size: 18px; margin: 20px 0;">
            <strong>${milestone.message}</strong>
          </p>
          
          <p>Your dedication and consistency are truly inspiring. You've proven that daily practice leads to mastery.</p>
          
          <p style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            💡 <strong>Fun Fact:</strong> It takes 66 days on average to form a new habit. You're ${streak >= 66 ? 'already there' : `${66 - streak} days away`}!
          </p>
          
          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/engagement" class="button">
              Keep The Streak Going! →
            </a>
          </center>
          
          <p style="margin-top: 30px; color: #666;">
            <em>"We are what we repeatedly do. Excellence, then, is not an act, but a habit." - Aristotle</em>
          </p>
        </div>
        <div class="footer">
          <p>© 2026 MicroTrainer. All rights reserved.</p>
          <p><a href="${process.env.FRONTEND_URL}/settings/notifications">Notification Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `
🎉 CONGRATULATIONS! 🎉
${milestone.title}

Amazing, ${studentName}!

${streak} DAYS

${milestone.message}

Your dedication and consistency are truly inspiring. You've proven that daily practice leads to mastery.

💡 Fun Fact: It takes 66 days on average to form a new habit. You're ${streak >= 66 ? 'already there' : `${66 - streak} days away`}!

Keep The Streak Going: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/engagement

"We are what we repeatedly do. Excellence, then, is not an act, but a habit." - Aristotle

---
© 2026 MicroTrainer. All rights reserved.
  `;
  
  return sendEmail(studentEmail, subject, htmlContent, textContent);
}

/**
 * Send at-risk alert email
 */
async function sendAtRiskAlert(studentEmail, studentName, daysSinceLastPractice, lostStreak) {
  const subject = `⚠️ We miss you! Your ${lostStreak}-day streak needs you`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #fff3cd; border-left: 4px solid #ffa726; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; background: #ffa726; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ We Miss You!</h1>
          <p>Come back and continue your journey</p>
        </div>
        <div class="content">
          <h2>Hi ${studentName},</h2>
          
          <div class="alert-box">
            <p style="margin: 0; font-size: 18px;">
              <strong>It's been ${daysSinceLastPractice} days since your last practice session.</strong>
            </p>
          </div>
          
          <p>You had an amazing <strong>${lostStreak}-day streak</strong> going! Don't let all that progress go to waste.</p>
          
          <p><strong>Remember why you started:</strong></p>
          <ul>
            <li>✅ Master new technologies</li>
            <li>✅ Ace technical interviews</li>
            <li>✅ Build consistent learning habits</li>
            <li>✅ Achieve your career goals</li>
          </ul>
          
          <p>Just <strong>5-10 minutes</strong> today can get you back on track!</p>
          
          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/engagement" class="button">
              Start Fresh Today →
            </a>
          </center>
          
          <p style="margin-top: 30px; background: #e3f2fd; padding: 15px; border-radius: 8px;">
            💪 <strong>Pro Tip:</strong> The hardest part is starting. Once you begin, momentum takes over!
          </p>
        </div>
        <div class="footer">
          <p>© 2026 MicroTrainer. All rights reserved.</p>
          <p><a href="${process.env.FRONTEND_URL}/settings/notifications">Notification Preferences</a> | <a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `
⚠️ We Miss You!

Hi ${studentName},

It's been ${daysSinceLastPractice} days since your last practice session.

You had an amazing ${lostStreak}-day streak going! Don't let all that progress go to waste.

Remember why you started:
- Master new technologies
- Ace technical interviews
- Build consistent learning habits
- Achieve your career goals

Just 5-10 minutes today can get you back on track!

Start Fresh Today: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/engagement

💪 Pro Tip: The hardest part is starting. Once you begin, momentum takes over!

---
© 2026 MicroTrainer. All rights reserved.
  `;
  
  return sendEmail(studentEmail, subject, htmlContent, textContent);
}

module.exports = {
  sendEmail,
  sendDailyReminder,
  sendWeeklySummary,
  sendStreakCongratulations,
  sendAtRiskAlert
};
