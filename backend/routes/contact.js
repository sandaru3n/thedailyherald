const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { auth } = require('../middleware/auth');

// Submit contact form (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Create contact message
    const contactData = {
      name,
      email,
      subject,
      message,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    const contact = new Contact(contactData);
    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.'
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

// Get all contact messages (admin only)
router.get('/admin', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const contacts = await Contact.find(filter)
      .populate('readBy', 'name')
      .populate('repliedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      contacts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: skip + contacts.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages'
    });
  }
});

// Get contact statistics (admin only)
router.get('/admin/stats', auth, async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Contact.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalContacts = await Contact.countDocuments();
    const unreadContacts = await Contact.countDocuments({ status: 'unread' });

    const statsObject = {
      total: totalContacts,
      unread: unreadContacts,
      read: 0,
      replied: 0,
      archived: 0
    };

    const priorityObject = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };

    stats.forEach(stat => {
      statsObject[stat._id] = stat.count;
    });

    priorityStats.forEach(stat => {
      priorityObject[stat._id] = stat.count;
    });

    res.json({
      success: true,
      stats: statsObject,
      priority: priorityObject
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
});

// Get single contact message (admin only)
router.get('/admin/:contactId', auth, async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findById(contactId)
      .populate('readBy', 'name')
      .populate('repliedBy', 'name');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Mark as read if not already read
    if (contact.status === 'unread') {
      contact.status = 'read';
      contact.readAt = new Date();
      contact.readBy = req.admin._id;
      await contact.save();
    }

    res.json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact message'
    });
  }
});

// Update contact message status (admin only)
router.patch('/admin/:contactId/status', auth, async (req, res) => {
  try {
    const { contactId } = req.params;
    const { status, priority } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    const contact = await Contact.findByIdAndUpdate(
      contactId,
      updateData,
      { new: true }
    ).populate('readBy', 'name').populate('repliedBy', 'name');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact message updated successfully',
      contact
    });
  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact message'
    });
  }
});

// Reply to contact message (admin only)
router.post('/admin/:contactId/reply', auth, async (req, res) => {
  try {
    const { contactId } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      contactId,
      {
        status: 'replied',
        replyMessage,
        repliedAt: new Date(),
        repliedBy: req.admin._id
      },
      { new: true }
    ).populate('readBy', 'name').populate('repliedBy', 'name');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Here you would typically send an email to the contact
    // For now, we'll just save the reply

    res.json({
      success: true,
      message: 'Reply sent successfully',
      contact
    });
  } catch (error) {
    console.error('Error replying to contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply'
    });
  }
});

// Delete contact message (admin only)
router.delete('/admin/:contactId', auth, async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findByIdAndDelete(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message'
    });
  }
});

module.exports = router; 