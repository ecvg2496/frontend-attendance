export const getCurrentPHTDate = () => {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  };
  
  export const getCurrentESTDate = () => {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  };
  
  export const formatTimeTo12Hour = (timeString) => {
    if (!timeString) return '--:-- --';
    const timePart = timeString.includes('T') ? timeString.split('T')[1].substring(0, 5) : timeString.substring(0, 5);
    const [hours, minutes] = timePart.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  export const formatDateToYMD = (date) => {
    const phtDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
    const year = phtDate.getFullYear();
    const month = String(phtDate.getMonth() + 1).padStart(2, '0');
    const day = String(phtDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  export const formatTimeToHMS = (date) => {
    const phtDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
    return phtDate.toTimeString().substring(0, 8);
  };
  
  export const formatDisplayDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        timeZone: "Asia/Manila",
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  export const calculateTimeDifference = (time1, time2) => {
    if (!time1 || !time2) return 0;
    
    const t1 = new Date(`2000-01-01T${time1}Z`);
    const t2 = new Date(`2000-01-01T${time2}Z`);
    
    return (t2 - t1) / (1000 * 60); // difference in minutes
  };
  
  export const calculateWorkHours = (timeIn, timeOut, breakDuration = 0) => {
    if (!timeIn || !timeOut) return 0;
    
    const minutes = calculateTimeDifference(timeIn, timeOut) - breakDuration;
    return (minutes / 60).toFixed(2); // convert to hours
  };
  
  export const formatDigitalTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = (hours % 12 || 12).toString().padStart(2, '0');
    
    return {
      time24: `${hours}:${minutes}:${seconds}`,
      time12: `${hours12}:${minutes}:${seconds} ${ampm}`,
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: date.timeZone
      })
    };
  };
  
  export const formatTimeFromSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };