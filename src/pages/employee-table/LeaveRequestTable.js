import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import AddLeaveRequestModal from '../../components/AddLeaveRequestModal/AddLeaveRequestModal';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './LeaveRequestsTable.css';

const LeaveRequestsTable = ({ token, userId, employees, departments }) => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [employee, setEmployee] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    useEffect(() => {
        const fetchLeaveRequests = async () => {
            try {
                const response = await Axios.get(`http://localhost:5000/leave-requests/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const formattedRequests = response.data.map(request => ({
                    ...request,
                    dates: request.dates ? request.dates.split(',').map(date => new Date(date).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })).join(', ') : "No Dates",
                    time: request.time ? request.time.split(',').join(', ') : 'N/A', // Handle time field
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
                setLeaveRequests(formattedRequests);
            } catch (error) {
                console.error('Error fetching leave requests:', error);
            }
        };
        console.log("formatted: "+leaveRequests)

        const fetchEmployee = async () => {
            try {
                const response = await Axios.get(`http://localhost:5000/employee/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEmployee(response.data);
            } catch (error) {
                console.error('Error fetching employee details:', error);
            }
        };

        fetchLeaveRequests();
        fetchEmployee();
    }, [token, userId]);

    const handleAddRequestClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleRequestAdded = () => {
        setIsModalOpen(false);
        window.location.reload();
    };

    const handleMenuClick = (event, id) => {
        setAnchorEl(event.currentTarget);
        setSelectedRequestId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRequestId(null);
    };

    const handleCancelRequest = async () => {
        try {
            await Axios.patch(`http://localhost:5000/leave-requests/${selectedRequestId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeaveRequests(leaveRequests.map(req => 
                req.id === selectedRequestId ? 
                { ...req, requestStatus: req.requestStatus === 'Pending Manager' ? 'Cancelled' : 'Cancel Requested' } 
                : req
            ));
            handleMenuClose();
        } catch (error) {
            console.error('Error cancelling leave request:', error);
        }
    };

    const columns = [
        { field: 'typeOfLeave', headerName: 'Type of Leave', width: 150 },
        { field: 'requestStatus', headerName: 'Request Status', width: 150 },
        { field: 'quantity', headerName: 'Quantity', width: 100 },
        { field: 'dates', headerName: 'Dates', width: 300 },
        { field: 'time', headerName: 'Time', width: 200 }, // Add this column
        { field: 'lastModified', headerName: 'Last Modified', width: 200 },
        {
            field: 'actions',
            headerName: '',
            width: 100,
            renderCell: (params) => (
                <>
                    {(params.row.requestStatus === 'Pending Manager' || params.row.requestStatus === 'Approved' || params.row.requestStatus === 'Cancel Requested') && (
                        <>
                            <IconButton onClick={(event) => handleMenuClick(event, params.row.id)}>
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={handleCancelRequest}>
                                    {params.row.requestStatus === 'Pending Manager' ? 'Cancel' : 'Request Cancel'}
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </>
            ),
        },
    ];

    return (
        <div className="leave-requests-container">
            <h1 className="title">Leave Requests</h1>
            <div className="employee-info">
                <p><b>Employee ID:</b> {employee.id}</p>
                <p><b>Name:</b> {employee.first_name} {employee.last_name}</p>
                <p><b>Remaining Days:</b> {employee.days}</p>
            </div>
            <div className="button-container">
                <button className="button add-request" onClick={handleAddRequestClick}>+ ADD REQUEST</button>
            </div>
            <div className="data-grid-container">
                <DataGrid 
                    rows={leaveRequests} 
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
            <AddLeaveRequestModal
                employeeId={userId}
                token={token}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onRequestAdded={handleRequestAdded}
                employees={employees}
                departments={departments}
                leaveRequests={leaveRequests}
            />
        </div>
    );
};

export default LeaveRequestsTable;
