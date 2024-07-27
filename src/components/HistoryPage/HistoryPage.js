import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

const HistoryPage = () => {
    const [leaveTransactions, setLeaveTransactions] = useState([]);

    const getLeaveTransactions = async () => {
        try {
            const response = await Axios.get(`http://localhost:5000/leave-transactions/${window.location.pathname.split("/")[2]}`);
            if (Array.isArray(response.data)) {
                setLeaveTransactions(response.data.map(transaction => ({
                    ...transaction,
                    timestamp: new Date(transaction.timestamp).toLocaleString("en-US", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: true,
                        timeZone: 'Etc/GMT-3'
                    }),
                    hr_user: `${transaction.hr_user_first_name} ${transaction.hr_user_last_name}`
                })));
            } else {
                console.error("Response data is not an array", response.data);
            }
        } catch (error) {
            console.error("Error fetching leave transactions", error);
        }
    };
    

    useEffect(() => {
        getLeaveTransactions();
    }, []);

    const columns = [
        { field: 'action', headerName: 'Action', width: 150 },
        { field: 'amount', headerName: 'Amount', width: 150 },
        { field: 'reason', headerName: 'Reason', width: 200 },
        { field: 'timestamp', headerName: 'Timestamp', width: 250 },
        { field: 'hr_user', headerName: 'HR User', width: 200, valueGetter: (params) => `${params.row.hr_first_name} ${params.row.hr_last_name}` }
    ];

    return (
        <div style={{ padding: "50px" }} id="history-page">
            <h1>Leave Transactions History</h1>
            <DataGrid
                style={{ marginTop: "30px" }}
                rows={leaveTransactions}
                columns={columns}
                autoHeight
                pageSize={10}
                rowsPerPageOptions={[10]}
            />
        </div>
    );
};

export default HistoryPage;


