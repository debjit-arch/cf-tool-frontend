// src/gap/services/gapService.js
import axios from "axios";

const BASE_URL = "https://cftoolbackend.duckdns.org/api/gaps";

const gapService = {
  async getGaps() {
    try {
      const res = await axios.get(BASE_URL);
      return res.data;
    } catch (error) {
      console.error("Error fetching gaps:", error);
      return [];
    }
  },

  async createGap(docId, data) {
    try {
      const res = await axios.post(BASE_URL, { docId, ...data });
      return res.data;
    } catch (error) {
      console.error("Error creating gap:", error);
      throw error;
    }
  },

  async updateGap(docId, data) {
    try {
      const res = await axios.patch(`${BASE_URL}/${docId}`, data);
      return res.data;
    } catch (error) {
      // Auto-create if not found
      if (error.response?.status === 404) {
        console.warn(`Gap not found for docId ${docId}, creating new entry...`);
        return await this.createGap(docId, data);
      }
      console.error(`Error updating gap for docId ${docId}:`, error);
      throw error;
    }
  },
  async checkCompliance(docId) {
    try {
      const res = await axios.post(`${BASE_URL}/${docId}/check-compliance`);
      return res.data; // e.g. { score: 85 }
    } catch (error) {
      console.error(`Error checking compliance for docId ${docId}:`, error);
      throw error;
    }
  },
};

export default gapService;
