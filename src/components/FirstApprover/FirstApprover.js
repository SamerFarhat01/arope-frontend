import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal } from '@mui/material';
import FirstApproverSharedCalendar from '../FirstApproverSharedCalendar/FirstApproverSharedCalendar'; 

const FirstApprovalRequests = ({ token }) => {
    const [requests, setRequests] = useState([]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false); // State to manage the modal open/close

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await Axios.get('http://localhost:5000/first-approval-requests', {
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
                }));
                setRequests(formattedRequests);
            } catch (error) {
                console.error('Error fetching requests:', error);
            }
        };

        fetchRequests();
    }, [token]);

    const handleApprove = async (id) => {
        try {
            await Axios.patch(`http://localhost:5000/leave-requests/${id}/first-approve`, { action: 'approve' }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(requests.filter(req => req.id !== id));
        } catch (error) {
            console.error('Error approving request:', error);
        }
    };

    const handleReject = async (id) => {
        try {
            await Axios.patch(`http://localhost:5000/leave-requests/${id}/first-approve`, { action: 'reject' }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(requests.filter(req => req.id !== id));
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    const columns = [
        { field: 'employeeId', headerName: 'Employee ID', width: 100 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'typeOfLeave', headerName: 'Type of Leave', width: 250 },
        { field: 'requestStatus', headerName: 'Request Status', width: 150 },
        { field: 'quantity', headerName: 'Quantity', width: 100 },
        { field: 'time', headerName: 'Time', width: 200 },
        { field: 'dates', headerName: 'Dates', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
                <>
                    <Button variant="contained" color="success" onClick={() => handleApprove(params.row.id)}>
                        Approve
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleReject(params.row.id)}>
                        Reject
                    </Button>
                </>
            ),
        },
        { field: 'lastModified', headerName: 'Last Modified', width: 200 },
    ];

    return (
        <div className="leave-requests-container">
            <h1 className="title">First Approval Requests</h1>
            <Button 
                variant="contained" 
                style={{ position: 'absolute', top: 20, right: 20 }}
                onClick={() => setIsCalendarOpen(true)}
            >
                Shared Calendar
            </Button>
            <div className="data-grid-container">
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid rows={requests} columns={columns} pageSize={10} rowsPerPageOptions={[10]} />
                </div>
            </div>
            <Modal
                open={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                aria-labelledby="shared-calendar-modal"
                aria-describedby="shared-calendar-modal-description"
            >
                <div className="modal">
                    <FirstApproverSharedCalendar token={token} onClose={() => setIsCalendarOpen(false)} />
                </div>
            </Modal>
        </div>
    );
};

export default FirstApprovalRequests;
