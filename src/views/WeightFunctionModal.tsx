import React, { useState } from 'react';

interface WeightFunctionModalProps {
  onClose: () => void;
  onSave: (name: string, Sigma: string[], values: { [key: string]: number }) => void;
}

const WeightFunctionModal: React.FC<WeightFunctionModalProps> = ({ onClose, onSave }) => {
  const [weightName, setWeightName] = useState("");
  const [weightSigma, setWeightSigma] = useState<string[]>([]);
  const [weightValues, setWeightValues] = useState<{ [key: string]: string }>({});
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const handleWeightSigmaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sigmaArray = e.target.value.split(",");
    setWeightSigma(sigmaArray);

    const newWeightValues: { [key: string]: string } = {};
    sigmaArray.forEach((x) => {
      sigmaArray.forEach((y) => {
        newWeightValues[`${x},${y}`] = "0";
        newWeightValues[`${x},epsilon`] = "0";
        newWeightValues[`epsilon,${x}`] = "0";
      });
    });
    setWeightValues(newWeightValues);
  };

    const handleWeightValueChange = (key: string, value: string) => {
        console.log(value);
    setWeightValues((prev) => ({
      ...prev,
      [key]: value,
    }));
    };
    

  
    const handleSave = () => {
        const numberWeightValues: { [key: string]: number } = {};
        const newWeightValues: { [key: string]: number } = {};
        weightSigma.forEach((x) => {
            weightSigma.forEach((y) => {
        newWeightValues[`${x},${y}`] = 0;
        newWeightValues[`${x},epsilon`] = 0;
        newWeightValues[`epsilon,${x}`] = 0;
      });
    });
      const newErrors: { [key: string]: boolean } = {};
      let isValid = true;

    Object.keys(weightValues).forEach((key) => {
        const value = weightValues[key];
        const floatVal = parseFloat(value.replace(" ", ""));
        console.log("key", key);
        console.log("value", value);
        console.log("floatVal", floatVal);
      if (isNaN(floatVal)) {
        newErrors[key] = true;
        isValid = false;
      } else {
          newErrors[key] = false;
          console.log("key", key);
            console.log("floatVal", floatVal);
            numberWeightValues[key] = floatVal;
          console.log("numberWeightValues", numberWeightValues);
      }
    });
    setErrors(newErrors);
        if (isValid) {
        console.log("numberWeightValues", numberWeightValues);
      const res = onSave(weightName, weightSigma, numberWeightValues);
      // If res is undefined, then close the modal
      if (res === undefined) {
        onClose();
      }
    } else {
        alert("Please fill in all the fields only numbers");
      }

    
  };

  return (
    <div className="app-container">
      <div className="weight-page">
        <button className="back-button" onClick={onClose}>Back</button>
        <h3 className="weight-page-title">Add Weight Function</h3>
        <div className="weight-page-content">
          <div className="weight-form-group">
            <label className="weight-form-label">Weight Name:</label>
            <input
              type="text"
              value={weightName}
              onChange={(e) => setWeightName(e.target.value)}
              className="weight-input-field"
              placeholder="Enter weight function name"
            />
          </div>
          <div className="weight-form-group">
            <label className="weight-form-label">Sigma:</label>
            <input
              type="text"
              value={weightSigma.join(",")}
              onChange={handleWeightSigmaChange}
              className="weight-input-field"
              placeholder="Enter sigma values (comma-separated)"
            />
          </div>
          <div className="weight-values-grid">
            {Object.keys(weightValues).map((key) => (
              <div key={key} className="weight-value-input">
                <label>{key}:</label>
                <input
                  type="text"
                  value={weightValues[key]}
                  onChange={(e) => handleWeightValueChange(key, e.target.value)}
                  className={`weight-input-box ${errors[key] ? 'error' : ''}`}
                  placeholder={`Enter value for ${key}`}
                />
                {errors[key] && <span className="error-message">Invalid value</span>}
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="weight-save-button">Save</button>
        </div>
      </div>
    </div>
  );
};

export default WeightFunctionModal;
