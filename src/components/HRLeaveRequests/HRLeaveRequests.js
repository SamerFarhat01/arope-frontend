import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField } from '@mui/material';
import './HRLeaveRequests.css';

const HrLeaveRequests = ({ token }) => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [approvedDays, setApprovedDays] = useState({}); // Store the number of approved days for each request

    useEffect(() => {
        const fetchLeaveRequests = async () => {
            try {
                const response = await Axios.get('http://localhost:5000/hr-leave-requests', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const formattedRequests = response.data.map(request => ({
                    ...request,
                    time: ['Marital', 'Paternity', 'Maternity'].includes(request.typeOfLeave) ? '' : request.time,
                    lastModified: new Date(request.lastModified).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: true,
                    }),
                    attachment: request.attachment,
                }));
                setLeaveRequests(formattedRequests);
            } catch (error) {
                console.error('Error fetching HR leave requests:', error);
            }
        };

        fetchLeaveRequests();
    }, [token]);

    // Handle HR approval with partial days
    const handleApprove = async (id) => {
        try {
            const days = parseFloat(approvedDays[id]); // Fetch the approved days from the state
            if (!days || days <= 0) {
                alert("Please enter a valid number of days to approve");
                return;
            }

            await Axios.patch(`http://localhost:5000/leave-requests/${id}/hr-approve`, 
                { action: 'approve', approvedDays: days }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            setLeaveRequests(leaveRequests.map(req => 
                req.id === id ? { ...req, requestStatus: 'Approved', quantity: days } : req
            ));
        } catch (error) {
            console.error('Error approving leave request:', error);
        }
    };

    const handleReject = async (id) => {
        try {
            await Axios.patch(`http://localhost:5000/leave-requests/${id}/hr-approve`, 
                { action: 'reject' }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            setLeaveRequests(leaveRequests.map(req => 
                req.id === id ? { ...req, requestStatus: 'Rejected' } : req
            ));
        } catch (error) {
            console.error('Error rejecting leave request:', error);
        }
    };

    // Update the approved days for the specific request
    const handleApprovedDaysChange = (id, value) => {
        setApprovedDays({
            ...approvedDays,
            [id]: value,
        });
    };

    const columns = [
        { field: 'employeeId', headerName: 'Employee ID', width: 100 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'typeOfLeave', headerName: 'Type of Leave', width: 250 },
        { field: 'requestStatus', headerName: 'Request Status', width: 150 },
        { field: 'quantity', headerName: 'Requested Quantity', width: 150 },
        { field: 'time', headerName: 'Time', width: 200 },
        { field: 'dates', headerName: 'Dates', width: 200 },
        { 
            field: 'attachment', 
            headerName: 'Attachment', 
            width: 150, 
            renderCell: (params) => (
                params.row.attachment ? (
                    <a 
                        href={`http://localhost:5000/uploads/${params.row.attachment}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        Download
                    </a>
                ) : (
                    <span>No Attachment</span>
                )
            ) 
        },
        {
            field: 'approvedDays',
            headerName: 'Approved Days',
            width: 150,
            renderCell: (params) => (
                params.row.requestStatus === 'Pending HR' ? (
                    <TextField
                        label="Days"
                        type="number"
                        variant="outlined"
                        size="small"
                        value={approvedDays[params.row.id] || ''}
                        onChange={(e) => handleApprovedDaysChange(params.row.id, e.target.value)}
                        InputProps={{ inputProps: { min: 0.5, step: 0.5, max: params.row.quantity } }} // Allow half days
                    />
                ) : (
                    <span>{params.row.quantity}</span>
                )
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
                <>
                    {params.row.requestStatus === 'Pending HR' && (
                        <>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleApprove(params.row.id)}
                                size="small"
                                style={{ marginRight: 10 }}
                            >
                                Approve
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => handleReject(params.row.id)}
                                size="small"
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </>
            ),
        },
        { field: 'lastModified', headerName: 'Last Modified', width: 200 },
    ];

    return (
        <div className="leave-requests-container">
            <h1 className="title">HR Leave Requests</h1>
            <div className="data-grid-container">
                <DataGrid 
                    rows={Array.isArray(leaveRequests) ? leaveRequests : []}
                    columns={columns} 
                    pageSize={10} 
                    rowsPerPageOptions={[10]} 
                    checkboxSelection 
                    disableSelectionOnClick 
                    sx={{
                        '& .MuiDataGrid-row:hover': {
                            cursor: 'pointer',
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default HrLeaveRequests;





// app.patch('/leave-requests/:id/hr-approve', hrAuthenticateToken, (req, res) => {
//     const id = req.params.id;
//     const action = req.body.action; // 'approve' or 'reject'
//     const approvedDays = parseFloat(req.body.approvedDays); // The number of days HR wants to approve

//     let newStatus;
//     if (action === 'approve') {
//         newStatus = 'Approved';
//     } else if (action === 'reject') {
//         newStatus = 'Rejected';
//     } else {
//         return res.status(400).send({ message: 'Invalid action' });
//     }

//     const fetchQuery = `
//         SELECT lr.employee_id, lr.type_of_leave, lr.manager_id, e.email AS employee_email, m.email AS manager_email,
//                SUM(ld.duration) as quantity, GROUP_CONCAT(ld.leave_date ORDER BY ld.leave_date ASC) as leave_dates
//         FROM leave_requests lr
//         JOIN leave_request_dates ld ON lr.id = ld.leave_request_id
//         JOIN employee e ON lr.employee_id = e.id
//         LEFT JOIN employee m ON lr.manager_id = m.id
//         WHERE lr.id = ? AND lr.request_status = 'Pending HR'
//         GROUP BY lr.id
//     `;
    
//     db.query(fetchQuery, [id], (err, results) => {
//         if (err) {
//             console.error('Error fetching leave request:', err);
//             return res.status(500).send(err);
//         }

//         if (results.length === 0) {
//             return res.status(404).send({ message: 'Leave request not found or already processed' });
//         }

//         const { employee_id, employee_email, manager_email, type_of_leave, quantity, leave_dates } = results[0];

//         const approvedDates = [];
//         const leaveDatesArray = leave_dates.split(',');

//         // If rejected, send an email to the employee notifying them
//         if (newStatus === 'Rejected') {
//             const updateRequestQuery = `
//                 UPDATE leave_requests 
//                 SET request_status = ?, last_modified = NOW() 
//                 WHERE id = ? AND request_status = 'Pending HR'
//             `;
//             db.query(updateRequestQuery, [newStatus, id], (err, updateResult) => {
//                 if (err) {
//                     console.error('Error rejecting leave request:', err);
//                     return res.status(500).send(err);
//                 }
//                 // Send rejection email to the employee
//                 sendEmailFunction(employee_email, 'Leave Request Rejected', 'Your leave request has been rejected.');
//                 res.send({ message: 'Leave request rejected and email sent' });
//             });
//             return;
//         }

//         // If approved, handle the approved days and dates
//         let totalRequested = 0.0;

//         for (let i = 0; i < leaveDatesArray.length; i++) {
//             if (totalRequested + parseFloat(approvedDays) <= approvedDays) {
//                 totalRequested += parseFloat(approvedDays);
//                 approvedDates.push(leaveDatesArray[i]);
//             } else if (totalRequested < approvedDays) {
//                 const remainingDaysToApprove = approvedDays - totalRequested;
//                 totalRequested += remainingDaysToApprove;
//                 approvedDates.push(leaveDatesArray[i]); // Approve the last date partially
//                 break;
//             }
//         }

//         if (totalRequested < approvedDays) {
//             return res.status(400).send({ message: 'Approved days exceed requested days' });
//         }

//         const updateRequestQuery = `
//             UPDATE leave_requests 
//             SET request_status = ?, quantity = ?, last_modified = NOW() 
//             WHERE id = ? AND request_status = 'Pending HR'
//         `;
        
//         db.query(updateRequestQuery, [newStatus, approvedDays, id], (err, updateResult) => {
//             if (err) {
//                 console.error('Error approving leave request:', err);
//                 return res.status(500).send(err);
//             }

//             // Delete unapproved dates from the request
//             const deleteUnapprovedDatesQuery = `
//                 DELETE FROM leave_request_dates 
//                 WHERE leave_request_id = ? AND leave_date NOT IN (?)
//             `;
            
//             db.query(deleteUnapprovedDatesQuery, [id, approvedDates], (err, deleteResult) => {
//                 if (err) {
//                     console.error('Error deleting unapproved dates:', err);
//                     return res.status(500).send(err);
//                 }

//                 // Only update employee's days for certain leave types
//                 if (!['Sick Leave', 'Personal Time Off', 'Condolences', 'Marital', 'Paternity', 'Maternity', 'Unpaid Leave'].includes(type_of_leave)) {
//                     const updateDaysQuery = `
//                         UPDATE employee 
//                         SET days = days - ? 
//                         WHERE id = ?
//                     `;
//                     db.query(updateDaysQuery, [approvedDays, employee_id], (err, updateDaysResult) => {
//                         if (err) {
//                             console.error('Error updating employee days:', err);
//                             return res.status(500).send(err);
//                         }

//                         // Check if the request was fully or partially approved
//                         if (totalRequested === quantity) {
//                             // Fully approved: send email to employee and manager
//                             sendEmailFunction(employee_email, 'Leave Request Fully Approved', 
//                                 `Your leave request has been fully approved.`);
//                             sendEmailFunction(manager_email, 'Leave Request Approved', 
//                                 'An employee’s leave request has been approved.');
//                         } else {
//                             // Partially approved: send email to the employee with the approved dates
//                             const approvedDatesFormatted = approvedDates.join(', ');
//                             sendEmailFunction(employee_email, 'Leave Request Partially Approved', 
//                                 `Your leave request has been partially approved for the following dates: ${approvedDatesFormatted}`);
//                         }

//                         res.send({ message: `Leave request approved for ${approvedDays} day(s), email sent to employee` });
//                     });
//                 } else {
//                     // Check if the request was fully or partially approved
//                     if (totalRequested === quantity) {
//                         // Fully approved: send email to employee and manager
//                         sendEmailFunction(employee_email, 'Leave Request Fully Approved', 
//                             `Your leave request has been fully approved.`);
//                         sendEmailFunction(manager_email, 'Leave Request Approved', 
//                             'An employee’s leave request has been approved.');
//                     } else {
//                         // Partially approved: send email to the employee with the approved dates
//                         const approvedDatesFormatted = approvedDates.join(', ');
//                         sendEmailFunction(employee_email, 'Leave Request Partially Approved', 
//                             `Your leave request has been partially approved for the following dates: ${approvedDatesFormatted}`);
//                     }

//                     res.send({ message: `Leave request partially approved for ${approvedDays} day(s) without updating days, email sent to employee` });
//                 }
//             });
//         });
//     });
// });





// import React, { useState, useEffect } from 'react';
// import Axios from 'axios';
// import { DataGrid } from '@mui/x-data-grid';
// import { Button } from '@mui/material';
// import './HRLeaveRequests.css';

// const HrLeaveRequests = ({ token }) => {
//     const [leaveRequests, setLeaveRequests] = useState([]);

//     useEffect(() => {
//         const fetchLeaveRequests = async () => {
//             try {
//                 const response = await Axios.get('http://localhost:5000/hr-leave-requests', {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 const formattedRequests = response.data.map(request => ({
//                     ...request,
//                     time: ['Marital', 'Paternity', 'Maternity'].includes(request.typeOfLeave) ? '' : request.time,
//                     lastModified: new Date(request.lastModified).toLocaleString('en-US', {
//                         year: 'numeric',
//                         month: 'long',
//                         day: 'numeric',
//                         hour: 'numeric',
//                         minute: 'numeric',
//                         second: 'numeric',
//                         hour12: true,
//                     }),
//                 }));
//                 setLeaveRequests(formattedRequests);
//             } catch (error) {
//                 console.error('Error fetching HR leave requests:', error);
//             }
//         };

//         fetchLeaveRequests();
//     }, [token]);

//     const handleApprove = async (id) => {
//         try {
//             await Axios.patch(`http://localhost:5000/leave-requests/${id}/hr-approve`, { action: 'approve' }, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setLeaveRequests(leaveRequests.map(req => req.id === id ? { ...req, requestStatus: 'Approved' } : req));
//         } catch (error) {
//             console.error('Error approving leave request:', error);
//         }
//     };

//     const handleReject = async (id) => {
//         try {
//             await Axios.patch(`http://localhost:5000/leave-requests/${id}/hr-approve`, { action: 'reject' }, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setLeaveRequests(leaveRequests.map(req => req.id === id ? { ...req, requestStatus: 'Rejected' } : req));
//         } catch (error) {
//             console.error('Error rejecting leave request:', error);
//         }
//     };

//     const columns = [
//         { field: 'employeeId', headerName: 'Employee ID', width: 100 },
//         { field: 'name', headerName: 'Name', width: 150 },
//         { field: 'typeOfLeave', headerName: 'Type of Leave', width: 250 },
//         { field: 'requestStatus', headerName: 'Request Status', width: 150 },
//         { field: 'quantity', headerName: 'Quantity', width: 100 },
//         { field: 'time', headerName: 'Time', width: 200 },
//         { field: 'dates', headerName: 'Dates', width: 200 },
//         {
//             field: 'actions',
//             headerName: 'Actions',
//             width: 200,
//             renderCell: (params) => (
//                 <>
//                     {params.row.requestStatus === 'Pending HR' && (
//                         <>
//                             <Button
//                                 variant="contained"
//                                 color="success"
//                                 onClick={() => handleApprove(params.row.id)}
//                                 size="small"
//                                 style={{ marginRight: 10 }}
//                             >
//                                 Approve
//                             </Button>
//                             <Button
//                                 variant="contained"
//                                 color="error"
//                                 onClick={() => handleReject(params.row.id)}
//                                 size="small"
//                             >
//                                 Reject
//                             </Button>
//                         </>
//                     )}
//                 </>
//             ),
//         },
//         { field: 'lastModified', headerName: 'Last Modified', width: 200 },
//     ];

//     return (
//         <div className="leave-requests-container">
//             <h1 className="title">HR Leave Requests</h1>
//             <div className="data-grid-container">
//                 <DataGrid 
//                     rows={Array.isArray(leaveRequests) ? leaveRequests : []}
//                     columns={columns} 
//                     pageSize={10} 
//                     rowsPerPageOptions={[10]} 
//                     checkboxSelection 
//                     disableSelectionOnClick 
//                     sx={{
//                         '& .MuiDataGrid-row:hover': {
//                             cursor: 'pointer',
//                         },
//                     }}
//                 />
//             </div>
//         </div>
//     );
// };

// export default HrLeaveRequests;
