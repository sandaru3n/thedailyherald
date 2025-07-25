const express = require('express');
const Category = require('../models/Category');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories - get all active categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      category
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   GET /api/categories/slug/:slug
// @desc    Get single category by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    
    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      category
    });

  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Admin only)
router.post('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const {
      name,
      description,
      color,
      icon,
      order
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: 'Category name is required'
      });
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        error: 'Category with this name already exists'
      });
    }

    // Create category
    const category = new Category({
      name,
      description,
      color: color || '#3B82F6',
      icon: icon || 'newspaper',
      order: order || 0
    });

    // Ensure slug is generated
    if (!category.slug) {
      category.slug = await Category.generateUniqueSlug(category.name);
    }

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Category with this slug already exists'
      });
    }
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Admin only)
router.put('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const {
      name,
      description,
      color,
      icon,
      order,
      isActive
    } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    // Check if name is being changed and if it conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          error: 'Category with this name already exists'
        });
      }
    }

    // Update category
    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (color) updates.color = color;
    if (icon) updates.icon = icon;
    if (order !== undefined) updates.order = order;
    if (isActive !== undefined) updates.isActive = isActive;

    // Apply updates to the category document
    Object.assign(category, updates);

    // Ensure slug is regenerated if name changed
    if (name && name !== category.name) {
      category.slug = await Category.generateUniqueSlug(name, category._id);
    }

    const updatedCategory = await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });

  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Category with this slug already exists'
      });
    }
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (Admin only)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    // Check if category has articles
    if (category.articleCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete category with existing articles. Please move or delete the articles first.'
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   PUT /api/categories/:id/toggle
// @desc    Toggle category active status
// @access  Private (Admin only)
router.put('/:id/toggle', auth, requireRole(['admin']), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json({
      success: true,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      category
    });

  } catch (error) {
    console.error('Toggle category error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   PUT /api/categories/reorder
// @desc    Reorder categories
// @access  Private (Admin only)
router.put('/reorder', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({
        error: 'Categories array is required'
      });
    }

    // Update order for each category
    const updatePromises = categories.map(({ id, order }) => 
      Category.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    // Get updated categories
    const updatedCategories = await Category.find()
      .sort('order')
      .select('-__v');

    res.json({
      success: true,
      message: 'Categories reordered successfully',
      categories: updatedCategories
    });

  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

module.exports = router; 