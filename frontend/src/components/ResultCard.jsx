
function ResultCard({result}) {
    if (!result) return null;
  return (
    <div>

      <h2>
        Prediction:
        {result.prediction}
      </h2>

      <h3>
        Confidence:
        {result.confidence}%
      </h3>

    </div>
  )
}

export default ResultCard