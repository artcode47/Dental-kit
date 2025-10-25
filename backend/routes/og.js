const express = require('express');
const router = express.Router();

// Simple dynamic OG image generator using Cloudinary URL-based transformations
// Expects CLOUDINARY_CLOUD_NAME set. Does not require API key for unsigned URL transforms.

router.get('/image', async (req, res) => {
  try {
    const {
      title = 'DentalKit',
      subtitle = '',
      image = 'https://dentalkit.com/Logo Lightmode.png',
      theme = 'light'
    } = req.query;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      return res.status(400).json({ message: 'Cloudinary not configured' });
    }

    // Build a Cloudinary URL overlaying title/subtitle text over a base image
    // Public, unsigned URL using fetch remote image
    const base = `https://res.cloudinary.com/${cloudName}/image/fetch`;
    const bg = encodeURIComponent(image);
    const textColor = theme === 'dark' ? 'white' : 'black';
    const overlayTitle = `l_text:Arial_60_bold:${encodeURIComponent(title)}`;
    const overlaySubtitle = subtitle
      ? `/l_text:Arial_30:${encodeURIComponent(subtitle)},co_${textColor},g_south,y_80`
      : '';
    const params = `w_1200,h_630,c_fill,q_auto,f_auto/co_${textColor},g_north,y_80,${overlayTitle}${overlaySubtitle}`;
    const url = `${base}/${params}/${bg}`;

    // Redirect so clients can use it as <meta og:image>
    res.redirect(302, url);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate OG image', error: error.message });
  }
});

module.exports = router;




