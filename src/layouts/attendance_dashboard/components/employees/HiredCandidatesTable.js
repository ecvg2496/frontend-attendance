import React, { useState, useEffect } from "react";
import { IconButton, CircularProgress, Alert, Typography } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { axiosPrivate } from "api/axios";

const HiredCandidatesTable = ({ onEditClick }) => {
  const [hiredCandidates, setHiredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHiredCandidates();
  }, []);

  const hasHiredTag = (tags) => {
    if (!tags) return false;
    
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    
    return tagsArray.some(tag => {
      const tagValue = tag.title || tag.name || tag.label || '';
      return tagValue.trim().toLowerCase() === 'hired';
    });
  };

  const fetchHiredCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosPrivate.post("hr/careers/entity/all", {
        relations: ["careers", "platforms", "tags", { entity: { relations: ["details"] } }],
        order: [{ target: "created_at", value: "desc" }]
      });
  
      if (response?.data) {
        const allCandidates = response.data["entity_career"] || [];
        const filteredHired = allCandidates.filter(recruit => hasHiredTag(recruit.tags));
        setHiredCandidates(filteredHired);
      }
    } catch (error) {
      console.error("Error fetching hired candidates:", error);
      setError(error.response?.data?.message || "Error fetching hired candidates");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ margin: 2 }}>
        {error}
      </Alert>
    );
  }

  if (hiredCandidates.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Typography variant="h6">No candidates with "Hired" status found</Typography>
        <Typography variant="body1" color="textSecondary">
          Only candidates tagged as "Hired" will appear here
        </Typography>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={{ 
        width: "100%", 
        borderCollapse: 'collapse',
        tableLayout: 'auto'
      }}>
        <thead>
          <tr style={{ backgroundColor: "#2E7D32", color: "white" }}>
            <th style={{ padding: "12px 16px", whiteSpace: 'nowrap' }}>Candidate Name</th>
            <th style={{ padding: "12px 16px", whiteSpace: 'nowrap' }}>Position</th>
            <th style={{ padding: "12px 16px", whiteSpace: 'nowrap' }}>Source</th>
            <th style={{ padding: "12px 16px", whiteSpace: 'nowrap' }}>Status</th>
            <th style={{ padding: "12px 16px", whiteSpace: 'nowrap' }}>Date Hired</th>
            <th style={{ padding: "12px 16px", whiteSpace: 'nowrap' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hiredCandidates.map((candidate) => (
            <tr key={candidate.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={{ padding: "12px 16px", whiteSpace: 'nowrap' }}>
                <div style={{ fontWeight: 500 }}>{candidate.entity?.full_name || "N/A"}</div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>{candidate.entity?.email}</div>
              </td>
              <td style={{ padding: "12px 16px", whiteSpace: 'nowrap' }}>
                {candidate.careers?.title || "N/A"}
              </td>
              <td style={{ padding: "12px 16px", whiteSpace: 'nowrap' }}>
                {candidate.platforms?.title || "N/A"}
              </td>
              <td style={{ padding: "12px 16px", textAlign: 'center', whiteSpace: 'nowrap' }}>
                <span style={{
                  padding: "6px 12px",
                  borderRadius: "16px",
                  backgroundColor: "#2E7D32",
                  color: "white",
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}>
                  Hired
                </span>
              </td>
              <td style={{ padding: "12px 16px", whiteSpace: 'nowrap' }}>
                {candidate.created_at ? 
                  new Date(candidate.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) 
                  : "N/A"}
              </td>
              <td style={{ padding: "12px 16px", textAlign: 'center', whiteSpace: 'nowrap' }}>
                <IconButton 
                  onClick={() => onEditClick(candidate)}
                  sx={{ 
                    color: '#2E7D32',
                    '&:hover': { 
                      backgroundColor: 'rgba(46, 125, 50, 0.1)' 
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HiredCandidatesTable;