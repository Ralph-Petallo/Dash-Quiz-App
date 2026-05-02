import { DataContext } from "@/store/dataStore";
import { useContext } from "react";

export default function useData() {
    return useContext(DataContext);
}
