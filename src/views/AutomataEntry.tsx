import { useState } from "react";
import { Automata } from "../types";
import { API_URL } from "../config";

interface AutomataEntryProps {
  index: number;
  automata: Automata;
  deleteAutomata: (index: number) => void;
  isSelected: boolean;
  setIsSelected: (value: boolean) => void;
}

export const AutomataEntry: React.FC<AutomataEntryProps> = ({
  index,
  automata,
  deleteAutomata,
  isSelected,
  setIsSelected,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [infInfValue, setInfInfValue] = useState<string | null>(null);
  const [omega_value, setOmegaValue] = useState<string | null>(null);
  const [sumInfInfValue, setSumInfInfValue] = useState<string | null>(null);
  const [sumInfInfWords, setSumInfInfWords] = useState<string[] | null>(null);
  const [InfInfWords, setInfInfWords] = useState<string[] | null>(null);
  const [omegaWords, setOmegaWords] = useState<string[] | null>(null);

  
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

  const openDetailsWindow = () => {
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
    detailsWindow.document.write(`<p>ωNED: ${omega_value} </p>`);
    detailsWindow.document.write(`<p>MEAN: ${infInfValue}</p>`);
    detailsWindow.document.write(`<p>SUM: ${sumInfInfValue}</p>`);
    console.log(omegaWords);
    detailsWindow.document.write(`<p>ωNED Words: ${omegaWords}</p>`);
    detailsWindow.document.write(`<p>MEAN Words: ${InfInfWords}</p>`);
    detailsWindow.document.write(`<p>SUM Words: ${sumInfInfWords}</p>`);
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
        body: JSON.stringify({ regex_string: automata.regex_string,name: automata.name,Q: automata.Q,Sigma: automata.Sigma,Delta: automata.Delta,q0: automata.q0,F: automata.F}),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log(data);
      setLoading(false);
      setOmegaValue(data.omega_inf_inf);
      console.log(data.words);
      setOmegaWords(data.words);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setOmegaValue("Error");
    }
  };
  const Inf_Inf = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/Inf_Inf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ regex_string: automata.regex_string,name: automata.name,Q: automata.Q,Sigma: automata.Sigma,Delta: automata.Delta,q0: automata.q0,F: automata.F}),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setLoading(false);
      setInfInfValue(data.inf_inf);
      setInfInfWords(data.words);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setInfInfValue("Error");
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
        body: JSON.stringify({ regex_string: automata.regex_string,name: automata.name,Q: automata.Q,Sigma: automata.Sigma,Delta: automata.Delta,q0: automata.q0,F: automata.F}),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log(data);
      setSumInfInfValue(data.Sum_inf_inf);
      setSumInfInfWords(data.words);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setSumInfInfValue("Error");
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
        {automata.name.includes("omega") && automata.name.includes("is edit") ?  (
        <button className="button" onClick={omega_inf_inf}>
        ωNED
        </button>
        ): null}
        {omega_value !== null && (
          <span style={{ marginLeft: "10px" }}>{omega_value}</span>
        ) }

        {!automata.name.includes("omega") && automata.name.includes("is edit") ?  (
        <button className="button" onClick={Inf_Inf}>
        MEAN
        </button>
        ): null} 
        
        {infInfValue !== null && (
          <span style={{ marginLeft: "10px" }}>{infInfValue}</span>
        )}
        {!automata.name.includes("omega") && automata.name.includes("is edit") ?  (
        
        <button className="button" onClick={Sum_Inf_Inf}>
        SUM
        </button>
        ): null}
        {sumInfInfValue !== null && (
          <span style={{ marginLeft: "10px" }}>{sumInfInfValue}</span>
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
