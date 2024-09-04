import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Button } from '@mui/material';
import Axios from 'axios';

const EditLocationModal = ({ isOpen, onClose, location, onLocationUpdated, token }) => {
    const [locationName, setLocationName] = useState('');
    const [branchManagerId, setBranchManagerId] = useState('');

    useEffect(() => {
        if (location) {
            setLocationName(location.location_name);
            setBranchManagerId(location.branch_manager_id || '');
        }
    }, [location]);

    const getCookie = (cname) => {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const hrUser = getCookie('user_id'); // Retrieve the HR user ID from cookie
            const updateData = { location_name: locationName, branch_manager_id: branchManagerId === '' ? null : branchManagerId, hrUser };

            await Axios.patch(`http://localhost:5000/locations/${location.id}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onLocationUpdated();
            onClose();
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To edit this location, please change the name and branch manager ID below.
                </DialogContentText>
                <form onSubmit={handleSubmit}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Location Name"
                        fullWidth
                        autoComplete="off"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Branch Manager ID"
                        fullWidth
                        autoComplete="off"
                        value={branchManagerId}
                        onChange={(e) => setBranchManagerId(e.target.value)}
                    />
                    <DialogActions>
                        <Button onClick={onClose} color="primary">
                            Cancel
                        </Button>
                        <Button type="submit" color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditLocationModal;