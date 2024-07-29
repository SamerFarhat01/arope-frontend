import React from 'react';
import Modal from '@mui/material/Modal';
import LeaveSummary from '../LeaveSummary/LeaveSummary';
import './LeaveSummaryModal.css';

const LeaveSummaryModal = ({ isOpen, onClose, employeeId }) => {
    return (
        <Modal open={isOpen} onClose={onClose}>
            <div className="leave-summary-modal">
                <button className="close-button" onClick={onClose}>X</button>
                <LeaveSummary employeeId={employeeId} />
            </div>
        </Modal>
    );
};

export default LeaveSummaryModal;



// import React, { useEffect, useState } from 'react';
// import Axios from 'axios';
// import Modal from '@mui/material/Modal';
// import moment from 'moment';
// import './LeaveSummaryModal.css'; // Make sure this file is correctly linked

// const LeaveSummaryModal = ({ isOpen, onClose, employeeId }) => {
//     const [leaveSummary, setLeaveSummary] = useState([]);
//     const [gridData, setGridData] = useState({});
//     const [employeeInfo, setEmployeeInfo] = useState({});
//     const [totals, setTotals] = useState({});
//     const [totalSickLeaves, setTotalSickLeaves] = useState(0);
//     const [totalPTO, setTotalPTO] = useState(0); // State for total PTO

//     useEffect(() => {
//         if (isOpen) {
//             const fetchLeaveSummary = async () => {
//                 try {
//                     const response = await Axios.get(`http://localhost:5000/employee/${employeeId}/leave-summary`);
//                     console.log('Fetched leave summary:', response.data); // Debug statement
//                     setLeaveSummary(response.data);
//                 } catch (error) {
//                     console.error('Error fetching leave summary:', error);
//                 }
//             };

//             const fetchEmployeeInfo = async () => {
//                 try {
//                     const response = await Axios.get(`http://localhost:5000/employee/${employeeId}`);
//                     console.log('Fetched employee info:', response.data); // Debug statement
//                     setEmployeeInfo(response.data);
//                 } catch (error) {
//                     console.error('Error fetching employee info:', error);
//                 }
//             };

//             fetchLeaveSummary();
//             fetchEmployeeInfo();
//         }
//     }, [isOpen, employeeId]);

//     useEffect(() => {
//         const generateGridData = () => {
//             const data = {};
//             const monthTotals = {};
//             let totalDaysUsed = 0;
//             let sickLeaveDays = 0;
//             let totalPtoMinutes = 0; // Variable for total PTO minutes

//             leaveSummary.forEach(leave => {
//                 const date = new Date(leave.date);
//                 const month = date.getMonth();
//                 const day = date.getDate();
//                 let duration = Math.abs(parseFloat(leave.net_amount)) || 0; // Parse duration as float and remove negative sign
//                 const leaveType = leave.leave_type;
//                 const requestStatus = leave.request_status;
              

//                 console.log(`Processing leave type: ${leaveType} on ${date.toLocaleDateString()}`);

//                 if (!data[month]) {
//                     data[month] = {};
//                 }
//                 if (!monthTotals[month]) {
//                     monthTotals[month] = 0;
//                 }

//                 if (leaveType === 'Personal Time Off') {
//                     if (leave.time_intervals) {
//                         const ptoMinutes = leave.time_intervals.split(',').reduce((total, interval) => {
//                             const [start, end] = interval.trim().split(' - ');
//                             console.log(`Start time: ${start}, End time: ${end}`);
//                             const startTime = moment(`1970-01-01 ${start}`, "YYYY-MM-DD HH:mm:ss");
//                             const endTime = moment(`1970-01-01 ${end}`, "YYYY-MM-DD HH:mm:ss");
//                             const minutes = endTime.diff(startTime, 'minutes');
//                             console.log(`Calculated minutes for interval ${interval}: ${minutes}`);
//                             return total + minutes;
//                         }, 0);
//                         totalPtoMinutes += ptoMinutes;
//                         duration = `${ptoMinutes}min`;
//                         data[month][day] = { duration, leaveType: 'Personal Time Off' };
//                         console.log(`Total PTO minutes: ${totalPtoMinutes}`);
//                     }
//                 } else {
//                     data[month][day] = { duration, leaveType };
//                     monthTotals[month] += duration;

//                     // Only include Annual Paid Leave and Unpaid Leave in totalDaysUsed
//                     if (leaveType === 'Annual Paid Leave' || leaveType === 'Unpaid Leave' || requestStatus === 'HR Remove') {
//                         totalDaysUsed += duration;
//                     }

//                     if (leaveType.includes('Sick Leave')) {
//                         sickLeaveDays += duration;
//                     }
//                 }
//             });

//             console.log('Generated grid data:', data); // Debug statement
//             console.log('Month totals:', monthTotals); // Debug statement
//             console.log('Total days used (Annual Paid Leave and Unpaid Leave):', totalDaysUsed); // Debug statement
//             console.log('Total sick leave days:', sickLeaveDays); // Debug statement
//             console.log('Total PTO minutes:', totalPtoMinutes); // Debug statement

//             setGridData(data);
//             setTotals(monthTotals);
//             setTotalSickLeaves(sickLeaveDays);
//             setTotalPTO(totalPtoMinutes); // Set total PTO
//             setEmployeeInfo(prev => {
//                 const updatedInfo = { ...prev, daysUsed: totalDaysUsed };
//                 console.log('Updated employee info with days used:', updatedInfo); // Debug statement
//                 return updatedInfo;
//             });
//         };

//         generateGridData();
//     }, [leaveSummary]);
//     console.log(employeeInfo);
//     const renderGrid = () => {
//         const months = [
//             "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//             "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
//         ];

//         return (
//             <table className="leave-summary-table">
//                 <thead>
//                     <tr>
//                         <th></th>
//                         {months.map((month, index) => (
//                             <th key={index}>{month}</th>
//                         ))}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {Array.from({ length: 31 }, (_, i) => (
//                         <tr key={i}>
//                             <td>{i + 1}</td>
//                             {months.map((_, monthIndex) => (
//                                 <td key={monthIndex}>
//                                     {gridData[monthIndex] && gridData[monthIndex][i + 1] 
//                                         ? (
//                                             <span className={gridData[monthIndex][i + 1].leaveType.includes('Sick Leave') ? 'sick-leave' : ''}>
//                                                 {gridData[monthIndex][i + 1].leaveType === 'Personal Time Off' ? gridData[monthIndex][i + 1].duration : gridData[monthIndex][i + 1].duration}
//                                             </span>
//                                         ) : ""
//                                     }
//                                 </td>
//                             ))}
//                         </tr>
//                     ))}
//                     <tr>
//                         <td><b>Total</b></td>
//                         {months.map((_, monthIndex) => (
//                             <td key={monthIndex}>
//                                 <b>{totals[monthIndex] ? totals[monthIndex].toFixed(1) : 0}</b> {/* Fixed to 1 decimal */}
//                             </td>
//                         ))}
//                     </tr>
//                 </tbody>
//             </table>
//         );
//     };

//     return (
//         <Modal open={isOpen} onClose={onClose}>
//             <div className="leave-summary-modal">
//                 <button className="close-button" onClick={onClose}>X</button>
//                 <h2>Leave Summary</h2>
//                 <div className="employee-info">
//                     <p><b>Name: </b>{employeeInfo.first_name} {employeeInfo.last_name}</p>
//                     <p><b>Employee ID: </b>{employeeInfo.id}</p>
//                     <p><b>Remaining Days: </b>{employeeInfo.days}</p>
//                     <p><b>Days Used: </b>{employeeInfo.daysUsed}</p>
//                     <p><b className="sick-leave">Sick Leaves: </b><span className="sick-leave">{totalSickLeaves}</span></p>
//                     <p><b className="pto-leave">Personal Time Off: </b><span className="pto-leave">{totalPTO} minutes</span></p>
//                 </div>
//                 {renderGrid()}
//             </div>
//         </Modal>
//     );
// };

// export default LeaveSummaryModal;








