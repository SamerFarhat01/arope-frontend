import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlankPage.css';
import videoFile from '../../assets/anim_logo_eng_arb_1-1835582063.mp4';
import { Button, Menu, MenuItem } from '@mui/material';

const BlankPage = ({ isHr, isManager, isEmployee }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNavigate = (path) => {
        handleMenuClose();
        navigate(path);
    };

    return (
        <div className="blank-page">
            <video className="background-video" autoPlay loop muted>
                <source src={videoFile} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <Button
                variant="contained"
                onClick={handleMenuClick}
                className="menu-button"
            >
                Menu
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {isHr && (
                    <>
                        <MenuItem onClick={() => handleNavigate('/departments')}>Departments</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/staff')}>Staff</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/logs')}>Logs</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/holiday-form')}>Holiday Form</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/shared-calendar')}>Shared Calendar</MenuItem>
                    </>
                )}
                {isManager && (
                    <>
                        <MenuItem onClick={() => handleNavigate('/manager-leave-requests')}>Manager Leave Requests</MenuItem>
                    </>
                )}
                {(isHr || isManager || isEmployee) && (
                    <>
                        <MenuItem onClick={() => handleNavigate('/leave-requests')}>Leave Requests</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/leave-summary')}>Leave Summary</MenuItem>
                    </>
                )}
            </Menu>
        </div>
    );
};

export default BlankPage;

