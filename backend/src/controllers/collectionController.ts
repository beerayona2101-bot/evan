import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Collection } from '../models/Collection';
import { Product } from '../models/Product';
import { emitRealtimeEvent } from '../config/socket';

const INITIAL_COLLECTIONS = [
  'EVAN COLLECTION',
  'Bridal Heirloom Collection',
  'Festive Zari Showcase',
  'Artisan Designer Gallery',
];

const FALLBACK_COLLECTIONS = INITIAL_COLLECTIONS.map((name, i) => ({
  _id: `col-${i + 1}`,
  name,
  slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
  description: `Exclusive marketing showcase: ${name}`,
  coverImage: `/images/saree_${i % 2 === 0 ? 'banarasi_red' : 'kanchipuram_gold'}.png`,
  bannerImage: '',
  status: 'ACTIVE',
  featured: i === 0,
  displayOrder: i + 1,
  productCount: 4,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

export const getCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json(FALLBACK_COLLECTIONS);
      return;
    }

    const { status, featured, includeArchived } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    } else if (includeArchived !== 'true') {
      query.status = { $ne: 'ARCHIVED' };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    const collections = await Collection.find(query).sort({ displayOrder: 1, name: 1 }).lean();
    res.json(collections);
  } catch (error) {
    res.json(FALLBACK_COLLECTIONS);
  }
};

export const getCollectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const collection = isObjectId
      ? await Collection.findById(id)
      : await Collection.findOne({ slug: id });

    if (!collection) {
      res.status(404).json({ message: 'Collection not found' });
      return;
    }

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, coverImage, bannerImage, status, featured, displayOrder, seoTitle, seoDescription } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Collection name is required' });
      return;
    }

    const generatedSlug = (slug || name).toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    if (mongoose.connection.readyState !== 1) {
      const fallbackNew: any = {
        _id: `col-${Date.now()}`,
        name: name.trim(),
        slug: generatedSlug,
        description: description || '',
        coverImage: coverImage || '',
        bannerImage: bannerImage || '',
        status: status || 'ACTIVE',
        featured: featured || false,
        displayOrder: Number(displayOrder) || 0,
        productCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      FALLBACK_COLLECTIONS.unshift(fallbackNew);
      emitRealtimeEvent('collectionCreated', fallbackNew);
      res.status(201).json(fallbackNew);
      return;
    }

    const collection = new Collection({
      name: name.trim(),
      slug: generatedSlug,
      description: description || '',
      coverImage: coverImage || '',
      bannerImage: bannerImage || '',
      status: status || 'ACTIVE',
      featured: featured || false,
      displayOrder: Number(displayOrder) || 0,
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || description || '',
    });

    const created = await collection.save();
    emitRealtimeEvent('collectionCreated', created);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id.startsWith('col-') || mongoose.connection.readyState !== 1) {
      const fallback = FALLBACK_COLLECTIONS.find((c) => c._id === id || c.slug === id);
      if (fallback) {
        Object.assign(fallback, req.body);
        emitRealtimeEvent('collectionUpdated', fallback);
        res.json(fallback);
        return;
      }
    }

    const collection = await Collection.findById(id);
    if (!collection) {
      res.status(404).json({ message: 'Collection not found' });
      return;
    }

    Object.assign(collection, req.body);
    if (req.body.name && !req.body.slug) {
      collection.slug = req.body.name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    const updated = await collection.save();
    emitRealtimeEvent('collectionUpdated', updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id.startsWith('col-') || mongoose.connection.readyState !== 1) {
      const idx = FALLBACK_COLLECTIONS.findIndex((c) => c._id === id || c.slug === id);
      if (idx !== -1) {
        const deleted = FALLBACK_COLLECTIONS[idx];
        FALLBACK_COLLECTIONS.splice(idx, 1);
        emitRealtimeEvent('collectionDeleted', { _id: id });
        res.json({ message: 'Collection deleted successfully', collection: deleted });
        return;
      }
    }

    const collection = await Collection.findById(id);
    if (!collection) {
      res.status(404).json({ message: 'Collection not found' });
      return;
    }

    collection.status = 'ARCHIVED';
    collection.deletedAt = new Date();
    await collection.save();

    emitRealtimeEvent('collectionDeleted', { _id: id });
    res.json({ message: 'Collection archived successfully', collection });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
