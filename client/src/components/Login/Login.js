import React, { useContext, useState } from 'react';
import { useNavigate } from "react-router-dom";
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import { UserContext } from '../../Context/UserContext'

function Login() {
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
    const [errorList, setErrorList] = useState([]);

    const { signInUser } = useContext(UserContext);

    const handleDialogueOpen = () => {
        setErrorDialogueBoxOpen(true)
    };
    const handleDialogueClose = () => {
        setErrorList([]);
        setErrorDialogueBoxOpen(false)
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // TODO: Handle login form submission
        const form = document.forms.loginForm;
        let user = {
            email: form.email.value,
            password: form.password.value
        }
        fetch('http://localhost:3001/login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then(response => response.json())
            .then(data => {
                let respMessage = data.message;
                let user = data.user;
                if (respMessage === "success") {
                    signInUser(user, data.token);
                    navigate("/");
                }
                else {
                    //TODO: display error message
                    setErrorList(data.errors);
                    handleDialogueOpen();
                }
            });
    };

    const signUpClicked = () => {
        navigate("/signup");
    }

    return (
        <div className="h-screen w-full bg-[url('/public/images/login-background.png')] bg-cover bg-no-repeat">
            <div className="flex h-screen w-full items-center justify-center bg-[rgba(126,211,165,0.29)]">
                <div className="flex h-[70%] w-[45%] flex-col items-center justify-center bg-white/90 font-proxima max-[1000px]:h-[90%] max-[1000px]:w-[90%] max-[1000px]:bg-white/85">
                    <p className="px-0 pb-5 pt-2.5 text-center text-[#646D82]">Welcome back! Please login to your account</p>
                    <form onSubmit={handleSubmit} className="col-6" name="loginForm" id="loginForm">
                        <div className='form-floating mt-3 col-12 mx-2'>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                className="form-control !bg-transparent"
                            />
                            <label htmlFor="email" >Email</label>
                        </div>

                        <div className='form-floating mt-4 col-12 mx-2'>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="form-control !bg-transparent"
                                required
                                placeholder="password"
                            />
                            <label htmlFor="password">Password</label>
                        </div>
                        <div className='d-flex flex-column flex-md-row  mx-2 mt-5 justify-content-between'>
                            <button className="col-12 col-md-6 mr-5 rounded-[2px] border-0 bg-[#31b372] p-2.5 text-white transition duration-100 ease-in-out hover:scale-110" type="submit">Login</button>
                            <button className="col-12 col-md-6 mt-3 rounded-[2px] border border-[#31b372] bg-white p-2.5 text-green-700 transition duration-100 ease-in-out hover:scale-110 md:mt-0" onClick={signUpClicked} >Sign Up</button>
                        </div>
                    </form>
                </div>
            </div>
            <ErrorDialogueBox
                open={errorDialogueBoxOpen}
                handleToClose={handleDialogueClose}
                ErrorTitle="Login Error"
                ErrorList={errorList}
            />
        </div>
    );
}

export default Login;
