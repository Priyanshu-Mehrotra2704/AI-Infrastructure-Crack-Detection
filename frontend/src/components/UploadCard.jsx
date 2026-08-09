import { FiUploadCloud } from "react-icons/fi";

// ---- Exact same props + handleFileChange logic from original ----
function UploadCard({ setFile, preview, setPreview }) {

    const handleFileChange = (e) => {

        const selectedFiles = Array.from(e.target.files);

        setFile(selectedFiles);

        const imagePreviews = selectedFiles.map((file) =>
            URL.createObjectURL(file)
        );

        setPreview(imagePreviews);
    };

    return (
        <div className="rounded-2xl border border-line bg-panel p-6">

            <h2 className="mb-1 font-display text-xl text-paper">
                Upload Image
            </h2>
            <p className="mb-5 text-sm text-steel">
                Upload infrastructure images for crack detection.
            </p>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-ink p-8 transition-colors hover:border-accent hover:bg-accent/5">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />
                <FiUploadCloud className="mb-3 h-10 w-10 text-steel" />
                <p className="font-semibold text-paper">Click to Upload</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-steel">
                    JPG · PNG · JPEG
                </p>
            </label>

            {/* Exact same preview grid logic from original */}
            <div className="mt-4 grid grid-cols-2 gap-3">
                {preview.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt="preview"
                        className="h-32 w-full rounded-xl border border-line object-cover"
                    />
                ))}
            </div>

        </div>
    );
}

export default UploadCard;