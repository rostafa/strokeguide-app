function isMinorStroke(nihss, presentationType) {
  if (presentationType === "tia") return true;
  return Number.isFinite(nihss) && nihss <= 5;
}

function showRelevantSections() {
  const etiology = document.getElementById("etiology").value;

  document.getElementById("cardioembolicSection").classList.toggle(
    "hidden",
    etiology !== "cardioembolic"
  );

  document.getElementById("largeArterySection").classList.toggle(
    "hidden",
    etiology !== "large-artery"
  );

  document.getElementById("pfoSection").classList.toggle(
    "hidden",
    etiology !== "pfo"
  );
}

function buildCardioembolicRecommendation(cardioSource, infarctSize) {
  const notes = [];
  let primary = "";
  let transition = "";

  if (cardioSource === "mechanical-valve") {
    primary = "Primary antithrombotic: Warfarin long-term.";
    transition = "Transition: Continue long-term warfarin-based therapy.";
    notes.push("Use warfarin (NOT DOAC) for mechanical valve or rheumatic MS.");
  } else {
    primary =
      "Primary antithrombotic: Oral anticoagulation long-term (prefer DOAC unless contraindicated).";
    transition = "Transition: Continue long-term anticoagulation.";
  }

  if (infarctSize === "small") {
    notes.push("Earlier anticoagulation initiation is reasonable in small strokes.");
  } else if (infarctSize === "moderate") {
    notes.push("Balance timing based on infarct size and bleeding risk.");
  } else {
    notes.push("Delay anticoagulation in large infarcts due to hemorrhage risk.");
  }

  notes.push("Cardioembolic mechanism overrides DAPT.");

  return { primary, transition, notes };
}

function buildLargeArteryRecommendation(isMinor, earlyWindow, subtype, carotidStenosis, icadSeverity) {
  const notes = [];
  let primary = "";
  let transition = "";

  if (subtype === "icad" && icadSeverity === "70-99") {
    primary =
      "Primary: DAPT (aspirin + clopidogrel) for 90 days.";
    transition =
      "Then: Single antiplatelet therapy long-term.";
    notes.push("Severe ICAD (SAMMPRIS pathway).");
    return { primary, transition, notes };
  }

  if (isMinor && earlyWindow) {
    primary =
      "Primary: DAPT (aspirin + clopidogrel) for 21 days.";
    transition =
      "Then: Single antiplatelet therapy long-term.";
    notes.push("CHANCE/POINT pathway (minor noncardioembolic stroke or high-risk TIA).");
  } else {
    primary =
      "Primary: Single antiplatelet therapy.";
    transition =
      "Continue long-term.";
    notes.push("Not eligible for short-term DAPT.");
  }

  if (subtype === "extracranial" && (carotidStenosis === "50-69" || carotidStenosis === "ge70")) {
    notes.push("Evaluate for carotid revascularization.");
  }

  return { primary, transition, notes };
}

function buildSmallVesselRecommendation(isMinor, earlyWindow) {
  const notes = ["Blood pressure control is critical."];

  if (isMinor && earlyWindow) {
    return {
      primary: "Primary: DAPT for 21 days.",
      transition: "Then: Single antiplatelet therapy.",
      notes
    };
  }

  return {
    primary: "Primary: Single antiplatelet therapy.",
    transition: "Continue long-term.",
    notes
  };
}

function buildDissectionRecommendation() {
  return {
    primary: "Primary: Antiplatelet OR anticoagulation for ~3 months.",
    transition: "Reassess after treatment period.",
    notes: ["CADISS trial: either strategy reasonable."]
  };
}

function buildPfoRecommendation(pfoClosureCandidate) {
  const notes = [];

  if (pfoClosureCandidate === "yes") {
    notes.push("Consider PFO closure.");
  }

  return {
    primary: "Primary: Single antiplatelet therapy.",
    transition: "Continue long-term.",
    notes
  };
}

function buildAPSRecommendation() {
  return {
    primary: "Primary: Warfarin long-term.",
    transition: "Avoid DOACs.",
    notes: ["APS → warfarin preferred."]
  };
}

function buildCryptogenicRecommendation() {
  return {
    primary: "Primary: Single antiplatelet therapy.",
    transition: "Continue long-term.",
    notes: [
      "DOAC not recommended for ESUS.",
      "Consider prolonged cardiac monitoring."
    ]
  };
}

function generateRecommendation() {
  const presentationType = document.getElementById("presentationType").value;
  const etiology = document.getElementById("etiology").value;
  const nihss = Number(document.getElementById("nihss").value);
  const earlyWindow = document.getElementById("earlyWindow").value === "yes";

  const cardioSource = document.getElementById("cardioSource").value;
  const infarctSize = document.getElementById("infarctSize").value;
  const subtype = document.getElementById("largeArterySubtype").value;
  const carotidStenosis = document.getElementById("carotidStenosis").value;
  const icadSeverity = document.getElementById("icadSeverity").value;
  const pfoClosureCandidate = document.getElementById("pfoClosureCandidate").value;

  const resultEl = document.getElementById("result");

  if (!etiology) {
    resultEl.innerText = "Select etiology.";
    return;
  }

  const minor = isMinorStroke(nihss, presentationType);
  let rec;

  switch (etiology) {
    case "cardioembolic":
      rec = buildCardioembolicRecommendation(cardioSource, infarctSize);
      break;
    case "large-artery":
      rec = buildLargeArteryRecommendation(minor, earlyWindow, subtype, carotidStenosis, icadSeverity);
      break;
    case "small-vessel":
      rec = buildSmallVesselRecommendation(minor, earlyWindow);
      break;
    case "dissection":
      rec = buildDissectionRecommendation();
      break;
    case "pfo":
      rec = buildPfoRecommendation(pfoClosureCandidate);
      break;
    case "aps":
      rec = buildAPSRecommendation();
      break;
    case "cryptogenic":
      rec = buildCryptogenicRecommendation();
      break;
    default:
      resultEl.innerText = "Error.";
      return;
  }

  const output = `
Secondary Prevention Recommendation

${rec.primary}
${rec.transition}

Notes:
- ${rec.notes.join("\n- ")}
`;

  resultEl.innerText = output;
}

document.getElementById("etiology").addEventListener("change", showRelevantSections);
document.getElementById("generateBtn").addEventListener("click", generateRecommendation);
showRelevantSections();
