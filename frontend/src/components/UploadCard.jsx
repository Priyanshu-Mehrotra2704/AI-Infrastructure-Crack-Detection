function UploadCard ({setFile,preview,setPreview}){
    const handleChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFile(file);
        setPreview(URL.createObjectURL(file));
    }

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleChange} />
            {preview && <img src={preview} alt="Preview" style={{ width: '300' }} />}
        </div>
    )
}
export default UploadCard;