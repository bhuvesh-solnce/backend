'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const states = [
      { state_id: 1, name: "Andhra Pradesh", created_at: new Date('2024-12-13 09:32:56'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 2, name: "Assam", created_at: new Date('2024-12-13 09:32:56'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 3, name: "Bihar", created_at: new Date('2024-12-13 09:32:56'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 4, name: "Uttar Pradesh", created_at: new Date('2024-12-13 09:32:56'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 5, name: "Gujarat", created_at: new Date('2024-12-13 09:32:56'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 7, name: "Delhi", created_at: new Date('2024-12-13 09:32:56'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 9, name: "Dadra & Nagar Haveli and Daman & Diu", created_at: new Date('2024-12-13 09:32:56'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 10, name: "Haryana", created_at: new Date('2024-12-13 09:32:56'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 11, name: "Himachal Pradesh", created_at: new Date('2024-12-13 09:32:56'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 12, name: "Jammu & Kashmir", created_at: new Date('2024-12-13 09:32:56'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 13, name: "Jharkhand", created_at: new Date('2024-12-13 09:32:56'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 14, name: "Karnataka", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 15, name: "Kerala", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 16, name: "Lakshadweep", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 17, name: "Madhya Pradesh", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 18, name: "Maharashtra", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 19, name: "Goa", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-06-24 05:59:32'), deleted_at: null },
      { state_id: 20, name: "Manipur", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 21, name: "Mizoram", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 22, name: "Nagaland", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 23, name: "Sikkim", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 24, name: "Tripura", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 25, name: "Arunachal Pradesh", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 26, name: "Meghalaya", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-06-24 05:59:37'), deleted_at: null },
      { state_id: 27, name: "Odisha", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 28, name: "Punjab", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 29, name: "Chandigarh", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 30, name: "Rajasthan", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 31, name: "Tamil Nadu", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 32, name: "Puducherry", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 33, name: "Telangana", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 34, name: "Andaman & Nicobar", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 35, name: "Uttarakhand", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 36, name: "West Bengal", created_at: new Date('2024-12-13 09:32:57'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 38, name: "Chhattisgarh", created_at: new Date('2025-01-25 05:49:21'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 42, name: "Megalaya", created_at: new Date('2025-02-14 05:08:11'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null },
      { state_id: 45, name: "Ladakh", created_at: new Date('2025-03-20 04:24:21'), updated_at: new Date('2025-04-14 10:40:13'), deleted_at: null }
    ];

    try {
      await queryInterface.bulkInsert('state', states, {
        ignoreDuplicates: true,
        updateOnDuplicate: ['name', 'updated_at', 'deleted_at'],
      });
      console.log(`✅ Seeded 37 states`);
    } catch (error) {
      console.error('❌ Error seeding states:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('state', null, {});
  },
};
