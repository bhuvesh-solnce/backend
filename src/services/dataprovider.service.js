const { db } = require('../models');

/**
 * DATA PROVIDER REGISTRY
 * 
 * To add a new database connection:
 * 1. Add the key and label to 'listSources'.
 * 2. Add the fetching logic to 'fetchData'.
 */
const DataProviders = {
    
    // 1. List available sources for the Frontend Builder
    listSources: () => [
        { key: 'users', label: 'System Users', description: 'Active users in the system' },
        { key: 'roles', label: 'System Roles', description: 'Available user roles' },
        // System Datasets
        { key: 'panel_types', label: 'Panel Types', description: 'Solar panel types (Monocrystalline, Polycrystalline, etc.)' },
        { key: 'watt_peaks', label: 'Watt Peaks', description: 'Panel watt peak values' },
        { key: 'panel_companies', label: 'Panel Companies', description: 'Solar panel manufacturing companies' },
        { key: 'inverter_companies', label: 'Inverter Companies', description: 'Solar inverter manufacturing companies' },
        { key: 'electricity_providers', label: 'Electricity Providers', description: 'Electricity distribution companies (DisComs)' },
        // Location Datasets
        { key: 'states', label: 'States', description: 'Indian states' },
        { key: 'cities', label: 'Cities', description: 'Cities (can be filtered by state_id)' },
        // Legacy/Deprecated
        { key: 'inventory_panels', label: 'Inventory: Solar Panels', description: 'Solar panel inventory' },
        { key: 'inventory_inverters', label: 'Inventory: Inverters', description: 'Inverter inventory' },
        { key: 'subsidy_state', label: 'Subsidy Rates (State-wise)', description: 'State-wise subsidy rates' },
        { key: 'clients', label: 'CRM Clients', description: 'Client database' }
    ],

    // 2. Fetch data based on the source key
    fetchData: async (sourceKey, filterParams = {}) => {
        try {
            switch (sourceKey) {
                case 'users':
                    const users = await db.User.findAll({
                        where: { is_active: true },
                        attributes: ['id', 'first_name', 'last_name', 'email'],
                        order: [['first_name', 'ASC'], ['last_name', 'ASC']]
                    });
                    return users.map(u => ({
                        label: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || `User ${u.id}`,
                        value: u.id.toString(),
                        id: u.id,
                        email: u.email
                    }));

                case 'roles':
                    const roles = await db.Role.findAll({
                        where: { is_active: true },
                        attributes: ['id', 'name', 'description'],
                        order: [['name', 'ASC']]
                    });
                    return roles.map(r => ({
                        label: r.name,
                        value: r.name,
                        id: r.id,
                        description: r.description
                    }));

                case 'inventory_panels':
                    // TODO: Replace with actual database query when inventory model is created
                    // return db.Product.findAll({ where: { type: 'panel' }})
                    //     .then(data => data.map(p => ({ label: p.name, value: p.id, price: p.price, wattage: p.wattage })));
                    return [
                        { label: 'Longi 450W Monocrystalline', value: 'longi_450', price: 220, wattage: 450 },
                        { label: 'Jinko 540W Bifacial', value: 'jinko_540', price: 280, wattage: 540 },
                        { label: 'Canadian Solar 400W', value: 'cs_400', price: 190, wattage: 400 }
                    ];

                case 'inventory_inverters':
                    // TODO: Replace with actual database query when inventory model is created
                    return [
                        { label: 'Sungrow 5kW', value: 'sungrow_5kw', price: 800 },
                        { label: 'GoodWe 10kW', value: 'goodwe_10kw', price: 1200 }
                    ];

                case 'subsidy_state':
                    // TODO: Replace with actual database query when subsidy model is created
                    return [
                        { label: 'Gujarat (Surya)', value: 'guj_surya', rate_per_kw: 14000, max_limit: 30000 },
                        { label: 'Maharashtra (MSEDCL)', value: 'mh_msedcl', rate_per_kw: 12500, max_limit: 25000 },
                        { label: 'Central Govt (MNRE)', value: 'central', rate_per_kw: 14588, max_limit: 70000 }
                    ];

                case 'clients':
                    // TODO: Replace with actual database query when clients model is created
                    // For now, return empty array
                    return [];

                // System Datasets
                case 'panel_types':
                    const panelTypes = await db.PanelType.findAll({
                        attributes: ['id', 'panel_type', 'panel_description', 'is_residential_enabled', 'is_industrial_enabled', 'is_common_building_enabled', 'is_ground_mounted_enabled'],
                        order: [['panel_type', 'ASC']]
                    });
                    return panelTypes.map(pt => ({
                        label: pt.panel_type,
                        value: pt.id.toString(),
                        id: pt.id,
                        panel_type: pt.panel_type,
                        panel_description: pt.panel_description,
                        is_residential_enabled: pt.is_residential_enabled,
                        is_industrial_enabled: pt.is_industrial_enabled,
                        is_common_building_enabled: pt.is_common_building_enabled,
                        is_ground_mounted_enabled: pt.is_ground_mounted_enabled
                    }));

                case 'watt_peaks':
                    // Build where clause for filtering by panel_type_id
                    const wattPeakWhere = {};
                    if (filterParams.panel_type_id || filterParams.filter === 'panel_type_id') {
                        const panelTypeId = filterParams.panel_type_id || filterParams.filterValue;
                        if (panelTypeId) {
                            wattPeakWhere.panel_type_id = parseInt(panelTypeId);
                        }
                    }
                    
                    const wattPeaks = await db.WattPeak.findAll({
                        where: wattPeakWhere,
                        include: [{
                            model: db.PanelType,
                            as: 'panelType',
                            attributes: ['id', 'panel_type'],
                            required: false
                        }],
                        attributes: ['id', 'watt_peak', 'panel_type_id'],
                        order: [['watt_peak', 'ASC']]
                    });
                    return wattPeaks.map(wp => ({
                        label: `${wp.watt_peak}W${wp.panelType ? ` (${wp.panelType.panel_type})` : ''}`,
                        value: wp.id.toString(),
                        id: wp.id,
                        watt_peak: parseFloat(wp.watt_peak),
                        panel_type_id: wp.panel_type_id,
                        panel_type_name: wp.panelType?.panel_type || null
                    }));

                case 'panel_companies':
                    const panelCompanies = await db.PanelCompany.findAll({
                        attributes: ['id', 'company_name', 'company_logo', 'description'],
                        order: [['company_name', 'ASC']]
                    });
                    return panelCompanies.map(pc => ({
                        label: pc.company_name,
                        value: pc.id.toString(),
                        id: pc.id,
                        company_name: pc.company_name,
                        company_logo: pc.company_logo,
                        description: pc.description
                    }));

                case 'inverter_companies':
                    const inverterCompanies = await db.InverterCompany.findAll({
                        where: { deleted_at: null },
                        attributes: ['id', 'company_name', 'company_logo', 'description'],
                        order: [['company_name', 'ASC']]
                    });
                    return inverterCompanies.map(ic => ({
                        label: ic.company_name,
                        value: ic.id.toString(),
                        id: ic.id,
                        company_name: ic.company_name,
                        company_logo: ic.company_logo,
                        description: ic.description
                    }));

                case 'electricity_providers':
                    const electricityProviders = await db.ElectricityProvider.findAll({
                        where: { deleted_at: null },
                        attributes: ['id', 'provider', 'provider_img', 'remarks'],
                        order: [['provider', 'ASC']]
                    });
                    return electricityProviders.map(ep => ({
                        label: ep.provider,
                        value: ep.id.toString(),
                        id: ep.id,
                        provider: ep.provider,
                        provider_img: ep.provider_img,
                        remarks: ep.remarks
                    }));

                // Location Datasets
                case 'states':
                    const states = await db.State.findAll({
                        where: { deleted_at: null },
                        attributes: ['state_id', 'name'],
                        order: [['name', 'ASC']]
                    });
                    return states.map(s => ({
                        label: s.name || `State ${s.state_id}`,
                        value: s.state_id.toString(),
                        id: s.state_id,
                        state_id: s.state_id,
                        state_name: s.name,
                        name: s.name
                    }));

                case 'cities':
                    const whereClause = { deleted_at: null };
                    // Support filtering by state_id
                    if (filterParams.state_id) {
                        whereClause.state_id = parseInt(filterParams.state_id);
                    }
                    const cities = await db.City.findAll({
                        where: whereClause,
                        include: [{
                            model: db.State,
                            as: 'state',
                            attributes: ['state_id', 'name'],
                            required: false
                        }],
                        attributes: ['city_id', 'name', 'state_id'],
                        order: [['name', 'ASC']]
                    });
                    return cities.map(c => ({
                        label: c.name ? `${c.name}${c.state ? `, ${c.state.name}` : ''}` : `City ${c.city_id}`,
                        value: c.city_id.toString(),
                        id: c.city_id,
                        city_id: c.city_id,
                        city_name: c.name,
                        name: c.name,
                        state_id: c.state_id,
                        state_name: c.state?.name || null
                    }));

                default:
                    return [];
            }
        } catch (error) {
            console.error(`[DataProvider] Error fetching ${sourceKey}:`, error);
            throw error;
        }
    },

    // 3. Check if a source supports filtering (for cascading dropdowns)
    supportsFiltering: (sourceKey) => {
        // Sources that can be filtered by parent_id or similar
        const filterableSources = ['inventory_panels', 'inventory_inverters', 'clients', 'cities', 'watt_peaks'];
        return filterableSources.includes(sourceKey);
    }
};

module.exports = DataProviders;

