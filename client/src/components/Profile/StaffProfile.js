import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import { UserContext } from '../../Context/UserContext';

const pageClass = "mt-[50px] min-h-screen w-full bg-[#efececa7] p-8";
const panelClass = "mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-[0_8px_18px_rgba(0,0,0,0.08)]";
const titleClass = "mb-6 text-3xl font-bold text-[#31b372]";
const rowClass = "mb-4 border-b border-[#eee] pb-3";
const labelClass = "mb-1 text-sm font-bold uppercase text-[#666]";
const valueClass = "text-xl text-[#222]";

function roleNames(user) {
  return (user.roles || []).map((role) => (typeof role === 'string' ? role : role.name)).join(', ') || 'Staff';
}

export default function StaffProfile() {
  const { currentUser } = useContext(UserContext);

  return (
    <Box className={pageClass} component="main" sx={{ flexGrow: 1 }}>
      <div className={panelClass}>
        <h1 className={titleClass}>Profile</h1>
        <div className={rowClass}>
          <p className={labelClass}>Name</p>
          <p className={valueClass}>{currentUser.firstName} {currentUser.lastName}</p>
        </div>
        <div className={rowClass}>
          <p className={labelClass}>Account Type</p>
          <p className={valueClass}>{currentUser.userType}</p>
        </div>
        <div className={rowClass}>
          <p className={labelClass}>Access Role</p>
          <p className={valueClass}>{roleNames(currentUser)}</p>
        </div>
      </div>
    </Box>
  );
}
