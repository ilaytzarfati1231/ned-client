import { useState } from "react";
import { Automata } from "../types";
import { API_URL } from "../config";

interface AutomataEntryProps {
  index: number;
  automata: Automata;
  deleteAutomata: (index: number) => void;
  isSelected: boolean;
  setIsSelected: (value: boolean) => void;
  weightFunctions: string[];
}

export const AutomataEntry: React.FC<AutomataEntryProps> = ({
  index,
  automata,
  deleteAutomata,
  isSelected,
  setIsSelected,
  weightFunctions,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [infInfValue, setInfInfValue] = useState<{ [key: string]: string } >({});
  const [omega_value, setOmegaValue] = useState<{ [key: string]: string } >({});
  const [sumInfInfValue, setSumInfInfValue] = useState<{ [key: string]: string } >({});
  const [sumInfInfWords, setSumInfInfWords] = useState<{ [key: string]: string[] }>({});
  const [InfInfWords, setInfInfWords] = useState<{ [key: string]: string[] } >({});
  const [omegaWords, setOmegaWords] = useState<{ [key: string]: string[] }>({});
  const [weightFunctionIndex, setWeightFunctionIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const viewAutomata = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/generate-automata-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(automata),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setImage(imageUrl);
    } catch (error) {
      console.error("Error fetching image:", error);
    } finally {
      setLoading(false);
    }
  };
  const toggleMenu = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: string) => {
    console.log(option);
    setSelectedOption(option);
    setWeightFunctionIndex(weightFunctions.indexOf(option)); // Set the selected option index
    setFilter(option); // Optionally set the filter to the selected option
    setIsOpen(false);  // Close the menu after selection
  };

  const handleCheckboxChange = () => {
    setShowImage((oldValue) => {
      const newValue = !oldValue;
      if (newValue) {
        viewAutomata();
      } else {
        setImage(null);
      }
      return newValue;
    });
  };

  const openFullscreen = () => {
    if (image) {
      window.open(image, "_blank");
    }
  };
  function editPath(first_path: string, second_path: string) {
    let newPath = "";
    for (let i = 0; i < first_path.length; i++) {
      newPath += "["+first_path[i]+"->"+second_path[i]+"]";
    }
    return newPath;
  }

  const openDetailsWindow = async() => {
   
    const detailsWindow = window.open(automata.name, "_blank", "width=600,height=400");
    if (!detailsWindow) {
      alert("Please allow popups for this website");
      return;
    }
    detailsWindow.document.write("<h1>Automata Details</h1>");
    detailsWindow.document.write(`<p>Name: ${automata.name}</p>`);
    detailsWindow.document.write(`<p>Regex: ${automata.regex_string}</p>`);
    detailsWindow.document.write(`<p>States: ${automata.Q.join(", ")}</p>`);
    detailsWindow.document.write(`<p>Alphabet: ${automata.Sigma.join(", ")}</p>`);
    detailsWindow.document.write(`<p>Transitions: ${JSON.stringify(automata.Delta)}</p>`);
    detailsWindow.document.write(`<p>Start State: ${automata.q0}</p>`);
    detailsWindow.document.write(`<p>Final States: ${automata.F.join(", ")}</p>`);
    if (automata.name.includes("omega") && automata.name.includes("is edit")) {
      for (const key in omega_value) {
        if (infInfValue[key] === "ERROR") {
          continue;
        }
        if (!weightFunctions.includes(key)) {
          continue;
        }
        detailsWindow.document.write(`<p>ωNED: ${key}: ${omega_value[key]}, words:   ${omegaWords[key][2]} -> ${omegaWords[key][3]} edit path:${editPath(omegaWords[key][0],omegaWords[key][1])}  </p>`);
      }
    }
    else if (!automata.name.includes("omega") && automata.name.includes("is edit")) {
      for (const key in infInfValue) {
        if (infInfValue[key] === "ERROR") {
          continue;
        }
        if (!weightFunctions.includes(key)) {
          continue;
        }
        console.log(InfInfWords[key]);
        detailsWindow.document.write(`<p>MEAN: ${key}: ${infInfValue[key]}, words: ${InfInfWords[key][2]} -> ${InfInfWords[key][3]} edit path:${editPath(InfInfWords[key][0],InfInfWords[key][1])}  </p>`);
      }
      for (const key in sumInfInfValue) {
        if (infInfValue[key] === "ERROR") {
          continue;
        }
        if (!weightFunctions.includes(key)) {
          continue;
        }
        detailsWindow.document.write(`<p>SUM: ${key}: ${sumInfInfValue[key]}, words: ${sumInfInfWords[key][2]} -> ${sumInfInfWords[key][3]} edit path:${editPath(sumInfInfWords[key][0],sumInfInfWords[key][1])}  </p>`);
      }
    }
    if (image && automata.Q.length <= 100) {
      detailsWindow.document.write(`<img src="${image}" alt="Automata ${index}" style="max-width: 100%; max-height: 100px; margin-top: 10px;">`);
    }
  };

  const omega_inf_inf = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/omega_inf_inf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          regex_string: automata.regex_string, name: automata.name, Q: automata.Q, Sigma: automata.Sigma,
          Delta: automata.Delta, q0: automata.q0, F: automata.F,
          weightFunction: weightFunctionIndex ? weightFunctionIndex : 0
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log(data);
      setLoading(false);
      setOmegaValue((prev) => ({
        ...prev,
        [weightFunctions[weightFunctionIndex?weightFunctionIndex:0]]: data.omega_inf_inf,
          }));
      
      console.log(data.words);
      setOmegaWords((prev) => ({
        ...prev,
        [weightFunctions[weightFunctionIndex?weightFunctionIndex:0]]: data.words,
          }));
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setOmegaValue((prev) => ({
        ...prev,
        [weightFunctions[weightFunctionIndex?weightFunctionIndex:0]]: "ERROR",
          }));
    }
  };
  const Inf_Inf = async () => {
    setLoading(true);
    console.log(weightFunctionIndex);
    try {
      const response = await fetch(`${API_URL}/Inf_Inf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          regex_string: automata.regex_string, name: automata.name, Q: automata.Q, Sigma: automata.Sigma,
          Delta: automata.Delta, q0: automata.q0, F: automata.F,
          weightFunction: weightFunctionIndex ? weightFunctionIndex : 0
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setLoading(false);
      setInfInfValue((prev) => ({
        ...prev,
        [weightFunctions[weightFunctionIndex?weightFunctionIndex:0]]: data.inf_inf,
          }));
      
      console.log(data.words);
      setInfInfWords((prev) => ({
        ...prev,
        [weightFunctions[weightFunctionIndex?weightFunctionIndex:0]]: data.words,
          }));
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setInfInfValue((prev) => ({
        ...prev,
        [weightFunctions[weightFunctionIndex?weightFunctionIndex:0]]: "ERROR",
          }));
    }
  };
  const Sum_Inf_Inf = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/Sum_Inf_Inf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          regex_string: automata.regex_string, name: automata.name, Q: automata.Q, Sigma: automata.Sigma,
          Delta: automata.Delta, q0: automata.q0, F: automata.F,
          weightFunction: weightFunctionIndex ? weightFunctionIndex : 0
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log(data);
      setSumInfInfValue((prev) => ({
        ...prev,
        [weightFunctions[weightFunctionIndex ? weightFunctionIndex:0]]: data.Sum_inf_inf,
          }));
      
      console.log(data.words);
      setSumInfInfWords((prev) => ({
        ...prev,
        [weightFunctions[weightFunctionIndex ? weightFunctionIndex:0]]: data.words,
      }));
      setLoading(false);

    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setSumInfInfValue((prev) => ({
        ...prev,
        [weightFunctions[weightFunctionIndex ? weightFunctionIndex:0]]: "ERROR",
          }));
    }
  };


  const filteredOptions = weightFunctions.filter(option =>
    option.toLowerCase().includes(filter.toLowerCase())
  );
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    if (weightFunctions.includes(e.target.value)) {
      console.log(weightFunctions.indexOf(e.target.value));
      setWeightFunctionIndex(weightFunctions.indexOf(e.target.value));
      console.log(weightFunctionIndex);
    }
  };
  
  return (
    <li
      style={{
        padding: "5px",
        borderBottom: "1px solid #ccc",
      }}
    >
      <div style={{ display: "flex", width: "100%" }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => setIsSelected(e.target.checked)}
        />
        <button onClick={handleCheckboxChange}>
          {showImage ? "Hide" : "Show"}
        </button>
        <span style={{ flex: 1, margin: "0 10px" }}>
          {automata.regex_string ? automata.regex_string : automata.name}
        </span>
       
         <button className="button" onClick={openDetailsWindow}>
          Details
        </button>
        {automata.name.includes("is edit") ?  (
       <div>
       <button onClick={toggleMenu}>
         {isOpen ? 'Close Options' : 'Open Options'}
       </button>
       {isOpen && (
         <div className="menu">
           <input
             type="text"
             value={filter}
             onChange={handleFilterChange}
             placeholder="Search options..."
             className="menu-filter"
           />
           <ul className="menu-list">
             {filteredOptions.length > 0 ? (
               filteredOptions.map((option, index) => (
                 <li key={index} onClick={() => handleOptionClick(option)} className="menu-item">
                   {option}
                 </li>
               ))
             ) : (
               <li>No options available</li>
             )}
           </ul>
         </div>
       )}
       {selectedOption && <p>Selected: {selectedOption}</p>}
     </div>
        ): null}
        {automata.name.includes("omega") && automata.name.includes("is edit") ?  (
        <button className="button" onClick={omega_inf_inf}>
        ωNED
        </button>
        ): null}
        {omega_value !== null && (
          <span style={{ marginLeft: "10px" }}>{omega_value[selectedOption?selectedOption:weightFunctions[0]]}</span>
        ) }

        {!automata.name.includes("omega") && automata.name.includes("is edit") ?  (
        <button className="button" onClick={Inf_Inf}>
        NED
        </button>
        ): null} 
        
        {infInfValue !== null && (
          <span style={{ marginLeft: "10px" }}>{infInfValue[selectedOption?selectedOption:weightFunctions[0]]}</span>
        )}
        {!automata.name.includes("omega") && automata.name.includes("is edit") ?  (
        
        <button className="button" onClick={Sum_Inf_Inf}>
        ED
        </button>
        ): null}
        {sumInfInfValue !== null && (
          <span style={{ marginLeft: "10px" }}>{sumInfInfValue[selectedOption?selectedOption:weightFunctions[0]]}</span>
        )}
        <button className="button" onClick={() => deleteAutomata(index)} style={{ marginLeft: "10px" }}>
          Delete
        </button>
        <button
          onClick={openFullscreen}
          style={{ marginLeft: "10px" }}
          disabled={!image}
        >
          Fullscreen
        </button>
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "center",
        }}
      >
        {loading && <h4 style={{ color: "blue" }}>Loading...</h4>}
        {image && showImage && (
          <img
            className="automata-image"
            src={image}
            alt={`Automata ${index}`}
            style={{
              marginTop: "10px",
              maxWidth: "100%",
              minHeight: "100px",
              maxHeight: "100px",
            }}
          />
        )}
      </div>
    </li>
  );
};
