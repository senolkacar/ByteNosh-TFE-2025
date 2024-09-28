"use client";

export default function DownloadApp() {
    return (
        <div className="container mt-6">
            <div className="row flex">
                <div className="col-lg-2 align-self-center">
                        <h2 className="text-6xl font-semibold mb-3 ml-4">Download the ByteNosh App.</h2>
                        <p className="font-light ml-4">Get the ByteNosh app on your phone and manage your restaurant on the go.</p>
                    <div className="flex items-center mt-2">
                        <a href="http://www.google.com"><img src="http://localhost:5000/images/playstore.png" alt="playstore" width="300" height="300" className="transform hover:scale-110 transition duration-300"/></a>
                        <a href="http://www.apple.be"><img src="http://localhost:5000/images/appstore.png" alt="appstore" width="300" height="300" className="transform hover:scale-110 transition duration-300"/></a>
                    </div>
                </div>
                <div className="col-lg-6">
                    <img src="http://localhost:5000/images/phone.png" alt="Phone" className="w-full"/>
                </div>
            </div>
        </div>
    );
}