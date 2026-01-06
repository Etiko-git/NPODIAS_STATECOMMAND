import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON } from "react-leaflet";
import type { Incident } from "../api/types";
import lagosDivisions from "../data/lagos_divisions.geo.json";

const LAGOS_CENTER: [number, number] = [6.5244, 3.3792];

function sevColor(sev: Incident["severity"]) {
  if (sev === "RED") return "#DC2626";
  if (sev === "AMBER") return "#F59E0B";
  return "#22C55E";
}

function incidentToLatLng(i: Incident): [number, number] {
  const salt = i.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const lat = LAGOS_CENTER[0] + ((salt % 10) - 5) * 0.01;
  const lng = LAGOS_CENTER[1] + ((salt % 8) - 4) * 0.015;
  return [lat, lng];
}

export default function LagosMap({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="h-[260px] md:h-[340px]">
      <MapContainer center={LAGOS_CENTER} zoom={10} style={{ height: "100%", width: "100%", borderRadius: 12 }}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <GeoJSON
          data={lagosDivisions as any}
          style={() => ({ color: "#1E4C44", weight: 2, fillColor: "#0B241F", fillOpacity: 0.22 })}
          onEachFeature={(feature, layer) => {
            const name = (feature.properties as any)?.name ?? "Division";
            (layer as any).bindTooltip(name, { sticky: true, direction: "top", opacity: 0.95 });
            (layer as any).on("mouseover", () => (layer as any).setStyle({ fillOpacity: 0.35, weight: 3 }));
            (layer as any).on("mouseout", () => (layer as any).setStyle({ fillOpacity: 0.22, weight: 2 }));
          }}
        />

        {incidents.map((i) => {
          const [lat, lng] = incidentToLatLng(i);
          return (
            <CircleMarker key={i.id} center={[lat, lng]} radius={8} pathOptions={{ color: sevColor(i.severity), fillColor: sevColor(i.severity), fillOpacity: 0.9 }}>
              <Popup>
                <div style={{ fontWeight: 800 }}>{i.title}</div>
                <div style={{ fontSize: 12 }}>{i.location}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{i.minutesAgo} mins ago</div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
