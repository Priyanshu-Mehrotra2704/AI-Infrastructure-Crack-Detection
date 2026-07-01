function Loader() {

    return (

        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center items-center min-h-[420px]">

            <div
                className="
                w-20
                h-20
                border-8
                border-gray-200
                border-t-blue-600
                rounded-full
                animate-spin"
            />

            <h2 className="text-2xl font-bold mt-8">

                AI is Analyzing...

            </h2>

            <p className="text-gray-500 mt-4 text-center">

                Please wait while the model processes
                the uploaded image.

            </p>

        </div>

    );

}

export default Loader;