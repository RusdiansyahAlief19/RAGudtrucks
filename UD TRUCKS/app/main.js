// ===== Main App =====
function App() {
  const [screen, setScreen] = React.useState("dashboard");
  const [truckId, setTruckId] = React.useState("kt9012");
  const [contentKey, setContentKey] = React.useState(0);

  const nav = (s) => { setScreen(s); setContentKey((k) => k + 1); };
  const selectTruck = (id) => setTruckId(id);

  const content = () => {
    switch (screen) {
      case "dashboard": return <Dashboard onNav={nav} onSelectTruck={selectTruck} />;
      case "predictive": return <Predictive selectedId={truckId} onSelectTruck={selectTruck} />;
      case "drivers": return <Drivers onNav={nav} onSelectTruck={selectTruck} />;
      case "fuelmap": return <FuelMap />;
      case "mechanic": return <Mechanic />;
      default: return null;
    }
  };

  // screens that need full-height (no scroll), vs scrolling content
  const fullHeight = screen === "predictive" || screen === "mechanic" || screen === "fuelmap";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar active={screen} onNav={nav} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar screen={screen} onNav={nav} />
        <main style={{ flex: 1, overflow: fullHeight ? "hidden" : "auto", padding: 28, minHeight: 0 }}>
          <div key={contentKey} style={{ height: fullHeight ? "100%" : "auto" }}>
            {content()}
          </div>
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
