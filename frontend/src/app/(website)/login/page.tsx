export default function Login(){
    return(
        <div className="bg-amber-50 px-4 py-24 pb-4">
            <section className="mx-auto max-w-screen-xl p-9">
                <div className="bg-grey-lighter min-h-screen flex flex-col">
                    <div className="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2">
                        <div className="bg-white px-6 py-8 rounded shadow-md text-black w-full">
                            <h1 className="mb-8 text-3xl text-center">Log In</h1>
                            <input
                                type="text"
                                className="block border border-grey-light w-full p-3 rounded mb-4"
                                name="email"
                                placeholder="Email"/>

                            <input
                                type="password"
                                className="block border border-grey-light w-full p-3 rounded mb-4"
                                name="password"
                                placeholder="Password"/>

                            <button
                                type="submit"
                                className="w-full text-center py-3 rounded bg-yellow-400 text-black hover:bg-yellow-500 focus:outline-none my-1"
                            >Login
                            </button>

                        </div>
                    </div>
                </div>
            </section>
        </div>
);
}