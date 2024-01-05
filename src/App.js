import React, {useState, useEffect} from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Logo from "./logo.svg";
import {Radar} from "@nivo/radar";
import {Dialog, DialogTitle, DialogContent, DialogActions, Button} from "@mui/material";
import "./App.css";

mapboxgl.accessToken = "pk.eyJ1IjoiamFja3JvYiIsImEiOiJjanZ1bDBrdjUxYmgyNGJtczlxdWl3MzRuIn0.qla3sSgkkyxIkbYLvVsceA";

const cleanNumber = (str) => {
    if (str.includes("days")) {
        return parseFloat(str);
    }
    return Number(str.replace(/[^0-9.-]+/g, ""));
};

const euRouteData = {
    totalMiles: cleanNumber("3,458"),
    cost: cleanNumber("$367,402"),
    emissions: cleanNumber("2,571,815"),
    duration: cleanNumber("9.6"),
    riskLevel: cleanNumber("17,000"),
};

const saRouteData = {
    totalMiles: cleanNumber("10,795"),
    cost: cleanNumber("$1,146,920"),
    emissions: cleanNumber("8,028,442"),
    duration: cleanNumber("30"),
    riskLevel: cleanNumber("22,000"),
};

const euRouteDataDisplay = {
    totalMiles: "3,458 miles",
    cost: "$367,402",
    emissions: "2,571,815 kg",
    duration: "9.6 days",
    riskLevel: "17,000",
};

const saRouteDataDisplay = {
    totalMiles: "10,795 miles",
    cost: "$1,146,920",
    emissions: "8,028,442 kg",
    duration: "30 days",
    riskLevel: "22,000",
};

const reversedPurpleBlue = [
    "#3DA9DE",
    "#2881B4",
    "#6BBDEE",
    "#5BAFD7",
    "#A2D9F2",
    "#DE5D3D",
    "#3DA9DE",
    "#2881B4",
    "#6BBDEE",
].reverse();

const MapComponent = () => {
    const [ open, setOpen ] = useState(false);
    const [ selectedRoute, setSelectedRoute ] = useState(null);
    const [ screenWidth, setScreenWidth ] = useState(window.innerWidth);

    const radarData = [
        {category: "Total Miles", categoryName: "totalMiles", EU: euRouteData.totalMiles, SA: saRouteData.totalMiles},
        {category: "Cost", categoryName: "cost", EU: euRouteData.cost, SA: saRouteData.cost},
        {category: "Emissions", categoryName: "emissions", EU: euRouteData.emissions, SA: saRouteData.emissions},
        {category: "Risk Level", categoryName: "riskLevel", EU: euRouteData.riskLevel, SA: saRouteData.riskLevel},
        {category: "Duration", categoryName: "duration", EU: euRouteData.duration, SA: saRouteData.duration},
    ];

    const renderRouteData = () => {
        if (selectedRoute === "EU") {
            return (
                <div>
                    <p>
                        <b>Total Miles:</b> {euRouteDataDisplay.totalMiles}
                    </p>
                    <p>
                        <b>Cost:</b> {euRouteDataDisplay.cost}
                    </p>
                    <p>
                        <b>Emissions:</b> {euRouteDataDisplay.emissions}
                    </p>
                    <p>
                        <b>Duration:</b>
                        {euRouteDataDisplay.duration}
                    </p>
                    <p>
                        <b>Risk Level: </b>
                        {euRouteDataDisplay.riskLevel}
                    </p>
                </div>
            );
        }
        else if (selectedRoute === "SA") {
            return (
                <div>
                    <p>
                        <b>Total Miles:</b> {saRouteDataDisplay.totalMiles}
                    </p>
                    <p>
                        <b>Cost:</b> {saRouteDataDisplay.cost}
                    </p>
                    <p>
                        <b>Emissions:</b> {saRouteDataDisplay.emissions}
                    </p>
                    <p>
                        <b>Duration:</b> {saRouteDataDisplay.duration}
                    </p>
                    <p>
                        <b>Risk Level:</b> {saRouteDataDisplay.riskLevel}
                    </p>
                </div>
            );
        }
        else {
            return <p>Data not available for the selected route.</p>;
        }
    };

    const renderRouteDescription = () => {
        if (selectedRoute === "SA") {
            return "Shipping route around the Cape of Good Hope";
        }
        else if (selectedRoute === "EU") {
            return "Shipping route through the Suez Canal";
        }
        else {
            return "Select a shipping route to view data";
        }
    };

    const maxEmissions = Math.max(euRouteData.emissions, saRouteData.emissions);

    const MAX_SCALING_FACTORS_EU = {
        totalMiles: 40,
        cost: 1,
        riskLevel: 20,
        duration: 10000,
        emissions: 0.2,
    };

    const MAX_SCALING_FACTORS_SA = {
        totalMiles: 500,
        cost: 6,
        riskLevel: 60,
        duration: 120000,
        emissions: 1,
    };

    const getScalingFactor = (value, maxFactor) => {
        const factor = maxEmissions / value;
        return factor > maxFactor ? maxFactor : factor;
    };

    const scalingFactorsEU = {
        totalMiles: getScalingFactor(euRouteData.totalMiles, MAX_SCALING_FACTORS_EU.totalMiles),
        cost: getScalingFactor(euRouteData.cost, MAX_SCALING_FACTORS_EU.cost),
        riskLevel: getScalingFactor(euRouteData.riskLevel, MAX_SCALING_FACTORS_EU.riskLevel),
        duration: getScalingFactor(euRouteData.duration, MAX_SCALING_FACTORS_EU.duration),
        emissions: MAX_SCALING_FACTORS_EU.emissions,
    };

    const scalingFactorsSA = {
        totalMiles: getScalingFactor(saRouteData.totalMiles, MAX_SCALING_FACTORS_SA.totalMiles),
        cost: getScalingFactor(saRouteData.cost, MAX_SCALING_FACTORS_SA.cost),
        riskLevel: getScalingFactor(saRouteData.riskLevel, MAX_SCALING_FACTORS_SA.riskLevel),
        duration: getScalingFactor(saRouteData.duration, MAX_SCALING_FACTORS_SA.duration),
        emissions: MAX_SCALING_FACTORS_SA.emissions,
    };

    const scaledRadarData = radarData.map((item) => ({
        category: item.category,
        EU: item.EU * scalingFactorsEU[item.categoryName],
        SA: item.SA * scalingFactorsSA[item.categoryName],
    }));

    const handleClick = (route) => {
        setSelectedRoute(route);
        setOpen(true);
    };
    //new scaling factors /////////////////////////////////

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/jackrob/clqxp8i74011y01o954fv7vi4",
            center: [ 56.296249, 25.276987 ],
            zoom: 7,
            projection: "globe",
        });

        map.on("load", function () {
            // EU Route Layer
            map.addSource("china-eu-route-eu", {
                type: "geojson",
                data: "/data/china-eu-route-layer-eu.json",
            });
            map.addLayer({
                id: "china-eu-route-layer-eu",
                type: "line",
                source: "china-eu-route-eu",
                layout: {"line-join": "round", "line-cap": "round"},
                paint: {"line-color": "#2881B4", "line-width": 2},
            });

            // Add an invisible, wider layer for EU route for improved click/tap area
            map.addLayer({
                id: "china-eu-route-layer-eu-buffer",
                type: "line",
                source: "china-eu-route-eu",
                layout: {
                    "line-cap": "round",
                    "line-join": "round",
                },
                paint: {
                    "line-color": "#ff0000",
                    "line-width": 10,
                    "line-opacity": 0,
                },
            });

            // SA Route Layer
            map.addSource("china-eu-route-sa", {
                type: "geojson",
                data: "/data/china-eu-route-layer-sa.json",
            });
            map.addLayer({
                id: "china-eu-route-layer-sa",
                type: "line",
                source: "china-eu-route-sa",
                layout: {"line-join": "round", "line-cap": "round"},
                paint: {"line-color": "#5BAFD7", "line-width": 2},
            });

            // Add an invisible, wider layer for SA route for improved click/tap area
            map.addLayer({
                id: "china-eu-route-layer-sa-buffer",
                type: "line",
                source: "china-eu-route-sa",
                layout: {
                    "line-cap": "round",
                    "line-join": "round",
                },
                paint: {
                    "line-color": "#0000ff",
                    "line-width": 10,
                    "line-opacity": 0,
                },
            });

            // Add event listeners for the original and buffer layers
            // EU Route
            map.on("click", "china-eu-route-layer-eu", () => handleClick("EU"));
            map.on("click", "china-eu-route-layer-eu-buffer", () => handleClick("EU"));
            map.on("touchstart", "china-eu-route-layer-eu", () => handleClick("EU"));
            map.on("touchstart", "china-eu-route-layer-eu-buffer", () => handleClick("EU"));

            // SA Route
            map.on("click", "china-eu-route-layer-sa", () => handleClick("SA"));
            map.on("click", "china-eu-route-layer-sa-buffer", () => handleClick("SA"));
            map.on("touchstart", "china-eu-route-layer-sa", () => handleClick("SA"));
            map.on("touchstart", "china-eu-route-layer-sa-buffer", () => handleClick("SA"));
        });

        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Cleanup function
        return () => map.remove();
    }, []);

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const dialogContentStyles =
        screenWidth > 768
            ? {display: "flex", flexDirection: "column", overflow: "auto", height: "auto", width: "30vw"} // Desktop styles
            : {display: "flex", flexDirection: "column", overflow: "auto", height: "auto", width: "70vw"}; // Mobile styles

    const radarSize = screenWidth > 768 ? 400 : 200; // Example: 500px for desktop, 200px for mobile

    const handleClose = () => {
        setOpen(false);
    };

    console.log("radarData", radarData);
    console.log("scaledRadarData", scaledRadarData);

    return (
        <div style={{display: "flex", flexDirection: "column", height: "100vh", margin: "2em"}}>
            <div id="TopText">
                <h1 style={{}}>
                    The Emissions of Emissions <img src={Logo} alt="Logo" style={{width: ".8em", marginLeft: ".001"}} />
                </h1>
                <p className="responsive-paragraph">
                    You are a supertanker departing Dubai, carrying 320,000 m³ of oil. Explore the shipping route and
                    click on it to learn how Houthi piracy has impacted shipping diversions, and understand their
                    environmental and economic repercussions.
                </p>
            </div>
            <div id="map" style={{flex: 1}} />

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    <b>{renderRouteDescription()}</b>
                </DialogTitle>
                <DialogContent style={dialogContentStyles}>
                    <div
                        style={{
                            height: "auto",
                            width: "auto",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            overflow: "hidden",
                        }}
                    >
                        <Radar
                            data={scaledRadarData}
                            keys={[ selectedRoute ]}
                            indexBy="category"
                            maxValue="auto"
                            curve="linearClosed"
                            margin={{top: 40, right: 40, bottom: 40, left: 40}}
                            borderWidth={2}
                            colors={reversedPurpleBlue}
                            borderColor={{from: "color"}}
                            width={radarSize}
                            height={radarSize}
                            enableHover={false} // Disable hover interaction
                            isInteractive={false} // Disable all interactivity
                        />
                    </div>
                    {renderRouteData()} {/* Render the data based on the selected route */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default MapComponent;
