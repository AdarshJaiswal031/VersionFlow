/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom"
import { useEffect } from "react";
const Home = () => {
    const navigate = useNavigate(); // Get the navigation function


    useEffect(() => {
        const handleOAuthSuccess = (_event, message) => {
            navigate("/dashboard");
        };

        if (window.electron && window.electron.on) {
            window.electron.on("oauth-success", handleOAuthSuccess);
        }

        return () => {
            if (window.electron && window.electron.on) {
                window.electron.on("oauth-success", () => { });
            }
        };
    }, [navigate]);

    const handleLogin = () => {
        if (window.electron && window.electron.send) {
            window.electron.send("oauth-start");
        }
    };

    return (
        <div className="w-[100%] h-[100%] bg-gray-100 flex justify-center items-center">
            <div className="w-96 p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">Login to VersionFlow</h2>

                <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    id="username"
                    type="text"
                    placeholder="Username"
                    className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <button
                    id="manual-login"
                    className="w-full cursor-pointer bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                    Login
                </button>

                <div className="flex items-center justify-center my-4">
                    <span className="border-t w-1/5"></span>
                    <span className="mx-2 text-gray-400">OR</span>
                    <span className="border-t w-1/5"></span>
                </div>

                <button
                    id="google-login"
                    className="text-zinc-700 w-full cursor-pointer flex items-center justify-center py-2 rounded-lg border-2 hover:bg-slate-50"
                    onClick={handleLogin}
                >
                    <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        className="w-5 h-5 mr-2"
                    />
                    Login with Google
                </button>

                <p id="error-msg" className="text-red-500 text-sm mt-4 hidden"></p>
            </div>
        </div>
    )
}

export default Home