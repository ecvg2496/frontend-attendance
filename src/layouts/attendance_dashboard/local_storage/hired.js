const hiredTracker = {
    key: 'processedHiredCandidates',
    
    // Add candidate to tracking system
    markAsProcessed(candidateId) {
      const processed = this.getAllProcessed();
      if (!processed.includes(candidateId)) {
        processed.push(candidateId);
        localStorage.setItem(this.key, JSON.stringify(processed));
      }
    },
  
    // Check if candidate was processed
    isProcessed(candidateId) {
      return this.getAllProcessed().includes(candidateId);
    },
  
    // Get all processed IDs
    getAllProcessed() {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    },
  
    // Clear tracking (for admin purposes)
    clearAll() {
      localStorage.removeItem(this.key);
    }
  };
  
  export default hiredTracker;