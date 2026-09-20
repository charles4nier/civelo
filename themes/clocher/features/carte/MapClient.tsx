'use client';

import { useState, useEffect, useRef } from 'react';
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	Polyline,
	GeoJSON,
	useMap
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import { Plus, Minus, SlidersHorizontal, ChevronDown } from 'lucide-react';
import type { POI, Sentier } from './data';
import './style.scss';

const TILES = {
	satellite: {
		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar',
		maxZoom: 19
	},
	plan: {
		url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		maxZoom: 19
	}
};

const CENTER: [number, number] = [45.7193, 1.3757];
const DEFAULT_ZOOM = 14;

const COLORS = {
	hebergement: '#e07050',
	'site-visite': '#3b5fc0'
};

const LABELS = {
	hebergement: 'Hébergement',
	'site-visite': 'Site de visite'
};

function createMarkerIcon(color: string, selected = false) {
	const size = selected ? 34 : 28;
	const border = selected ? 4 : 3;
	return L.divIcon({
		className: 'carte-marker-wrapper',
		html: `<div style="
			width:${size}px;height:${size}px;border-radius:50%;
			background:${color};
			border:${border}px solid #ffffff;
			box-shadow:0 4px 14px rgba(0,0,0,0.5);
			transition:all 0.2s;
		"></div>`,
		iconSize: [size, size],
		iconAnchor: [size / 2, size / 2],
		popupAnchor: [0, -(size / 2 + 4)]
	});
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClusterIcon(cluster: any) {
	const count = cluster.getChildCount();
	return L.divIcon({
		className: 'carte-cluster-wrapper',
		html: `<div style="
			width:44px;height:44px;border-radius:50%;
			background:rgba(255,255,255,0.95);
			border:3px solid #3b5fc0;
			display:flex;align-items:center;justify-content:center;
			font-family:system-ui,sans-serif;font-weight:700;font-size:14px;
			color:#3b5fc0;box-shadow:0 4px 16px rgba(0,0,0,0.35);
		">${count}</div>`,
		iconSize: [44, 44],
		iconAnchor: [22, 22]
	});
}

function MapResizer({ trigger }: { trigger: number | null }) {
	const map = useMap();
	useEffect(() => {
		map.invalidateSize({ animate: false });
	}, [trigger, map]);
	return null;
}

function MapControls() {
	const map = useMap();
	return (
		<div className="carte__controls">
			<div className="carte__zoom-btns">
				<button
					className="carte__ctrl-btn"
					onClick={() => map.zoomIn()}
					aria-label="Zoom +"
				>
					<Plus size={16} aria-hidden="true" />
				</button>
				<button
					className="carte__ctrl-btn"
					onClick={() => map.zoomOut()}
					aria-label="Zoom -"
				>
					<Minus size={16} aria-hidden="true" />
				</button>
			</div>
		</div>
	);
}

function FlyTo({
	id,
	markersRef,
	pois,
	sentiers
}: {
	id?: string;
	markersRef: React.RefObject<Map<string, L.Marker>>;
	pois: POI[];
	sentiers: Sentier[];
}) {
	const map = useMap();
	useEffect(() => {
		if (!id) return;
		const poi = pois.find((p) => p.id === id);
		if (poi) {
			map.flyTo([poi.lat, poi.lng], 16, { duration: 1.2 });
			setTimeout(() => {
				markersRef.current?.get(id)?.openPopup();
			}, 1350);
			return;
		}
		const sentier = sentiers.find((s) => s.id === id);
		if (sentier && sentier.coordinates.length > 0) {
			const bounds = L.latLngBounds(
				sentier.coordinates.map((c) => L.latLng(c[0], c[1]))
			);
			map.fitBounds(bounds, { padding: [60, 60], animate: true });
		}
	}, [id, map, markersRef, pois, sentiers]);
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FitCommune({ geoJSON, skip }: { geoJSON: any; skip: boolean }) {
	const map = useMap();
	useEffect(() => {
		if (skip || !geoJSON) return;
		try {
			const bounds = L.geoJSON(geoJSON).getBounds();
			if (bounds.isValid())
				map.fitBounds(bounds, { padding: [48, 48], animate: true });
		} catch {
			// contour invalide, on ignore
		}
	}, [geoJSON, skip, map]);
	return null;
}

type FilterState = {
	hebergement: boolean;
	'site-visite': boolean;
	sentier: boolean;
};
type Props = { initialId?: string; pois: POI[]; sentiers: Sentier[] };

const SHEET_MIN = 80; // handle + filtre header collapsed
const SHEET_MAX = 0.48; // 48vh = hauteur CSS initiale du sheet

export default function MapClient({ initialId, pois, sentiers }: Props) {
	const [filters, setFilters] = useState<FilterState>({
		hebergement: true,
		'site-visite': true,
		sentier: true
	});
	const [selectedId, setSelectedId] = useState<string | undefined>(initialId);
	const [filtersExpanded, setFiltersExpanded] = useState(false);
	const [sheetHeight, setSheetHeight] = useState<number | null>(null);
	const sheetRef = useRef<HTMLDivElement>(null);
	const handleRef = useRef<HTMLDivElement>(null);
	const markerRefs = useRef<Map<string, L.Marker>>(new Map());
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [communeGeoJSON, setCommuneGeoJSON] = useState<any>(null);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	useEffect(() => {
		fetch('https://geo.api.gouv.fr/communes/87148?fields=contour')
			.then((r) => r.json())
			.then((data) => {
				if (data.contour) {
					setCommuneGeoJSON({
						type: 'Feature',
						geometry: data.contour,
						properties: {}
					});
				}
			})
			.catch(() => null);
	}, []);

	const toggle = (key: keyof FilterState) =>
		setFilters((prev) => ({ ...prev, [key]: !prev[key] }));

	const visiblePois = pois.filter((p) => filters[p.category]);
	const visibleSentiers = sentiers.filter(() => filters.sentier);

	const handleSelectPoi = (id: string) => setSelectedId(id);

	const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		const sheet = sheetRef.current;
		const handle = handleRef.current;
		if (!sheet || !handle) return;

		const startY = e.clientY;
		const startH = sheet.getBoundingClientRect().height;
		const maxH = window.innerHeight * SHEET_MAX;

		handle.setPointerCapture(e.pointerId);

		const onMove = (ev: PointerEvent) => {
			const delta = startY - ev.clientY;
			const newH = Math.min(Math.max(startH + delta, SHEET_MIN), maxH);
			setSheetHeight(newH);
		};

		const onUp = () => {
			handle.removeEventListener('pointermove', onMove);
			handle.removeEventListener('pointerup', onUp);
		};

		handle.addEventListener('pointermove', onMove);
		handle.addEventListener('pointerup', onUp);
		e.preventDefault();
	};

	/* ---- Contenu partagé sidebar / panneau mobile ---- */

	const filtersSection = (
		<div className="carte__sidebar-filters">
			<div className="carte__sidebar-section-label">Afficher</div>
			<div className="carte__filter-group">
				<button
					className={`carte__filter ${filters.hebergement ? 'carte__filter--active' : ''}`}
					onClick={() => toggle('hebergement')}
					aria-pressed={filters.hebergement}
				>
					<span
						className="carte__filter-dot"
						style={{ background: COLORS.hebergement }}
					/>
					Hébergements
					<span className="carte__filter-count">
						{
							pois.filter((p) => p.category === 'hebergement')
								.length
						}
					</span>
				</button>
				<button
					className={`carte__filter ${filters['site-visite'] ? 'carte__filter--active' : ''}`}
					onClick={() => toggle('site-visite')}
					aria-pressed={filters['site-visite']}
				>
					<span
						className="carte__filter-dot"
						style={{ background: COLORS['site-visite'] }}
					/>
					Sites de visite
					<span className="carte__filter-count">
						{
							pois.filter((p) => p.category === 'site-visite')
								.length
						}
					</span>
				</button>
				<button
					className={`carte__filter ${filters.sentier ? 'carte__filter--active' : ''}`}
					onClick={() => toggle('sentier')}
					aria-pressed={filters.sentier}
				>
					<span
						className="carte__filter-dot"
						style={{ background: '#555' }}
					/>
					Sentiers
					<span className="carte__filter-count">
						{sentiers.length}
					</span>
				</button>
			</div>
		</div>
	);

	const listSection = (
		<div className="carte__sidebar-list">
			{visiblePois.length > 0 && (
				<>
					<div className="carte__sidebar-section-label">
						{visiblePois.length} lieu
						{visiblePois.length > 1 ? 'x' : ''}
					</div>
					{visiblePois.map((poi) => (
						<button
							key={poi.id}
							className={`carte__poi-card ${selectedId === poi.id ? 'carte__poi-card--selected' : ''}`}
							onClick={() => handleSelectPoi(poi.id)}
							aria-pressed={selectedId === poi.id}
						>
							<div className="carte__poi-thumb">
								<img src={poi.image} alt={poi.name} />
							</div>
							<div className="carte__poi-info">
								<span
									className="carte__poi-badge"
									style={{ color: COLORS[poi.category] }}
								>
									{LABELS[poi.category]}
								</span>
								<div className="carte__poi-name">
									{poi.name}
								</div>
								<div className="carte__poi-desc">
									{poi.description}
								</div>
							</div>
						</button>
					))}
				</>
			)}

			{visibleSentiers.length > 0 && (
				<>
					<div
						className="carte__sidebar-section-label"
						style={{ marginTop: 8 }}
					>
						{visibleSentiers.length} sentier
						{visibleSentiers.length > 1 ? 's' : ''}
					</div>
					{visibleSentiers.map((s) => (
						<div key={s.id} className="carte__poi-card">
							<div className="carte__poi-thumb">
								<img src={s.image} alt={s.name} />
							</div>
							<div className="carte__poi-info">
								<span
									className="carte__poi-badge"
									style={{ color: '#555' }}
								>
									Sentier
								</span>
								<div className="carte__poi-name">{s.name}</div>
								<div className="carte__poi-meta">
									<span>{s.distance}</span>
									<span>{s.duration}</span>
								</div>
							</div>
						</div>
					))}
				</>
			)}
		</div>
	);

	const mapContent = (
		<MapContainer
			center={CENTER}
			zoom={DEFAULT_ZOOM}
			className="carte__map"
			zoomControl={false}
			scrollWheelZoom={false}
		>
			<TileLayer
				url={TILES.plan.url}
				attribution={TILES.plan.attribution}
				maxZoom={TILES.plan.maxZoom}
			/>
			<FlyTo id={selectedId} markersRef={markerRefs} pois={pois} sentiers={sentiers} />
			<FitCommune geoJSON={communeGeoJSON} skip={!!initialId} />
			<MapResizer trigger={sheetHeight} />
			<MapControls />

			{communeGeoJSON && (
				<GeoJSON
					key="commune"
					data={communeGeoJSON}
					style={{
						color: '#3b5fc0',
						weight: 2.5,
						opacity: 0.9,
						fillColor: '#3b5fc0',
						fillOpacity: 0.06
					}}
				/>
			)}

			<MarkerClusterGroup
				chunkedLoading
				iconCreateFunction={createClusterIcon}
				maxClusterRadius={60}
				showCoverageOnHover={false}
			>
				{visiblePois.map((poi) => (
					<Marker
						key={poi.id}
						position={[poi.lat, poi.lng]}
						icon={createMarkerIcon(
							COLORS[poi.category],
							selectedId === poi.id
						)}
						eventHandlers={{ click: () => handleSelectPoi(poi.id) }}
						ref={(instance) => {
							if (instance)
								markerRefs.current.set(poi.id, instance);
							else markerRefs.current.delete(poi.id);
						}}
					>
						<Popup
							className="carte__popup-wrap"
							maxWidth={280}
							minWidth={280}
						>
							<div className="carte__popup">
								<div className="carte__popup-photo">
									<img
										src={poi.image}
										alt={poi.name}
										className="carte__popup-img"
									/>
									<span
										className="carte__popup-badge"
										style={{
											background: COLORS[poi.category]
										}}
									>
										{LABELS[poi.category]}
									</span>
								</div>
								<div className="carte__popup-body">
									<div className="carte__popup-name">
										{poi.name}
									</div>
									<div className="carte__popup-desc">
										{poi.description}
									</div>
								</div>
							</div>
						</Popup>
					</Marker>
				))}
			</MarkerClusterGroup>

			{visibleSentiers.map((s) => (
				<Polyline
					key={s.id}
					positions={s.coordinates}
					color="#444"
					weight={3}
					opacity={0.85}
					dashArray="8 6"
				>
					<Popup
						className="carte__popup-wrap"
						maxWidth={280}
						minWidth={280}
					>
						<div className="carte__popup">
							<div className="carte__popup-photo">
								<img
									src={s.image}
									alt={s.name}
									className="carte__popup-img"
								/>
								<span
									className="carte__popup-badge"
									style={{ background: '#555' }}
								>
									Sentier
								</span>
							</div>
							<div className="carte__popup-body">
								<div className="carte__popup-name">
									{s.name}
								</div>
								<div className="carte__popup-desc">
									{s.description}
								</div>
								<div className="carte__popup-meta">
									<span className="carte__popup-tag">
										{s.distance}
									</span>
									<span className="carte__popup-tag">
										{s.duration}
									</span>
								</div>
							</div>
						</div>
					</Popup>
				</Polyline>
			))}
		</MapContainer>
	);

	return (
		<div className="carte">
			{/* Sidebar desktop */}
			<aside className="carte__sidebar">
				<div className="carte__sidebar-header">
					<div className="carte__sidebar-eyebrow">
						Saint-Martin
					</div>
					<h1 className="carte__sidebar-title">
						Explorer la commune
					</h1>
				</div>
				{filtersSection}
				{listSection}
			</aside>

			{/* Carte */}
			<div
				className="carte__map-wrap"
				role="region"
				aria-label="Carte interactive de la commune"
			>
				{mapContent}
			</div>

			{/* Sheet mobile (Airbnb-style) */}
			<div
				className="carte__mobile-sheet"
				ref={sheetRef}
				style={
					sheetHeight !== null
						? { height: sheetHeight, maxHeight: 'none' }
						: undefined
				}
			>
				<div
					ref={handleRef}
					className="carte__sheet-handle"
					onPointerDown={onHandlePointerDown}
				/>

				{/* Filtres — collapsés par défaut */}
				<div className="carte__sheet-filters">
					<button
						className="carte__sheet-filters-toggle"
						onClick={() => setFiltersExpanded((o) => !o)}
						aria-expanded={filtersExpanded}
					>
						<SlidersHorizontal size={13} aria-hidden="true" />
						<span>Filtres</span>
						<ChevronDown
							size={13}
							className={`carte__sheet-filters-arrow${filtersExpanded ? ' carte__sheet-filters-arrow--open' : ''}`}
							aria-hidden="true"
						/>
					</button>
					<div
						className={`carte__sheet-filters-panel${filtersExpanded ? ' carte__sheet-filters-panel--open' : ''}`}
					>
						<div className="carte__sheet-filters-panel-inner">
							{filtersSection}
						</div>
					</div>
				</div>

				{listSection}
			</div>
		</div>
	);
}
