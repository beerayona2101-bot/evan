import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { AuditLog } from '../models/AuditLog';
import { emitRealtimeEvent } from '../config/socket';
import { uploadImageToCloudinary } from '../utils/cloudinary';

// Helper for Audit Log
const createAuditLog = async (req: Request, action: string, details: string, targetId?: string) => {
  try {
    await AuditLog.create({
      user: (req as any).user?._id || null,
      adminName: (req as any).user?.name || 'Admin',
      action,
      details,
      targetId,
      ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
      userAgent: req.get('User-Agent') || 'Browser',
    });
  } catch (err) {
    console.error('AuditLog Error:', err);
  }
};

// GET /api/categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, featured, isLive, search, sort, includeArchived, includeDeleted } = req.query;

    const query: any = {};

    if (includeDeleted !== 'true') {
      query.deletedAt = null;
    }

    if (status) {
      query.status = status;
    } else if (includeArchived !== 'true') {
      query.status = { $ne: 'ARCHIVED' };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (isLive === 'true') {
      query.isLive = true;
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { name: searchRegex },
        { slug: searchRegex },
        { description: searchRegex },
      ];
    }

    let sortOption: any = { displayOrder: 1, name: 1 };
    if (sort === 'name') sortOption = { name: 1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'products') sortOption = { productCount: -1 };

    const categories = await Category.find(query).sort(sortOption).populate('parentCategory', 'name slug');

    // Update real product counts for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          $or: [
            { category: new RegExp(cat.name, 'i') },
            { category: cat.slug },
          ],
        });
        if (cat.productCount !== count) {
          cat.productCount = count;
          await cat.save();
        }
        return cat;
      })
    );

    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// GET /api/categories/:id
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const category = isObjectId
      ? await Category.findById(id).populate('parentCategory', 'name slug')
      : await Category.findOne({ slug: id }).populate('parentCategory', 'name slug');

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// POST /api/categories
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      slug,
      description,
      image,
      banner,
      status,
      isLive,
      featured,
      displayOrder,
      seoTitle,
      seoDescription,
      parentCategory,
    } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Category name is required' });
      return;
    }

    if (!image) {
      res.status(400).json({ message: 'Category image is required' });
      return;
    }

    const generatedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    const existingName = await Category.findOne({ name: name.trim() });
    if (existingName) {
      res.status(400).json({ message: 'Category with this name already exists' });
      return;
    }

    let finalImageUrl = image;
    if (image && image.startsWith('data:image/')) {
      const uploaded = await uploadImageToCloudinary(image, 'evan_categories');
      finalImageUrl = uploaded.url;
    }

    let finalBannerUrl = banner || '';
    if (banner && banner.startsWith('data:image/')) {
      const uploadedBanner = await uploadImageToCloudinary(banner, 'evan_categories');
      finalBannerUrl = uploadedBanner.url;
    }

    const category = new Category({
      name: name.trim(),
      slug: generatedSlug,
      description: description || '',
      image: finalImageUrl,
      banner: finalBannerUrl,
      status: status || 'ACTIVE',
      isLive: isLive !== undefined ? isLive : true,
      featured: featured || false,
      displayOrder: Number(displayOrder) || 0,
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || description || '',
      parentCategory: parentCategory || null,
      createdBy: (req as any).user?.name || 'Admin',
    });

    const createdCategory = await category.save();

    await createAuditLog(req, 'CREATE_CATEGORY', `Created category "${createdCategory.name}"`, String(createdCategory._id));
    emitRealtimeEvent('categoryCreated', createdCategory);
    emitRealtimeEvent('categoryUpdated', createdCategory);

    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// PUT /api/categories/:id
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    const fields = [
      'name', 'description', 'status', 'isLive',
      'featured', 'displayOrder', 'seoTitle', 'seoDescription', 'parentCategory'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (category as any)[field] = req.body[field];
      }
    });

    if (req.body.image && req.body.image.startsWith('data:image/')) {
      const uploaded = await uploadImageToCloudinary(req.body.image, 'evan_categories');
      category.image = uploaded.url;
    } else if (req.body.image) {
      category.image = req.body.image;
    }

    if (req.body.banner && req.body.banner.startsWith('data:image/')) {
      const uploadedBanner = await uploadImageToCloudinary(req.body.banner, 'evan_categories');
      category.banner = uploadedBanner.url;
    } else if (req.body.banner !== undefined) {
      category.banner = req.body.banner;
    }

    if (req.body.name && !req.body.slug) {
      category.slug = req.body.name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    } else if (req.body.slug) {
      category.slug = req.body.slug.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    const updatedCategory = await category.save();

    await createAuditLog(req, 'UPDATE_CATEGORY', `Updated category "${updatedCategory.name}"`, String(updatedCategory._id));
    emitRealtimeEvent('categoryUpdated', updatedCategory);

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// PATCH /api/categories/:id/status
export const patchCategoryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, isLive, featured } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    if (status !== undefined) category.status = status;
    if (isLive !== undefined) category.isLive = isLive;
    if (featured !== undefined) category.featured = featured;

    const updatedCategory = await category.save();

    await createAuditLog(
      req,
      'PATCH_CATEGORY_STATUS',
      `Updated status for "${updatedCategory.name}" (Status: ${updatedCategory.status}, Live: ${updatedCategory.isLive})`,
      String(updatedCategory._id)
    );
    emitRealtimeEvent('categoryUpdated', updatedCategory);

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// DELETE /api/categories/:id (Soft Delete with Safety Check)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Check if category contains active products
    const productCount = await Product.countDocuments({
      $or: [
        { category: new RegExp(category.name, 'i') },
        { category: category.slug },
      ],
    });

    if (productCount > 0 && req.query.force !== 'true') {
      res.status(400).json({
        hasProducts: true,
        productCount,
        message: `Category "${category.name}" contains ${productCount} products. Move or archive products before deleting.`,
        category,
      });
      return;
    }

    // Soft Delete
    category.deletedAt = new Date();
    category.status = 'ARCHIVED';
    category.isLive = false;
    await category.save();

    await createAuditLog(req, 'SOFT_DELETE_CATEGORY', `Archived category "${category.name}"`, String(category._id));
    emitRealtimeEvent('categoryDeleted', { _id: category._id, name: category.name });
    emitRealtimeEvent('categoryUpdated', category);

    res.json({ message: `Category "${category.name}" archived successfully`, category });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// POST /api/categories/:id/restore
export const restoreCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    category.deletedAt = null;
    category.status = 'ACTIVE';
    category.isLive = true;
    await category.save();

    await createAuditLog(req, 'RESTORE_CATEGORY', `Restored category "${category.name}"`, String(category._id));
    emitRealtimeEvent('categoryCreated', category);
    emitRealtimeEvent('categoryUpdated', category);

    res.json({ message: `Category "${category.name}" restored successfully`, category });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// DELETE /api/categories/:id/permanent
export const permanentDeleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    await createAuditLog(req, 'PERMANENT_DELETE_CATEGORY', `Permanently deleted category "${category.name}"`, id);
    emitRealtimeEvent('categoryDeleted', { _id: id, name: category.name });

    res.json({ message: `Category "${category.name}" permanently deleted` });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// POST /api/categories/upload-image
export const uploadCategoryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image } = req.body;
    if (!image) {
      res.status(400).json({ message: 'Image payload is required' });
      return;
    }
    const uploaded = await uploadImageToCloudinary(image, 'evan_categories');
    res.json({ imageUrl: uploaded.url, public_id: uploaded.public_id, success: true });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// POST /api/categories/bulk-action
export const bulkCategoryAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids, action, value } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: 'Category IDs array required' });
      return;
    }

    if (action === 'delete') {
      await Category.updateMany(
        { _id: { $in: ids } },
        { $set: { deletedAt: new Date(), status: 'ARCHIVED', isLive: false } }
      );
      await createAuditLog(req, 'BULK_DELETE_CATEGORIES', `Bulk archived ${ids.length} categories`);
    } else if (action === 'status') {
      await Category.updateMany({ _id: { $in: ids } }, { $set: { status: value } });
      await createAuditLog(req, 'BULK_STATUS_CATEGORIES', `Bulk updated status to ${value} for ${ids.length} categories`);
    } else if (action === 'live') {
      await Category.updateMany({ _id: { $in: ids } }, { $set: { isLive: Boolean(value) } });
      await createAuditLog(req, 'BULK_LIVE_CATEGORIES', `Bulk updated live state to ${value} for ${ids.length} categories`);
    }

    const updatedCategories = await Category.find({ _id: { $in: ids } });
    updatedCategories.forEach((cat) => emitRealtimeEvent('categoryUpdated', cat));

    res.json({ message: `Bulk action "${action}" completed for ${ids.length} categories` });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
