const DataProviders = require('../../services/dataprovider.service');

/**
 * Data Provider Controller
 * Provides data for dropdowns and select fields in forms using the registry
 */
class DataProviderController {
  /**
   * List all available data sources
   * Returns the registry of available sources for the frontend builder
   */
  static async listSources(req, res) {
    try {
      const sources = DataProviders.listSources();
      return res.status(200).json({
        success: true,
        data: sources
      });
    } catch (error) {
      console.error('[DataProvider] Error listing sources:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to list data sources',
        error: error.message
      });
    }
  }

  /**
   * Get data by source type
   * Uses the registry to fetch data from the appropriate source
   */
  static async getDataBySource(req, res) {
    try {
      const { source } = req.params;
      const filterParams = req.query; // e.g., { parent_id: '123' }

      // Fetch data using the registry
      const data = await DataProviders.fetchData(source, filterParams);

      return res.status(200).json({
        success: true,
        data: data,
        count: data.length,
        source: source
      });
    } catch (error) {
      console.error('[DataProvider] Error fetching data:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to fetch data from source: ${req.params.source}`,
        error: error.message
      });
    }
  }

  /**
   * Get multiple data sources at once
   * Useful for prefetching multiple dropdowns
   */
  static async getMultipleSources(req, res) {
    try {
      const { sources } = req.body; // Array of source keys: ['users', 'roles']

      if (!Array.isArray(sources) || sources.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'sources must be a non-empty array'
        });
      }

      const results = {};
      const promises = sources.map(async (sourceKey) => {
        try {
          results[sourceKey] = await DataProviders.fetchData(sourceKey);
        } catch (error) {
          console.error(`[DataProvider] Error fetching ${sourceKey}:`, error);
          results[sourceKey] = [];
        }
      });

      await Promise.all(promises);

      return res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('[DataProvider] Error in getMultipleSources:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch data sources',
        error: error.message
      });
    }
  }
}

module.exports = DataProviderController;
