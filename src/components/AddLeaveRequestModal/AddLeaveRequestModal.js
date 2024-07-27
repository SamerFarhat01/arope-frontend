import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import DatePicker, { Calendar } from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/colors/teal.css';
import 'react-multi-date-picker/styles/layouts/prime.css';
import './AddLeaveRequestModal.css';
import moment from 'moment';

const AddLeaveRequestModal = ({ token, isOpen, onClose, onRequestAdded, employees, departments, employeeId, leaveRequests = [], editingRequest }) => {
    const [requestType] = useState('Leave Request');
    const [typeOfLeave, setTypeOfLeave] = useState('');
    const [leaveDetails, setLeaveDetails] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [previousSickLeaveDays, setPreviousSickLeaveDays] = useState(0);
    const [remainingTimeOffMinutes, setRemainingTimeOffMinutes] = useState(120); // Initialize with max limit
    const [remainingSickDays, setRemainingSickDays] = useState(2); // Initialize with max limit

    useEffect(() => {
        const getUnavailableDates = async () => {
            try {
                const response = await Axios.get(`http://localhost:5000/unavailable-dates/${employeeId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUnavailableDates(response.data);
            } catch (error) {
                console.error('Error fetching unavailable dates:', error);
            }
        };

        getUnavailableDates();
    }, [employeeId, token]);

    useEffect(() => {
        const updatedLeaveDetails = selectedDates.map(date => {
            const formattedDate = moment(date.toDate()).format('YYYY-MM-DD');
            const existing = leaveDetails.find(detail => detail.date === formattedDate);
            return existing ? existing : { date: formattedDate, duration: '', time: '', start_time: '', end_time: '' };
        });
        setLeaveDetails(updatedLeaveDetails);
    }, [selectedDates]);

    useEffect(() => {
        const getPreviousSickLeaveDays = async () => {
            try {
                const response = await Axios.get(`http://localhost:5000/previous-sick-leave-days/${employeeId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPreviousSickLeaveDays(parseFloat(response.data.total) || 0);
            } catch (error) {
                console.error('Error fetching previous sick leave days:', error);
            }
        };

        const getRemainingTimeOff = async () => {
            try {
                const response = await Axios.get(`http://localhost:5000/remaining-timeoff/${employeeId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRemainingTimeOffMinutes(response.data.remainingMinutes);
            } catch (error) {
                console.error('Error fetching remaining time off:', error);
            }
        };

        getPreviousSickLeaveDays();
        getRemainingTimeOff();
    }, [employeeId, token]);

    useEffect(() => {
        if (editingRequest) {
            setTypeOfLeave(editingRequest.typeOfLeave);
            setSelectedDates(editingRequest.dates.split(',').map(date => new Date(date)));
            setLeaveDetails(editingRequest.leaveDetails);
        }
    }, [editingRequest]);

    const handleDurationChange = (date, duration) => {
        setLeaveDetails(leaveDetails.map(detail =>
            detail.date === date ? { ...detail, duration } : detail
        ));
    };

    const handleTimeChange = (date, time) => {
        setLeaveDetails(leaveDetails.map(detail =>
            detail.date === date ? { ...detail, time } : detail
        ));
    };

    const handleStartTimeChange = (date, start_time) => {
        setLeaveDetails(leaveDetails.map(detail =>
            detail.date === date ? { ...detail, start_time } : detail
        ));
    };

    const handleEndTimeChange = (date, end_time) => {
        setLeaveDetails(leaveDetails.map(detail =>
            detail.date === date ? { ...detail, end_time } : detail
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const quantity = leaveDetails.reduce((total, detail) => {
            const duration = parseFloat(detail.duration);
            return !isNaN(duration) ? total + duration : total;
        }, 0);

        const totalRequested = parseFloat(previousSickLeaveDays) + quantity;

        if (typeOfLeave === 'Sick Leave Without Note' && totalRequested > 2) {
            alert('The total days allowed for sick leaves without a note has been exceeded, please change request type');
            return;
        }

        if (typeOfLeave === 'Personal Time Off') {
            const totalMinutesRequested = leaveDetails.reduce((total, detail) => {
                const startTime = moment(detail.start_time, 'HH:mm');
                const endTime = moment(detail.end_time, 'HH:mm');
                const duration = endTime.diff(startTime, 'minutes');
                return total + duration;
            }, 0);

            if (totalMinutesRequested > remainingTimeOffMinutes) {
                alert('The total hours allowed for this month exceeded, please change request type');
                return;
            }
        }

        const req = {
            employeeId,
            typeOfLeave,
            quantity,
            leaveDetails
        };

        try {
            if (editingRequest) {
                const response = await Axios.patch(`http://localhost:5000/leave-requests/${editingRequest.id}/edit`, req, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Leave request update response:", response.data);
            } else {
                const response = await Axios.post('http://localhost:5000/leave-requests', req, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Leave request response:", response.data);
            }

            onRequestAdded();
            onClose();
        } catch (error) {
            console.error('Error adding/updating leave request:', error.response ? error.response.data : error.message);
        }
    };

    const getDayClass = (date) => {
        const formattedDate = moment(date.toDate()).format('YYYY-MM-DD');
        const detail = leaveDetails.find(detail => detail.date === formattedDate);
        const className = detail ? (detail.duration === '1' ? 'full-day' : ((detail.duration === '0.5' && detail.time !== '') ? (detail.time === 'AM' ? 'half-day half-day-morning' : 'half-day half-day-afternoon') : '')) : '';
        return className;
    };

    const isWeekend = (date) => {
        const day = date.weekDay.index;
        return day === 6 || day === 0; // 6 is Saturday, 0 is Sunday
    };

    const getExistingLeaveClass = (date) => {
        var UDs = unavailableDates.filter(ud => ud.date.split("T")[0] === moment(date.toDate()).format('YYYY-MM-DD'));
        return UDs.map(ud => ud.action).join(' ');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal lr-modal">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>Add Leave Request</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Request Type:</label>
                        <input type="text" value={requestType} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Type of Leave:</label>
                        <select value={typeOfLeave} onChange={(e) => setTypeOfLeave(e.target.value)} required>
                            <option value="">Select Type</option>
                            <option value="Annual Paid Leave">Annual Paid Leave</option>
                            <option value="Sick Leave With Note">Sick Leave With Note</option>
                            <option value="Unpaid Leave">Unpaid Leave</option>
                            <option value="Sick Leave Without Note">Sick Leave Without Note</option>
                            <option value="Personal Time Off">Personal Time Off</option>
                        </select>
                    </div>
                    <p>Remaining Personal Time Off (minutes): {remainingTimeOffMinutes}</p>
                    <p>Remaining Sick Leave Without Note (days): {2 - previousSickLeaveDays}</p>
                    <div className="form-group">
                        <label>Dates:</label>
                        <Calendar
                            multiple
                            value={selectedDates}
                            onChange={setSelectedDates}
                            format="YYYY-MM-DD"
                            className="teal prime"
                            arrowLeft="←"
                            arrowRight="→"
                            mapDays={({ date }) => {
                                const formattedDate = moment(date.toDate()).format('YYYY-MM-DD');
                                const isDisabled = isWeekend(date) || unavailableDates.includes(formattedDate);
                                const className = `${getDayClass(date)} ${getExistingLeaveClass(date)}`;
                                return {
                                    disabled: isDisabled,
                                    className: className
                                };
                            }}
                        />
                    </div>
                    {leaveDetails.map((detail, index) => (
                        <div key={`${detail.date}-${index}`} className="form-group">
                            {typeOfLeave === 'Personal Time Off' ? (
                                <>
                                    <div className="form-group">
                                        <label>{detail.date} Start Time:</label>
                                        <input type="time" value={detail.start_time} onChange={(e) => handleStartTimeChange(detail.date, e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label>{detail.date} End Time:</label>
                                        <input type="time" value={detail.end_time} onChange={(e) => handleEndTimeChange(detail.date, e.target.value)} required />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <label>{detail.date} Duration:</label>
                                    <select value={detail.duration} onChange={(e) => handleDurationChange(detail.date, e.target.value)} required>
                                        <option value="">Select Type</option>
                                        <option value="1">Full Day</option>
                                        <option value="0.5">Half Day</option>
                                    </select>
                                    {detail.duration === '0.5' && (
                                        <div className="form-group">
                                            <label>{detail.date} Time:</label>
                                            <select value={detail.time} onChange={(e) => handleTimeChange(detail.date, e.target.value)} required>
                                                <option value="">Select Time</option>
                                                <option value="AM">Morning</option>
                                                <option value="PM">Afternoon</option>
                                            </select>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                    <button type="submit" className="submit-button">Add Leave Request</button>
                </form>
            </div>
        </div>
    );
};

export default AddLeaveRequestModal;








// import React, { useState, useEffect } from 'react';
// import Axios from 'axios';
// import DatePicker, { Calendar } from 'react-multi-date-picker';
// import 'react-multi-date-picker/styles/colors/teal.css';
// import 'react-multi-date-picker/styles/layouts/prime.css';
// import './AddLeaveRequestModal.css';
// import moment from 'moment';

// const AddLeaveRequestModal = ({ token, isOpen, onClose, onRequestAdded, employees, departments, employeeId, leaveRequests = [], editingRequest }) => {
//     const [requestType] = useState('Leave Request');
//     const [typeOfLeave, setTypeOfLeave] = useState('');
//     const [leaveDetails, setLeaveDetails] = useState([]);
//     const [selectedDates, setSelectedDates] = useState([]);
//     const [unavailableDates, setUnavailableDates] = useState([]);
//     const [previousSickLeaveDays, setPreviousSickLeaveDays] = useState(0);

//     useEffect(() => {
//         const getUnavailableDates = async () => {
//             try {
//                 const response = await Axios.get(`http://localhost:5000/unavailable-dates/${employeeId}`, {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 setUnavailableDates(response.data);
//             } catch (error) {
//                 console.error('Error fetching unavailable dates:', error);
//             }
//         };

//         getUnavailableDates();
//     }, [employeeId, token]);

//     useEffect(() => {
//         const updatedLeaveDetails = selectedDates.map(date => {
//             const formattedDate = moment(date.toDate()).format('YYYY-MM-DD');
//             const existing = leaveDetails.find(detail => detail.date === formattedDate);
//             return existing ? existing : { date: formattedDate, duration: '', time: '' };
//         });
//         setLeaveDetails(updatedLeaveDetails);
//     }, [selectedDates]);

//     useEffect(() => {
//         const getPreviousSickLeaveDays = async () => {
//             try {
//                 const response = await Axios.get(`http://localhost:5000/previous-sick-leave-days/${employeeId}`, {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 console.log(response.data.total)
//                 setPreviousSickLeaveDays(parseFloat(response.data.total) || 0);
//             } catch (error) {
//                 console.error('Error fetching previous sick leave days:', error);
//             }
//         };

//         getPreviousSickLeaveDays();
//     }, [employeeId, token]);

//     useEffect(() => {
//         if (editingRequest) {
//             setTypeOfLeave(editingRequest.typeOfLeave);
//             setSelectedDates(editingRequest.dates.split(',').map(date => new Date(date)));
//             setLeaveDetails(editingRequest.leaveDetails);
//         }
//     }, [editingRequest]);

//     const handleDurationChange = (date, duration) => {
//         setLeaveDetails(leaveDetails.map(detail =>
//             detail.date === date ? { ...detail, duration } : detail
//         ));
//     };

//     const handleTimeChange = (date, time) => {
//         setLeaveDetails(leaveDetails.map(detail =>
//             detail.date === date ? { ...detail, time } : detail
//         ));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         const quantity = leaveDetails.reduce((total, detail) => {
//             const duration = parseFloat(detail.duration);
//             return !isNaN(duration) ? total + duration : total;
//         }, 0);

//         const totalRequested = parseFloat(previousSickLeaveDays) + quantity;

//         if (typeOfLeave === 'Sick Leave Without Note' && totalRequested > 2) {
//             alert('The total days allowed for sick leaves without a note has been exceeded, please change request type');
//             return;
//         }

//         const req = {
//             employeeId,
//             typeOfLeave,
//             quantity,
//             leaveDetails
//         };

//         try {
//             if (editingRequest) {
//                 const response = await Axios.patch(`http://localhost:5000/leave-requests/${editingRequest.id}/edit`, req, {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 console.log("Leave request update response:", response.data);
//             } else {
//                 const response = await Axios.post('http://localhost:5000/leave-requests', req, {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 console.log("Leave request response:", response.data);
//             }

//             onRequestAdded();
//             onClose();
//         } catch (error) {
//             console.error('Error adding/updating leave request:', error.response ? error.response.data : error.message);
//         }
//     };

//     const getDayClass = (date) => {
//         const formattedDate = moment(date.toDate()).format('YYYY-MM-DD');
//         const detail = leaveDetails.find(detail => detail.date === formattedDate);
//         const className = detail ? (detail.duration === '1' ? 'full-day' : ((detail.duration === '0.5' && detail.time !== '') ? (detail.time === 'AM' ? 'half-day half-day-morning' : 'half-day half-day-afternoon') : '')) : '';
//         return className;
//     };

//     const isWeekend = (date) => {
//         const day = date.weekDay.index;
//         return day === 6 || day === 0; // 6 is Saturday, 0 is Sunday
//     };

//     const getExistingLeaveClass = (date) => {
//         var UDs = unavailableDates.filter(ud => ud.date.split("T")[0] === moment(date.toDate()).format('YYYY-MM-DD'));
//         return UDs.map(ud => ud.action).join(' ');
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="modal-overlay">
//             <div className="modal lr-modal">
//                 <button className="close-button" onClick={onClose}>X</button>
//                 <h2>Add Leave Request</h2>
//                 <form onSubmit={handleSubmit}>
//                     <div className="form-group">
//                         <label>Request Type:</label>
//                         <input type="text" value={requestType} readOnly />
//                     </div>
//                     <div className="form-group">
//                         <label>Type of Leave:</label>
//                         <select value={typeOfLeave} onChange={(e) => setTypeOfLeave(e.target.value)} required>
//                             <option value="">Select Type</option>
//                             <option value="Annual Paid Leave">Annual Paid Leave</option>
//                             <option value="Sick Leave With Note">Sick Leave With Note</option>
//                             <option value="Unpaid Leave">Unpaid Leave</option>
//                             <option value="Sick Leave Without Note">Sick Leave Without Note</option>
//                             <option value="Personal Time Off">Personal Time Off</option>
//                         </select>
//                     </div>
//                     <div className="form-group">
//                         <label>Dates:</label>
//                         <Calendar
//                             multiple
//                             value={selectedDates}
//                             onChange={setSelectedDates}
//                             format="YYYY-MM-DD"
//                             className="teal prime"
//                             arrowLeft="←"
//                             arrowRight="→"
//                             mapDays={({ date }) => {
//                                 const formattedDate = moment(date.toDate()).format('YYYY-MM-DD');
//                                 const isDisabled = isWeekend(date) || unavailableDates.includes(formattedDate);
//                                 const className = `${getDayClass(date)} ${getExistingLeaveClass(date)}`;
//                                 return {
//                                     disabled: isDisabled,
//                                     className: className
//                                 };
//                             }}
//                         />
//                     </div>
//                     {leaveDetails.map((detail, index) => (
//                         <div key={`${detail.date}-${index}`} className="form-group">
//                             <label>{detail.date} Duration:</label>
//                             <select value={detail.duration} onChange={(e) => handleDurationChange(detail.date, e.target.value)} required>
//                                 <option value="">Select Type</option>
//                                 <option value="1">Full Day</option>
//                                 <option value="0.5">Half Day</option>
//                             </select>
//                             {detail.duration === '0.5' && (
//                                 <div className="form-group">
//                                     <label>{detail.date} Time:</label>
//                                     <select value={detail.time} onChange={(e) => handleTimeChange(detail.date, e.target.value)} required>
//                                         <option value="">Select Time</option>
//                                         <option value="AM">Morning</option>
//                                         <option value="PM">Afternoon</option>
//                                     </select>
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                     <button type="submit" className="submit-button">Add Leave Request</button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default AddLeaveRequestModal;

