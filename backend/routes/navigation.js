const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const Navigation = require('../models/Navigation');

// Get navigation settings (public)
router.get('/', async (req, res) => {
  try {
    const navigation = await Navigation.findOne({ name: 'main', isActive: true });
    
    if (!navigation) {
      // Return default navigation if none exists
      return res.json({
        success: true,
        navigation: {
          name: 'main',
          items: [
            {
              _id: 'default-home',
              label: 'Home',
              url: '/',
              icon: 'home',
              type: 'link',
              order: 1,
              isActive: true,
              isExternal: false,
              target: '_self'
            }
          ]
        }
      });
    }

    res.json({
      success: true,
      navigation
    });
  } catch (error) {
    console.error('Error fetching navigation settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch navigation settings'
    });
  }
});

// Get navigation settings (admin)
router.get('/admin', auth, requireRole(['admin']), async (req, res) => {
  try {
    const navigation = await Navigation.findOne({ name: 'main' });
    
    if (!navigation) {
      // Create default navigation
      const defaultNavigation = new Navigation({
        name: 'main',
        items: [
          {
            label: 'Home',
            url: '/',
            icon: 'home',
            type: 'link',
            order: 1,
            isActive: true
          }
        ]
      });
      await defaultNavigation.save();
      
      return res.json({
        success: true,
        navigation: defaultNavigation
      });
    }

    res.json({
      success: true,
      navigation
    });
  } catch (error) {
    console.error('Error fetching admin navigation settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch navigation settings'
    });
  }
});

// Save navigation settings (admin only)
router.post('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { items } = req.body;
    
    // Validate navigation data
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.label || !item.url) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1} is missing required fields`
        });
      }
      
      if (item.label.length > 50) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1} label is too long (max 50 characters)`
        });
      }
    }

    // Update or create navigation
    let navigation = await Navigation.findOne({ name: 'main' });
    
    if (!navigation) {
      navigation = new Navigation({ name: 'main' });
    }

    // Update items with proper order
    navigation.items = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    await navigation.save();
    
    res.json({
      success: true,
      message: 'Navigation settings saved successfully',
      navigation
    });
  } catch (error) {
    console.error('Error saving navigation settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save navigation settings'
    });
  }
});

// Update specific navigation item (admin only)
router.put('/:itemId', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { itemId } = req.params;
    const updateData = req.body;
    
    const navigation = await Navigation.findOne({ name: 'main' });
    if (!navigation) {
      return res.status(404).json({
        success: false,
        message: 'Navigation not found'
      });
    }

    const itemIndex = navigation.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Navigation item not found'
      });
    }

    // Update the item
    navigation.items[itemIndex] = {
      ...navigation.items[itemIndex],
      ...updateData
    };

    await navigation.save();
    
    res.json({
      success: true,
      message: 'Navigation item updated successfully',
      item: navigation.items[itemIndex]
    });
  } catch (error) {
    console.error('Error updating navigation item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update navigation item'
    });
  }
});

// Delete navigation item (admin only)
router.delete('/:itemId', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const navigation = await Navigation.findOne({ name: 'main' });
    if (!navigation) {
      return res.status(404).json({
        success: false,
        message: 'Navigation not found'
      });
    }

    navigation.items = navigation.items.filter(item => item._id.toString() !== itemId);
    
    // Reorder remaining items
    navigation.items = navigation.items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    await navigation.save();
    
    res.json({
      success: true,
      message: 'Navigation item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting navigation item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete navigation item'
    });
  }
});

// Reorder navigation items (admin only)
router.post('/reorder', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { itemIds } = req.body;
    
    if (!Array.isArray(itemIds)) {
      return res.status(400).json({
        success: false,
        message: 'Item IDs must be an array'
      });
    }

    const navigation = await Navigation.findOne({ name: 'main' });
    if (!navigation) {
      return res.status(404).json({
        success: false,
        message: 'Navigation not found'
      });
    }

    // Create a map of current items
    const itemMap = new Map();
    navigation.items.forEach(item => {
      itemMap.set(item._id.toString(), item);
    });

    // Reorder items based on the provided order
    navigation.items = itemIds
      .map((id, index) => {
        const item = itemMap.get(id);
        if (item) {
          return { ...item, order: index + 1 };
        }
        return null;
      })
      .filter(Boolean);

    await navigation.save();
    
    res.json({
      success: true,
      message: 'Navigation items reordered successfully',
      navigation
    });
  } catch (error) {
    console.error('Error reordering navigation items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder navigation items'
    });
  }
});

module.exports = router; 