import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Occasion } from '../models/Occasion';
import { Product } from '../models/Product';
import { emitRealtimeEvent } from '../config/socket';

const INITIAL_OCCASIONS = [
  'Bridal & Wedding',
  'Festival & Evening',
  'Party Wear',
  'Office Wear',
  'Daily Wear',
];

const FALLBACK_OCCASIONS = INITIAL_OCCASIONS.map((name, i) => ({
  _id: `occ-${i + 1}`,
  name,
  slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
  description: `Exclusive ${name.toLowerCase()} saree collection curated for special moments.`,
  image: `/images/saree_${i % 2 === 0 ? 'kanchipuram_gold' : 'banarasi_red'}.png`,
  status: 'ACTIVE',
  displayOrder: i + 1,
  productCount: 4,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

export const getOccasions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json(FALLBACK_OCCASIONS);
      return;
    }

    // Auto-seed initial occasions if DB collection is empty
    const existingCount = await Occasion.countDocuments();
    if (existingCount === 0) {
      const occasionDocs = INITIAL_OCCASIONS.map((name, i) => ({
        name,
        slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        description: `Exclusive ${name.toLowerCase()} saree collection curated for special moments.`,
        image: `/images/saree_${i % 2 === 0 ? 'kanchipuram_gold' : 'banarasi_red'}.png`,
        status: 'ACTIVE',
        displayOrder: i + 1,
        productCount: 4,
      }));
      await Occasion.create(occasionDocs);
    }

    const { status, includeArchived } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    } else if (includeArchived !== 'true') {
      query.status = { $ne: 'ARCHIVED' };
    }

    const occasions = await Occasion.find(query).sort({ displayOrder: 1, name: 1 }).lean();
    res.json(occasions);
  } catch (error) {
    res.json(FALLBACK_OCCASIONS);
  }
};

export const getOccasionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const occasion = isObjectId
      ? await Occasion.findById(id)
      : await Occasion.findOne({ slug: id });

    if (!occasion) {
      res.status(404).json({ message: 'Occasion not found' });
      return;
    }

    res.json(occasion);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createOccasion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, image, status, displayOrder } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Occasion name is required' });
      return;
    }

    const generatedSlug = (slug || name).toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    if (mongoose.connection.readyState !== 1) {
      const fallbackNew: any = {
        _id: `occ-${Date.now()}`,
        name: name.trim(),
        slug: generatedSlug,
        description: description || '',
        image: image || '',
        status: status || 'ACTIVE',
        displayOrder: Number(displayOrder) || 0,
        productCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      FALLBACK_OCCASIONS.unshift(fallbackNew);
      emitRealtimeEvent('occasionCreated', fallbackNew);
      res.status(201).json(fallbackNew);
      return;
    }

    const occasion = new Occasion({
      name: name.trim(),
      slug: generatedSlug,
      description: description || '',
      image: image || '',
      status: status || 'ACTIVE',
      displayOrder: Number(displayOrder) || 0,
    });

    const created = await occasion.save();
    emitRealtimeEvent('occasionCreated', created);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateOccasion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id.startsWith('occ-') || mongoose.connection.readyState !== 1) {
      const fallback = FALLBACK_OCCASIONS.find((o) => o._id === id || o.slug === id);
      if (fallback) {
        Object.assign(fallback, req.body);
        emitRealtimeEvent('occasionUpdated', fallback);
        res.json(fallback);
        return;
      }
    }

    const occasion = await Occasion.findById(id);
    if (!occasion) {
      res.status(404).json({ message: 'Occasion not found' });
      return;
    }

    Object.assign(occasion, req.body);
    if (req.body.name && !req.body.slug) {
      occasion.slug = req.body.name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    const updated = await occasion.save();
    emitRealtimeEvent('occasionUpdated', updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteOccasion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id.startsWith('occ-') || mongoose.connection.readyState !== 1) {
      const idx = FALLBACK_OCCASIONS.findIndex((o) => o._id === id || o.slug === id);
      if (idx !== -1) {
        const deleted = FALLBACK_OCCASIONS[idx];
        FALLBACK_OCCASIONS.splice(idx, 1);
        emitRealtimeEvent('occasionDeleted', { _id: id });
        res.json({ message: 'Occasion deleted successfully', occasion: deleted });
        return;
      }
    }

    const occasion = await Occasion.findById(id);
    if (!occasion) {
      res.status(404).json({ message: 'Occasion not found' });
      return;
    }

    occasion.status = 'ARCHIVED';
    occasion.deletedAt = new Date();
    await occasion.save();

    emitRealtimeEvent('occasionDeleted', { _id: id });
    res.json({ message: 'Occasion archived successfully', occasion });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
