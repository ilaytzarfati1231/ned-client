export interface Automata {
    regex_string: string;
    Q: string[] ;
    Sigma: string[] ;
    Delta: string[];
    q0: string ;
    F: string[] ;
    name: string;
}