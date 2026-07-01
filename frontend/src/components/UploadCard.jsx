function UploadCard({
    setFile,
    preview,
    setPreview
}) {

    const handleChange = (e) => {

        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        setFile(selectedFile);

        setPreview(
            URL.createObjectURL(selectedFile)
        );
    };

    return (

        <div className="bg-white rounded-2xl shadow-lg p-8">

            <h2 className="text-2xl font-bold text-gray-800 mb-2">

                Upload Image

            </h2>

            <p className="text-gray-500 mb-6">

                Upload infrastructure images for crack detection.

            </p>

            <label
                className="
                flex
                flex-col
                items-center
                justify-center
                border-2
                border-dashed
                border-blue-400
                rounded-xl
                p-8
                cursor-pointer
                hover:bg-blue-50
                transition"
            >

                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChange}
                />

                <span className="text-5xl mb-4">
                    📤
                </span>

                <p className="font-semibold">

                    Click to Upload

                </p>

                <p className="text-gray-500 text-sm">

                    JPG • PNG • JPEG

                </p>

            </label>

            {preview && (

                <div className="mt-6">

                    <img
                        src={preview}
                        alt="Preview"
                        className="
                        rounded-xl
                        shadow-md
                        w-full
                        object-cover
                        max-h-96"
                    />

                </div>

            )}

        </div>

    );

}

export default UploadCard;