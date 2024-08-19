
import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import LeaveDaysModal from '../LeaveDaysModal/LeaveDaysModal';
import LeaveSummaryModal from '../LeaveSummaryModal/LeaveSummaryModal';

const LeavesPage = () => {
    const [employee, setEmployee] = useState({});
    const [leaveTransactions, setLeaveTransactions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionType, setActionType] = useState('');
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    const getEmployee = async () => {
        const response = await Axios.get(`http://localhost:5000/employee/${window.location.pathname.split("/")[2]}`);
        setEmployee(response.data);
    };

    const getLeaveTransactions = async () => {
        const response = await Axios.get(`http://localhost:5000/leave-requests/${window.location.pathname.split("/")[2]}`, {
            headers: { Authorization: `Bearer ${document.cookie.split('=')[1]}` },
        });
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
            timeZone: 'Etc/GMT-3',
        };
        const transactionsWithFormattedTimestamps = response.data.map(transaction => {
            const formattedTransaction = {
                ...transaction,
                dates: transaction.dates || "No Dates",
                time: ['Marital', 'Paternity', 'Maternity'].includes(transaction.typeOfLeave) ? '' : (transaction.time || 'N/A'),
                lastModified: new Date(transaction.lastModified).toLocaleString('en-US', options)
            };
            console.log(`Transaction ID ${transaction.id}: Time values - ${transaction.time}`);
            return formattedTransaction;
        });
        setLeaveTransactions(transactionsWithFormattedTimestamps);
    };

    useEffect(() => {
        getEmployee();
        getLeaveTransactions();
    }, []);

    const handleOpenModal = (type) => {
        setActionType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleOpenSummaryModal = () => {
        setIsSummaryModalOpen(true);
    };

    const handleCloseSummaryModal = () => {
        setIsSummaryModalOpen(false);
    };

    const refreshData = () => {
        getEmployee();
        getLeaveTransactions();
    };

    const columns = [
        { field: 'typeOfLeave', headerName: 'Type of Leave', width: 200 },
        { field: 'requestStatus', headerName: 'Request Status', width: 200 },
        { field: 'quantity', headerName: 'Quantity', width: 150 },
        { field: 'dates', headerName: 'Dates', width: 250 },
        { field: 'time', headerName: 'Time', width: 200 },
        { field: 'lastModified', headerName: 'Last Modified', width: 250 }
    ];

    return (
        <div style={{ padding: "50px" }} id="leaves-modal">
            <div className="leaves__employee--details" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <p><b>Employee Name: </b>{employee.first_name} {employee.last_name}</p>
                    <p><b>Department: </b>{employee.department_name}</p>
                    <p><b>Remaining Days: </b>{employee.days}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <Button style={{ marginBottom: "5px" }} variant="contained" color="success" size="small" onClick={() => handleOpenModal('Add')}>Add Days</Button>
                    <Button style={{ marginBottom: "5px" }} variant="contained" color="error" size="small" onClick={() => handleOpenModal('Remove')}>Remove Days</Button>
                    <Button variant="contained" color="primary" size="small" onClick={handleOpenSummaryModal}>Leave Summary</Button>
                </div>
            </div>
            <DataGrid
                style={{ marginTop: "30px" }}
                rows={leaveTransactions}
                columns={columns}
            />
            <LeaveDaysModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                employeeId={window.location.pathname.split("/")[2]}
                actionType={actionType}
                refreshData={refreshData}
                token={document.cookie.split('=')[1]}
            />
            <LeaveSummaryModal
                isOpen={isSummaryModalOpen}
                onClose={handleCloseSummaryModal}
                employeeId={window.location.pathname.split("/")[2]}
            />
        </div>
    );
};

export default LeavesPage;
