
import React, { useState } from "react";
import { Automata } from "../types";
import { AutomataEntry } from "./AutomataEntry";
import logo from "../assets/logo.png";
import "./App.css"; // Create and import a CSS file for styling
import { API_URL } from "../config";
const App: React.FC = () => {
  const [automatas, setAutomatas] = useState<Automata[]>([]);
  const [newAutomataStr, setNewAutomataStr] = useState("");
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [showDictModal, setShowDictModal] = useState(false);

  const [Q, setQ] = useState<string[]>([""]);
  const [Sigma, setSigma] = useState<string[]>([""]);
  const [Delta, setDelta] = useState<string[]>([""]);
  const [q0, setQ0] = useState("");
  const [F, setF] = useState<string[]>([""]);
  const [name, setName] = useState<string>("");

  const addAutomataRegex = () => {
    if (newAutomataStr.trim() !== "") {
      const newAutomata: Automata = {
        regex_string: newAutomataStr,
        Q: [],
        Sigma: [],
        Delta: [],
        q0: "",
        F: [],
        name: newAutomataStr,
      };
      setAutomatas([...automatas, newAutomata]);
      setNewAutomataStr("");
      setName("");
    }
  };

  const addAutomataDict = () => {
    if (Q.length && Sigma.length && Delta.length && q0 && F.length) {
      const newAutomata: Automata = {
        regex_string: "",
        Q,
        Sigma,
        Delta,
        q0,
        F,
        name,
      };
      setAutomatas([...automatas, newAutomata]);
      setQ([""]);
      setSigma([""]);
      setDelta([""]);
      setQ0("");
      setF([""]);
      setName("");
      setShowDictModal(false); // Close the modal after adding
    }
  };
  const uploadFromTheFile = async () => {
    console.log("uploadFromTheFile");
    try {
      const response = await fetch(`${API_URL}/get-file`, {
        method: "GET",
      }); // replace 'automata.txt' with your file name
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const fileContent = await response.text();
      console.log('fileContent: ', fileContent);
      
      const lines = JSON.parse(fileContent);
      lines.forEach((line: string) => {
        const [name, Q, Sigma, Delta, q0, F] = line.split(";");
        console.log(name, Q, Sigma, Delta, q0, F);
        
        const newAutomata: Automata = {
          regex_string: "",
          Q: Q.split(",").map(item => item.trim()),
          Sigma: Sigma.split(",").map(item => item.trim()),
          Delta: Delta.split(",").map(item => item.trim()),
          q0: q0.trim(),
          F: F.split(",").map(item => item.trim()),
          name: name.trim(),
        };
        console.log(newAutomata);
        if (automatas.find(automata => automata.name === newAutomata.name)) {
          return;
        }
        setAutomatas(prevAutomatas => [...prevAutomatas, newAutomata]);
        setQ([""]);
        setSigma([""]);
        setDelta([""]);
        setQ0("");
        setF([""]);
        setName("");
      });
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };
  
  const deleteAutomata = async (index: number) => {

    const automata = automatas[index]
    try{
      const response = await fetch(`${API_URL}/delete-automata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(automata.name),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    }catch(e){
      console.log(e)
    }
    setAutomatas(automatas.filter((_, i) => i !== index));
    setSelectedIndices(selectedIndices.filter((i) => i !== index));
    
  };

  const setIsSelected = (index: number, isSelected: boolean) => {
    setSelectedIndices((prev) =>
      isSelected
        ? prev.length < 2
          ? [...prev, index]
          : [prev[1], index]
        : prev.filter((i) => i !== index)
    );
  };

  const addGraph = () => {
    console.log("selectedIndices: ", selectedIndices);
    const regex_strings = selectedIndices
      .map((i) => automatas[i])
      .map((automata) => automata.name);
    if (regex_strings.length < 2 || regex_strings.length > 2) {
      alert("Please select exactly 2 automatas");
      return;
    }
    if (
      regex_strings.filter((regex) =>
        regex.includes("is edit distance automaton")
      ).length > 0
    ) {
      alert(
        "you cannot select an edit distance automaton as input to another edit distance automaton"
      );
      return;
    }
    console.log("regex_strings: ", regex_strings);
    const Q = [];
    const first_automata = automatas.find((automata) => automata.name === regex_strings[0])
    const second_automata = automatas.find((automata) => automata.name === regex_strings[1])
    if (!first_automata || !second_automata) {
      alert("Automata not found");
      return;
    }
    for (let i = 0; i < first_automata.Q.length; i++){
      Q.push(first_automata.Q[i])
    }
    Q.push("SEP")
    for (let i = 0; i < second_automata.Q.length; i++){
      Q.push(second_automata.Q[i])
    }
    const Sigma = []
    for (let i = 0; i < first_automata.Sigma.length; i++){
      Sigma.push(first_automata.Sigma[i])
    }
    Sigma.push("SEP")
    for (let i = 0; i < second_automata.Sigma.length; i++){
      Sigma.push(second_automata.Sigma[i])
    }
    const Delta = []
    for (let i = 0; i < first_automata.Delta.length; i++){
      Delta.push(first_automata.Delta[i])
    }
    Delta.push("SEP")
    for (let i = 0; i < second_automata.Delta.length; i++){
      Delta.push(second_automata.Delta[i])
    }
    const q0 = first_automata.q0 + " SEP " + second_automata.q0
    const F = []
    for (let i = 0; i < first_automata.F.length; i++){
      F.push(first_automata.F[i])
    }
    F.push("SEP")
    for (let i = 0; i < second_automata.F.length; i++){
      F.push(second_automata.F[i])
    }

    const newAutomata: Automata = {
      regex_string: regex_strings.join(" $ ") + " is edit distance automaton",
      Q: Q,
      Sigma: Sigma,
      Delta: Delta,
      q0: q0,
      F: F,
      name: regex_strings.join(" $ ") + " is edit distance automaton",
    };
    setAutomatas([...automatas, newAutomata]);
    setQ([""]);
    setSigma([""]);
    setDelta([""]);
    setQ0("");
    setF([""]);
    setName("");
  };

  
  return (
    <div className="app-container">
      <div className="header">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="main-section">
        <div className="input-section">
          <input
            type="text"
            value={newAutomataStr}
            onChange={(e) => setNewAutomataStr(e.target.value)}
            className="input-field"
            placeholder="Enter automata regex"
          />
          <button onClick={addAutomataRegex} className="button">
            Add Automata by Regex
          </button>
        </div>

        <div className="button-container">
          <button
            onClick={() => setShowDictModal(true)}
            className="button"
            style={{ marginRight: '10px' }} // Adjust spacing if needed
          >
            Add Automata by Dict
          </button>
          {showDictModal && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={() => setShowDictModal(false)}>&times;</span>
                <h3>Add Automata by Dict</h3>
                <div className="form-group">
                  <label className="form-label">name:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="Enter name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Q:</label>
                  <input
                    type="text"
                    value={Q.join(",")}
                    onChange={(e) => setQ(e.target.value.split(","))}
                    className="input-field"
                    placeholder="Enter states (comma-separated)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sigma:</label>
                  <input
                    type="text"
                    value={Sigma.join(",")}
                    onChange={(e) => setSigma(e.target.value.split(","))}
                    className="input-field"
                    placeholder="Enter alphabet (comma-separated)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Delta:</label>
                  <input
                    type="text"
                    value={Delta.join(",")}
                    onChange={(e) => setDelta(e.target.value.split(","))}
                    className="input-field"
                    placeholder="Enter transitions (comma-separated)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">q0:</label>
                  <input
                    type="text"
                    value={q0}
                    onChange={(e) => setQ0(e.target.value)}
                    className="input-field"
                    placeholder="Enter initial state"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">F:</label>
                  <input
                    type="text"
                    value={F.join(",")}
                    onChange={(e) => setF(e.target.value.split(","))}
                    className="input-field"
                    placeholder="Enter final states (comma-separated)"
                  />
                </div>
                <button onClick={addAutomataDict} className="button">
                  Add Automata by Dict
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ul className="automata-list">
        {automatas.map((automata, index) => (
          <AutomataEntry
            key={index}
            index={index}
            automata={automata}
            deleteAutomata={deleteAutomata}
            isSelected={selectedIndices.includes(index)}
            setIsSelected={(isSelected) => setIsSelected(index, isSelected)}
          />
        ))}
      </ul>
      <div className="graph-section">
      <button onClick={uploadFromTheFile} className="button">
          Upload Automata from the file
        </button>
        <button onClick={addGraph} className="button">
          Add Edit Distance Automaton
        </button>
        
      </div>
      
      

      <footer>© NED Client v1.0 - Ilay Tzarfati 2024</footer>
    </div>
  );
};
export default App;
