import React, { useEffect, useState } from "react";
import axiosPrivate from "api/axios";

const HiredCandidatesTable = () => {
    const [hiredCandidates, setHiredCandidates] = useState([]);

    useEffect(() => {
        fetchHiredCandidates();
    }, []);

    const fetchHiredCandidates = async () => {
        try {
            const response = await axiosPrivate.post("hr/careers/entity/all", {
                relations: ["careers", "platforms", "tags", { entity: { relations: ["details"] } }],
                order: { target: "created_at", value: "desc" },
            });

            console.log("API Response:", response.data);

            if (response?.data) {
                const allCandidates = response.data["entity_career"] || [];
                console.log("All Candidates:", allCandidates);

                // Filter candidates where the tag title is "Hired"
                const filteredHired = allCandidates.filter(recruit => {
                    if (!recruit.tags) return false; // Skip candidates with no tags

                    // Ensure recruit.tags is an array
                    const tagsArray = Array.isArray(recruit.tags) ? recruit.tags : [recruit.tags];

                    // Check if any tag is "Hired"
                    return tagsArray.some(tag => tag.title?.trim().toLowerCase() === "hired");
                });

                console.log("Filtered Hired Candidates:", filteredHired);
                setHiredCandidates(filteredHired);
            }
        } catch (error) {
            console.error("Error fetching hired candidates:", error);
        }
    };

    return (
        <div>
            <h2>Hired Candidates</h2>
            <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "left" }}>
                <thead>
                    <tr>
                        <th>Candidate Name</th>
                        <th>Position</th>
                        <th>Platform</th>
                        <th>Status</th>
                        <th>Applied Date</th>
                    </tr>
                </thead>
                <tbody>
                    {hiredCandidates.length > 0 ? (
                        hiredCandidates.map((candidate) => (
                            <tr key={candidate.id}>
                                <td>{candidate.entity?.full_name || "N/A"}</td>
                                <td>{candidate.careers?.title || "N/A"}</td>
                                <td>{candidate.platforms?.title || "N/A"}</td>
                                <td>{candidate.tags?.title || "N/A"}</td>
                                <td>{new Date(candidate.created_at).toLocaleDateString() || "N/A"}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center" }}>
                                No hired candidates found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default HiredCandidatesTable;
