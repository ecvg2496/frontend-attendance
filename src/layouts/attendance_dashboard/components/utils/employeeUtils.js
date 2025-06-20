export const getInitialFormData = (employee = null) => ({
    first_name: employee?.first_name || "",
    last_name: employee?.last_name || "",
    middle_name: employee?.middle_name || "",
    email: employee?.email || "",
    contact_number: employee?.contact_number || "",
    address: employee?.address || "",
    position: employee?.position || "",
    employment_date: employee?.employment_date || "", 
    birthdate: employee?.birthdate || "",
    contract_hours: employee?.contract_hours || "",
    employment_type: employee?.employment_type || "",
    type: employee?.type || "",
    work_arrangement: employee?.work_arrangement || "",
    time_in: employee?.time_in || "",
    time_out: employee?.time_out || "",
    hourly_rate: employee?.hourly_rate || "",
    daily_rate: employee?.daily_rate || "",
    team: employee?.team || "",
    department: employee?.department || "",
    status: employee?.status || "",
    user_photo: employee?.user_photo || null,
  });
  
  export const formatTimeForDisplay = (timeString) => {
    if (!timeString) return '';
    if (/^\d{2}:\d{2}$/.test(timeString)) return timeString;
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) return timeString.split(':').slice(0, 2).join(':');
    return '';
  };
  
  export const formatTimeToHHMM = (time) => time ? time.split(":").slice(0, 2).join(":") : "";
  
  export const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    if (month < birthDate.getMonth() || (month === birthDate.getMonth() && day < birthDate.getDate())) {
      age--;
    }
    return age;
  };