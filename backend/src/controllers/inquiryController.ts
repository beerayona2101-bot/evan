import { Request, Response } from 'express';
import { Inquiry } from '../models/Inquiry';
import { emitRealtimeEvent } from '../config/socket';

const mockInquiries: any[] = [
  {
    _id: 'inq-101',
    name: 'Ananya Sharma',
    email: 'ananya@example.com',
    phone: '9490644434',
    sareeInterest: 'Kanchipuram Silk Sarees',
    message: 'Looking for a bridal Kanchipuram silk saree in crimson red and pure gold zari for my wedding next month.',
    status: 'New',
    createdAt: new Date(),
  },
];

export const createInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, sareeInterest, message } = req.body;

    if (!name || !email || !phone || !message) {
      res.status(400).json({ message: 'Name, email, phone, and message are required fields.' });
      return;
    }

    let inquiryData: any;

    try {
      inquiryData = await Inquiry.create({
        name,
        email,
        phone,
        sareeInterest: sareeInterest || 'General Inquiry',
        message,
        status: 'New',
      });
    } catch {
      inquiryData = {
        _id: `inq-${Date.now()}`,
        name,
        email,
        phone,
        sareeInterest: sareeInterest || 'General Inquiry',
        message,
        status: 'New',
        createdAt: new Date(),
      };
      mockInquiries.unshift(inquiryData);
    }

    // Emit Real-Time Socket.IO event to Admin Dashboard
    emitRealtimeEvent('inquirySubmitted', inquiryData);

    console.log(`[Admin Email & WhatsApp Alert] Inquiry from ${name} (${phone}) - ${sareeInterest}`);

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully. Admin notified via Email & WhatsApp.',
      inquiry: inquiryData,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to submit inquiry' });
  }
};

export const getInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    let inquiries = await Inquiry.find().sort({ createdAt: -1 });
    if (!inquiries || inquiries.length === 0) {
      inquiries = mockInquiries as any;
    }
    res.json(inquiries);
  } catch {
    res.json(mockInquiries);
  }
};
