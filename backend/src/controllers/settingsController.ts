import { Request, Response } from 'express';
import { Settings } from '../models/Settings';
import { emitRealtimeEvent } from '../config/socket';

export const getWhatsAppSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        whatsappNumber: '919490644434',
        whatsappGreeting: 'Hello EVAN Collections, I would like to know more about your sarees.',
        whatsappEnabled: true,
        whatsappPosition: 'bottom-right',
        whatsappColor: '#25D366',
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateWhatsAppSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { whatsappNumber, whatsappGreeting, whatsappEnabled, whatsappPosition, whatsappColor } = req.body;
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({
        whatsappNumber: whatsappNumber || '919490644434',
        whatsappGreeting: whatsappGreeting || 'Hello EVAN Collections, I would like to know more about your sarees.',
        whatsappEnabled: whatsappEnabled !== undefined ? whatsappEnabled : true,
        whatsappPosition: whatsappPosition || 'bottom-right',
        whatsappColor: whatsappColor || '#25D366',
      });
    } else {
      if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
      if (whatsappGreeting !== undefined) settings.whatsappGreeting = whatsappGreeting;
      if (whatsappEnabled !== undefined) settings.whatsappEnabled = whatsappEnabled;
      if (whatsappPosition !== undefined) settings.whatsappPosition = whatsappPosition;
      if (whatsappColor !== undefined) settings.whatsappColor = whatsappColor;
    }

    const updated = await settings.save();

    // Emit Socket.IO real-time event to all connected customer browser sessions
    emitRealtimeEvent('whatsappSettingsUpdated', updated);

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
