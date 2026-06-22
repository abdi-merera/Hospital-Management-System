import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import { NavLink } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';

const pageClass = "mt-[50px] min-h-screen w-full bg-[#efececa7] p-8";
const titleClass = "mb-2 text-4xl font-bold text-[#31b372]";
const subtitleClass = "mb-8 text-lg text-[#555]";
const gridClass = "grid grid-cols-3 gap-5 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1";
const cardClass = "rounded-xl bg-white p-6 shadow-[0_8px_18px_rgba(0,0,0,0.08)]";
const cardTitleClass = "mb-3 text-xl font-bold text-[#31b372]";
const cardTextClass = "mb-5 text-[#555]";
const buttonClass = "inline-block rounded-full bg-[#31b372] px-5 py-2 font-bold text-white no-underline hover:bg-[#1b4f32] hover:text-white";

export default function ReceptionistDashboard() {
  const { currentUser } = useContext(UserContext);

  return (
    <Box className={pageClass} component="main" sx={{ flexGrow: 1 }}>
      <h1 className={titleClass}>Front Desk</h1>
      <p className={subtitleClass}>Welcome, {currentUser.firstName}. Manage patient registration and appointment booking from here.</p>

      <div className={gridClass}>
        <div className={cardClass}>
          <h2 className={cardTitleClass}>Book Appointment</h2>
          <p className={cardTextClass}>View doctor availability and book patients into open appointment slots.</p>
          <NavLink className={buttonClass} to="/appointments">Open Appointments</NavLink>
        </div>

        <div className={cardClass}>
          <h2 className={cardTitleClass}>Patient Records</h2>
          <p className={cardTextClass}>Register new patients and update demographic or contact information.</p>
          <NavLink className={buttonClass} to="/patients">Open Patients</NavLink>
        </div>

        <div className={cardClass}>
          <h2 className={cardTitleClass}>Daily Workflow</h2>
          <p className={cardTextClass}>Use appointments for scheduled visits. Clinical notes, diagnoses, prescriptions, and medicines are handled by clinical staff.</p>
        </div>
      </div>
    </Box>
  );
}
