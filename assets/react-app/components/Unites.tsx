import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const Unites: React.FC = () => {
    const context = useContext(AppContext);
    const [hasFetched, setHasFetched] = useState(false); // Évite les fetch multiples

    useEffect(() => {
        if (!context || hasFetched) return; // Ne fetch que si pas déjà fait
        axios
            .get("http://192.168.1.110/export/api/unites")
            .then((res) => {
                console.log("Fetched unites:", res.data);
                context.setUnites(res.data);
                setHasFetched(true); // Marque comme fetché
            })
            .catch((err) => console.error("Fetch error:", err));
    }, [context, hasFetched]); // Dépendances explicites

    if (!context) return null;

    context.unites.forEach(point => {
        const marker = L.marker([point.lat, point.lng]).addTo(pointsLayer);
        if (point.label) {
            marker.bindPopup(`<b>${point.label}</b><br>Lat: ${point.lat.toFixed(4)}, Lng: ${point.lng.toFixed(4)}`);
        }
    });

    return (
        <ul>
            {context.unites.map((point) => (
                <li key={p.id}>
                    {p.name}: {p.code}
                </li>
            ))}
        </ul>
    );
};

export default Unites;
