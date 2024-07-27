import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import Modal from '@mui/material/Modal';
import './LeaveSummaryModal.css'; // Make sure this file is correctly linked

const LeaveSummaryModal = ({ isOpen, onClose, employeeId }) => {
    const [leaveSummary, setLeaveSummary] = useState([]);
    const [gridData, setGridData] = useState({});
    const [employeeInfo, setEmployeeInfo] = useState({});
    const [totals, setTotals] = useState({});
    const [totalSickLeaves, setTotalSickLeaves] = useState(0);

    useEffect(() => {
        if (isOpen) {
            const fetchLeaveSummary = async () => {
                try {
                    const response = await Axios.get(`http://localhost:5000/employee/${employeeId}/leave-summary`);
                    console.log('Fetched leave summary:', response.data); // Debug statement
                    setLeaveSummary(response.data);
                } catch (error) {
                    console.error('Error fetching leave summary:', error);
                }
            };

            const fetchEmployeeInfo = async () => {
                try {
                    const response = await Axios.get(`http://localhost:5000/employee/${employeeId}`);
                    console.log('Fetched employee info:', response.data); // Debug statement
                    setEmployeeInfo(response.data);
                } catch (error) {
                    console.error('Error fetching employee info:', error);
                }
            };

            fetchLeaveSummary();
            fetchEmployeeInfo();
        }
    }, [isOpen, employeeId]);

    useEffect(() => {
        const generateGridData = () => {
            const data = {};
            const monthTotals = {};
            let totalDaysUsed = 0;
            let sickLeaveDays = 0;

            leaveSummary.forEach(leave => {
                const date = new Date(leave.date);
                const month = date.getMonth();
                const day = date.getDate();
                const duration = Math.abs(parseFloat(leave.net_amount)); // Parse duration as float and remove negative sign
                const leaveType = leave.leave_type;

                if (!data[month]) {
                    data[month] = {};
                }
                if (!monthTotals[month]) {
                    monthTotals[month] = 0;
                }

                data[month][day] = { duration, leaveType };
                monthTotals[month] += duration;
                totalDaysUsed += duration;

                if (leaveType.includes('Sick Leave')) {
                    sickLeaveDays += duration;
                }
            });

            console.log('Generated grid data:', data); // Debug statement
            console.log('Month totals:', monthTotals); // Debug statement
            console.log('Total days used:', totalDaysUsed); // Debug statement
            console.log('Total sick leave days:', sickLeaveDays); // Debug statement

            setGridData(data);
            setTotals(monthTotals);
            setTotalSickLeaves(sickLeaveDays);
            setEmployeeInfo(prev => {
                const updatedInfo = { ...prev, daysUsed: totalDaysUsed };
                console.log('Updated employee info with days used:', updatedInfo); // Debug statement
                return updatedInfo;
            });
        };

        generateGridData();
    }, [leaveSummary]);

    const renderGrid = () => {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        return (
            <table className="leave-summary-table">
                <thead>
                    <tr>
                        <th></th>
                        {months.map((month, index) => (
                            <th key={index}>{month}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 31 }, (_, i) => (
                        <tr key={i}>
                            <td>{i + 1}</td>
                            {months.map((_, monthIndex) => (
                                <td key={monthIndex}>
                                    {gridData[monthIndex] && gridData[monthIndex][i + 1] 
                                        ? (
                                            <span className={gridData[monthIndex][i + 1].leaveType.includes('Sick Leave') ? 'sick-leave' : ''}>
                                                {gridData[monthIndex][i + 1].duration}
                                            </span>
                                        ) : ""
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                    <tr>
                        <td><b>Total</b></td>
                        {months.map((_, monthIndex) => (
                            <td key={monthIndex}>
                                <b>{totals[monthIndex] ? totals[monthIndex].toFixed(1) : 0}</b> {/* Fixed to 1 decimal */}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        );
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <div className="leave-summary-modal">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>Leave Summary</h2>
                <div className="employee-info">
                    <p><b>Name: </b>{employeeInfo.first_name} {employeeInfo.last_name}</p>
                    <p><b>Employee ID: </b>{employeeInfo.id}</p>
                    <p><b>Remaining Days: </b>{employeeInfo.days}</p>
                    <p><b>Days Used: </b>{employeeInfo.daysUsed}</p>
                    <p><b className="sick-leave">Sick Leaves: </b><span className="sick-leave">{totalSickLeaves}</span></p>
                </div>
                {renderGrid()}
            </div>
        </Modal>
    );
};

export default LeaveSummaryModal;






// import React, { useEffect, useState } from 'react';
// import Axios from 'axios';
// import Modal from '@mui/material/Modal';
// import './LeaveSummaryModal.css'; // Create this CSS file for styling

// const LeaveSummaryModal = ({ isOpen, onClose, employeeId }) => {
//     const [leaveSummary, setLeaveSummary] = useState([]);
//     const [gridData, setGridData] = useState({});
//     const [employeeInfo, setEmployeeInfo] = useState({});
//     const [totals, setTotals] = useState({});

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

//             leaveSummary.forEach(leave => {
//                 const date = new Date(leave.date);
//                 const month = date.getMonth();
//                 const day = date.getDate();
//                 const duration = Math.abs(parseFloat(leave.net_amount)); // Parse duration as float and remove negative sign

//                 if (!data[month]) {
//                     data[month] = {};
//                 }
//                 if (!monthTotals[month]) {
//                     monthTotals[month] = 0;
//                 }

//                 data[month][day] = duration;
//                 monthTotals[month] += duration;
//                 totalDaysUsed += duration;
//             });

//             console.log('Generated grid data:', data); // Debug statement
//             console.log('Month totals:', monthTotals); // Debug statement
//             console.log('Total days used:', totalDaysUsed); // Debug statement

//             setGridData(data);
//             setTotals(monthTotals);
//             setEmployeeInfo(prev => {
//                 const updatedInfo = { ...prev, daysUsed: totalDaysUsed };
//                 console.log('Updated employee info with days used:', updatedInfo); // Debug statement
//                 return updatedInfo;
//             });
//         };

//         generateGridData();
//     }, [leaveSummary]);

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
//                                     {gridData[monthIndex] && gridData[monthIndex][i + 1] ? gridData[monthIndex][i + 1] : ""}
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
//                 </div>
//                 {renderGrid()}
//             </div>
//         </Modal>
//     );
// };

// export default LeaveSummaryModal;


