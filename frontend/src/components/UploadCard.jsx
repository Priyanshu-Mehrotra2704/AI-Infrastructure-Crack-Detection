function UploadCard({
    setFile,
    preview,
    setPreview
}) {

    const handleFileChange = (e) => {

        const selectedFiles = Array.from(e.target.files);

        setFile(selectedFiles);

        const imagePreviews = selectedFiles.map((file) =>

            URL.createObjectURL(file)

        );

        setPreview(imagePreviews);

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
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
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

            <div className="grid grid-cols-2 gap-4 mt-4">

                {
                    preview.map((image, index) => (

                        <img

                            key={index}

                            src={image}

                            alt="preview"

                            className="rounded-xl h-32 w-full object-cover"

                        />

                    ))
                }

            </div>

        </div>

    );

}

export default UploadCard;