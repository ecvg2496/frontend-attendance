const API_BASE_URL = 'http://localhost:8000/api/attendance';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessages = [];
    
    // Handle Django error response formats
    if (errorData.detail) {
      errorMessages.push(errorData.detail);
    } else {
      for (const [field, errors] of Object.entries(errorData)) {
        errorMessages.push(`${field}: ${Array.isArray(errors) ? errors.join(' ') : errors}`);
      }
    }
    
    throw new Error(errorMessages.join('\n') || 'Request failed');
  }
  return response.json();
};

// Format client data for API requests
const formatClientData = (clientData) => {
  return {
    name: clientData.name,
    email: clientData.email,
    timezone: clientData.timezone,
    client_type: clientData.clientType,
    begin_date: clientData.begin_date,
    start_time: clientData.startTime,
    end_time: clientData.endTime,
    lunch_break: clientData.lunchBreak,
    working_hours: clientData.workingHours,
    avatar_color: clientData.avatarColor
  };
};

export const fetchClients = async () => {
  const response = await fetch(`${API_BASE_URL}/clients/`);
  return handleResponse(response);
};

export const fetchEmployees = async () => {
  const response = await fetch(`${API_BASE_URL}/employees/`);
  return handleResponse(response);
};

export const saveClient = async (clientData, clientId = null) => {
  const method = clientId ? 'PUT' : 'POST';
  const url = clientId 
    ? `${API_BASE_URL}/clients/${clientId}/`
    : `${API_BASE_URL}/clients/`;

  const formattedData = formatClientData(clientData);
  
  const response = await fetch(url, {
    method,
    headers: { 
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Add if using auth
    },
    body: JSON.stringify(formattedData)
  });
  
  return handleResponse(response);
};

export const assignEmployees = async (clientId, employeeIds) => {
  const response = await fetch(
    `${API_BASE_URL}/clients/${clientId}/assign-employee/`,
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds] })
    }
  );
  
  return handleResponse(response);
};

export const unassignEmployee = async (clientId, employeeId) => {
  const response = await fetch(
    `${API_BASE_URL}/clients/${clientId}/unassign-employee/`,
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ employee_id: employeeId })
    }
  );

  return handleResponse(response);
};

export const deleteClient = async (clientId) => {
  const response = await fetch(
    `${API_BASE_URL}/clients/${clientId}/`,
    { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete client');
  }
  
  return response.status === 204 ? { success: true } : response.json();
};