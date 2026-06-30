import {useState} from 'react'
import axios from 'axios'

import UploadCard from './components/UploadCard'
import ResultCard from './components/ResultCard'

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const analyzeImage = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://localhost:8000/predict/', formData);
      setResult(response.data);
    } catch (error) {
      console.error('Error analyzing image:', error);
    }
  }
  return (
     <div>

      <h1>
        AI Infrastructure
        Crack Detection
      </h1>

      <UploadCard
        setFile={setFile}
        preview={preview}
        setPreview={setPreview}
      />

      <button
        onClick={analyzeImage}
      >
        Analyze Crack
      </button>

      <ResultCard
        result={result}
      />

    </div>
  );
}
export default App;