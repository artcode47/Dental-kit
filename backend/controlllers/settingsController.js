const SettingsService = require('../services/settingsService');
const settingsService = new SettingsService();

exports.getSettings = async (req, res) => {
  try {
    const settings = await settingsService.getSettings();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updated = await settingsService.updateSettings(req.body || {});
    res.json({ message: 'Settings updated successfully', settings: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};




