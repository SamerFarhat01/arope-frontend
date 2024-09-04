import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import AddEmployeeModal from '../../components/EmployeeModal/AddEmployeeModal';
import './EmployeeTable.css';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const EmployeeTable = ({ token, employees, getEmployees, deleteEmployee, departments, setEmployees, locations }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const navigate = useNavigate();

    const handleAddEmployee = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleEmployeeAdded = (newEmployee) => {
        getEmployees();
        handleCloseModal();
    };

    const handleRowClick = (params) => {
        setSelectedEmployee(params.row);
        navigate(`/employee/${params.row.id}`);
    };
      
    // const columns = [
    //     { field: 'first_name', headerName: 'First Name', width: 150 },
    //     { field: 'middle_name', headerName: 'Middle Name', width: 150 },
    //     { field: 'last_name', headerName: 'Last Name', width: 150 },
    //     { field: 'email', headerName: 'Email', width: 200 },
    //     { field: 'department_name', headerName: 'Department', width: 150 },
    //     { field: 'manager_full_name', headerName: 'Manager', width: 150 },
    //     { field: 'days', headerName: 'Days', width: 100 } // New column for days
    // ];
    const columns = [
        { field: 'full_name', headerName: 'Name', width: 150 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'department_name', headerName: 'Department', width: 150 },
        { field: 'manager_full_name', headerName: 'Manager', width: 150 },
        { field: 'location_name', headerName: 'Location', width: 100 },
        { field: 'first_approver_name', headerName: 'First Approver', width: 200 },
        { field: 'days', headerName: 'Days', width: 100 },
        { field: 'leaves_taken', headerName: 'Leaves', width: 100 },
        { field: 'sick_leaves_taken', headerName: 'Sick Leaves', width: 100 },
        { field: 'start_date', headerName: 'Start Date', width: 150, renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString('en-GB') : '' },
        { field: 'end_date', headerName: 'End Date', width: 150, renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString('en-GB') : '' },
    ];
    
    
    
    
    

    return (
        <div>
            <div className="employees__table--container">
                <div className="employees__table--header">
                    <h1>Employees</h1>
                    <Button startIcon={<AddIcon />} variant="outlined" color="success" size="small" onClick={handleAddEmployee}>
                        Add Employee
                    </Button>
                </div>
                <DataGrid 
                    onRowClick={handleRowClick} 
                    rows={employees} 
                    columns={columns} 
                    sx={{
                        '& .MuiDataGrid-row:hover': {
                            cursor: 'pointer',
                        },
                    }}
                />
                <AddEmployeeModal
                    token={token}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onEmployeeAdded={handleEmployeeAdded}
                    departments={departments}
                    locations={locations}
                    selectedEmployee={selectedEmployee}
                />
            </div>
        </div>
    );
};

export default EmployeeTable;