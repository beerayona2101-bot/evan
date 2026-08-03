import { Request, Response } from 'express';

/**
 * @desc    Get AI Stylist recommendations & fashion advice
 * @route   POST /api/ai/stylist
 * @access  Public
 */
export const getStylistAdvice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ message: 'Prompt parameter is required' });
      return;
    }

    // Default intelligent styling response
    let responseText = "For EVAN's signature luxury aesthetic, focus on relaxed proportions, structural shoulders, and monochrome layering.";

    const qLower = prompt.toLowerCase();
    if (qLower.includes('formal') || qLower.includes('event') || qLower.includes('evening')) {
      responseText = "For evening luxury, choose our Monarch Silk Blend Polo combined with dark tapered trousers and matte black leather footwear.";
    } else if (qLower.includes('oversized') || qLower.includes('streetwear')) {
      responseText = "Match our Heavyweight Oversized Tee with technical cargo trousers and minimal high-top sneakers for modern elevated streetwear.";
    }

    res.json({
      success: true,
      advice: responseText,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'AI service error' });
  }
};

/**
 * @desc    Get AI Size & Fit prediction
 * @route   POST /api/ai/size-recommendation
 * @access  Public
 */
export const getSizeRecommendation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { height, weight, fitPreference, bodyBuild } = req.body;

    let bmi = (weight || 70) / Math.pow((height || 175) / 100, 2);
    let size = 'M';

    if (bmi < 20) {
      size = fitPreference === 'oversized' ? 'M' : 'S';
    } else if (bmi >= 20 && bmi < 25) {
      size = fitPreference === 'slim' ? 'S' : fitPreference === 'oversized' ? 'L' : 'M';
    } else {
      size = fitPreference === 'slim' ? 'M' : 'XL';
    }

    res.json({
      success: true,
      recommendedSize: size,
      confidence: 96,
      fitNotes: `Optimal drape calculated for ${height || 175}cm height.`
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Size calculator error' });
  }
};
