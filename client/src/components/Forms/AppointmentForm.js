import React, { useContext } from "react";
import { UserContext } from '../../Context/UserContext'


function AppointmentForm(props) {
    const { currentUser } = useContext(UserContext);

    return (
        <form name={props.formName} onSubmit={props.formOnSubmit}>
            <div className="form-row">
                <div className="form-group col-11 mx-auto">
                    <label htmlFor="appDate">Appointment Date :</label>
                    <input type="text" name="appDate" className="form-control " disabled defaultValue={props.appDate} required></input>
                </div>

                <div className="form-group col-11 pl-3 mx-auto">
                    <label htmlFor="LastName">Appointment Time :</label>
                    {/* <input type="text" name="lastName" placeholder="Appointment Date" className="form-control" required defaultValue={props.lastName}  ></input> */}
                    <select name="appTime" id="appTime" className="form-control" aria-label="Default select example" required defaultValue={props.appTime}>
                        <option value={props.appTime}>{props.appTime}</option>
                        {
                            props.availableSlots.map(slot => {
                                if (props.appTime !== slot)
                                    return <option key={slot} value={slot}>{slot}</option>
                                return null;
                            })
                        }
                    </select>
                </div>

                <div className="form-group col-11 pl-3 mx-auto">
                    {/* <label htmlFor="doctor">Doctor :</label>
                    <select name="doctor" id="doctor" className="form-control" aria-label="Default select example" required disabled>
                        <option selected value={props.doctor.doctorId}>{props.doctor.firstName} {props.doctor.lastName}</option>
                    </select> */}
                    <label htmlFor="doctor">Doctor: </label>
                    <select name="doctor" id="doctor" className="form-control" aria-label="Default select example" required defaultValue={props.doctorSelected || ''} disabled={Boolean(props.doctorSelected)}>
                        <option value=''>Choose Doctor</option>
                        {
                            props.doctorList.map(doctor => {
                                if (props.doctorSelected === doctor._id) {
                                    return <option key={doctor._id} value={doctor._id}>{doctor.userId.firstName} {doctor.userId.lastName}</option>
                                }
                                else {
                                    return <option key={doctor._id} value={doctor._id} >{doctor.userId.firstName} {doctor.userId.lastName}</option>
                                }

                            })
                        }
                    </select>
                </div>
                <div className="form-group col-11 pl-3 mx-auto">
                    <label htmlFor="patient">Patient :</label>
                    <select name="patient" className="form-control" required defaultValue={props.patientSelected || ''} disabled={currentUser.userType === "Patient"}>
                        <option value='' disabled>Choose Patient</option>
                        {props.patientList
                            .map((patient, i) => {
                                if (props.patientSelected === patient._id) {
                                    return <option key={i} value={patient._id}>{patient.userId.firstName} {patient.userId.lastName}</option>
                                }
                                else {
                                    return <option key={i} value={patient._id}>{patient.userId.firstName} {patient.userId.lastName}</option>
                                }
                            })}
                    </select>
                </div>
            </div>
            <input type="hidden" name="id" defaultValue={props.appointmentId} />
            <div className="text-center">
                <input type="submit" className="btn btn-primary my-2 mx-4  col-4 " id="customBtn" value="Submit"></input>
            </div>


        </form>
    );
}

export default AppointmentForm;
