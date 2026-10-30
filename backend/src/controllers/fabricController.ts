import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Fabric } from '../models/Fabric';
import { Product } from '../models/Product';
import { emitRealtimeEvent } from '../config/socket';

const INITIAL_FABRICS = [
  'Pure Kanchipuram Silk',
  'Pure Handloom Silk',
  'Royal Banarasi Brocade Silk',
  'Pure Tussar Silk',
  'Pure Mulberry Silk',
  'Pure Handloom Linen',
  'Organic Mulmul Cotton',
  'Delicate Floral Organza',
  'Pure Chiffon Zari',
  'Faux Silk Georgette',
];

const FALLBACK_FABRICS = INITIAL_FABRICS.map((name, i) => ({
  _id: `fab-${i + 1}`,
  name,
  slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
  description: `Exquisite handcrafted ${name.toLowerCase()} featuring traditional zari and pure thread weave.`,
  image: `/images/saree_${i % 2 === 0 ? 'kanchipuram_gold' : 'banarasi_red'}.png`,
  banner: '',
  status: 'ACTIVE',
  featured: i < 6,
  displayOrder: i + 1,
  productCount: 4,
  createdBy: 'Admin',
  createdAt: new Date(),
  updatedAt: new Date(),
}));

export const getFabrics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json(FALLBACK_FABRICS);
      return;
    }

    // Auto-seed initial fabrics if DB collection is empty
    const existingCount = await Fabric.countDocuments();
    if (existingCount === 0) {
      const fabricDocs = INITIAL_FABRICS.map((name, i) => ({
        name,
        slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        description: `Exquisite handcrafted ${name.toLowerCase()} featuring traditional zari and pure thread weave.`,
        image: `/images/saree_${i % 2 === 0 ? 'kanchipuram_gold' : 'banarasi_red'}.png`,
        banner: '',
        status: 'ACTIVE',
        featured: i < 6,
        displayOrder: i + 1,
        productCount: 4,
        createdBy: 'Admin',
      }));
      await Fabric.create(fabricDocs);
    }

    const { status, featured, search, sort, includeArchived } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    } else if (includeArchived !== 'true') {
      query.status = { $ne: 'ARCHIVED' };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [{ name: searchRegex }, { slug: searchRegex }, { description: searchRegex }];
    }

    let sortOption: any = { displayOrder: 1, name: 1 };
    if (sort === 'name') sortOption = { name: 1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'products') sortOption = { productCount: -1 };

    const fabrics = await Fabric.find(query).sort(sortOption).lean();
    res.json(fabrics);
  } catch (error) {
    res.json(FALLBACK_FABRICS);
  }
};

export const getFabricById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const fabric = isObjectId
      ? await Fabric.findById(id)
      : await Fabric.findOne({ slug: id });

    if (!fabric) {
      res.status(404).json({ message: 'Fabric not found' });
      return;
    }

    res.json(fabric);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createFabric = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, image, banner, status, featured, displayOrder, seoTitle, seoDescription } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Fabric name is required' });
      return;
    }

    const generatedSlug = (slug || name).toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    if (mongoose.connection.readyState !== 1) {
      const fallbackNew: any = {
        _id: `fab-${Date.now()}`,
        name: name.trim(),
        slug: generatedSlug,
        description: description || '',
        image: image || '/images/saree_kanchipuram_gold.png',
        banner: banner || '',
        status: status || 'ACTIVE',
        featured: featured || false,
        displayOrder: Number(displayOrder) || 0,
        productCount: 0,
        createdBy: (req as any).user?.name || 'Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      FALLBACK_FABRICS.unshift(fallbackNew);
      emitRealtimeEvent('fabricCreated', fallbackNew);
      res.status(201).json(fallbackNew);
      return;
    }

    const fabric = new Fabric({
      name: name.trim(),
      slug: generatedSlug,
      description: description || '',
      image: image || '/images/saree_kanchipuram_gold.png',
      banner: banner || '',
      status: status || 'ACTIVE',
      featured: featured || false,
      displayOrder: Number(displayOrder) || 0,
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || description || '',
      createdBy: (req as any).user?.name || 'Admin',
    });

    const created = await fabric.save();
    emitRealtimeEvent('fabricCreated', created);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateFabric = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id.startsWith('fab-') || mongoose.connection.readyState !== 1) {
      const fallback = FALLBACK_FABRICS.find((f) => f._id === id || f.slug === id);
      if (fallback) {
        Object.assign(fallback, req.body);
        emitRealtimeEvent('fabricUpdated', fallback);
        res.json(fallback);
        return;
      }
    }

    const fabric = await Fabric.findById(id);
    if (!fabric) {
      res.status(404).json({ message: 'Fabric not found' });
      return;
    }

    Object.assign(fabric, req.body);
    if (req.body.name && !req.body.slug) {
      fabric.slug = req.body.name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    const updated = await fabric.save();
    emitRealtimeEvent('fabricUpdated', updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteFabric = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id.startsWith('fab-') || mongoose.connection.readyState !== 1) {
      const idx = FALLBACK_FABRICS.findIndex((f) => f._id === id || f.slug === id);
      if (idx !== -1) {
        const deleted = FALLBACK_FABRICS[idx];
        FALLBACK_FABRICS.splice(idx, 1);
        emitRealtimeEvent('fabricDeleted', { _id: id });
        res.json({ message: 'Fabric deleted successfully', fabric: deleted });
        return;
      }
    }

    const fabric = await Fabric.findById(id);
    if (!fabric) {
      res.status(404).json({ message: 'Fabric not found' });
      return;
    }

    fabric.status = 'ARCHIVED';
    fabric.deletedAt = new Date();
    await fabric.save();

    emitRealtimeEvent('fabricDeleted', { _id: id });
    res.json({ message: 'Fabric archived successfully', fabric });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
