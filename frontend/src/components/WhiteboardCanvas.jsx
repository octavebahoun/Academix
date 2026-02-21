import React, { useEffect, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  Mic,
  MicOff,
  Type,
  Pen,
  Eraser,
  Trash2,
  Undo,
  Code,
  Play,
  X,
  Layout,
  Terminal,
  Settings,
  Loader2,
  Columns,
  PanelLeft,
  PanelRight,
} from "lucide-react";

// --- Constantes & Configuration ---
const DEFAULT_COLOR = "#111827";
const DEFAULT_SIZE = 3;
const DEFAULT_FONT_SIZE = 24;

// --- Configuration des Langages (Judge0 IDs) ---
const LANGUAGE_CONFIG = {
  web: {
    name: "Web (HTML/JS)",
    type: "browser",
    defaultCode: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f0f9ff; }
    h1 { color: #0284c7; }
  </style>
</head>
<body>
  <h1>Sandbox Web 🚀</h1>
  <p>HTML/CSS/JS s'exécutent ici directement.</p>
  <script>
    console.log("Hello from JS!");
  </script>
</body>
</html>`,
  },
  python: {
    name: "Python (3.8.1)",
    type: "server",
    id: 71,
    defaultCode: `print("Hello from Python!")

def greet(name):
    return f"Bienvenue, {name}!"

print(greet("Utilisateur"))`,
  },
  c: {
    name: "C (GCC 9.2)",
    type: "server",
    id: 50,
    defaultCode: `#include <stdio.h>

int main() {
    printf("Hello from C language!\\n");
    return 0;
}`,
  },
  cpp: {
    name: "C++ (GCC 9.2)",
    type: "server",
    id: 54,
    defaultCode: `#include <iostream>

int main() {
    std::cout << "Hello from C++!" << std::endl;
    return 0;
}`,
  },
};

// J'ai penser qu'ajouter la Reconnaissance Vocale  etait ouf nn ---
const useSpeechRecognition = (onFinalTranscript) => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef(null);
  const onFinalTranscriptRef = useRef(onFinalTranscript);

  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "fr-FR";

    recognition.onresult = (event) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalChunk += event.results[i][0].transcript;
        } else {
          interimChunk += event.results[i][0].transcript;
        }
      }
      if (finalChunk && onFinalTranscriptRef.current) {
        onFinalTranscriptRef.current(finalChunk);
      }
      setInterimTranscript(interimChunk);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setInterimTranscript("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    hasSupport: !!(
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    ),
  };
};

// --- Composant : Overlay Éditeur de Code Multi-Langage plus monaco ca serai ouf nn---
const CodeEditorOverlay = ({ code, setCode, onClose }) => {
  const [language, setLanguage] = useState("web");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [srcDoc, setSrcDoc] = useState(code);
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("rapidapi_key") || "",
  );
  const [showSettings, setShowSettings] = useState(false);

  // État de la disposition : 'split' (50/50), 'editor' (100% code), 'preview' (100% output)
  const [layout, setLayout] = useState("split");

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(LANGUAGE_CONFIG[newLang].defaultCode);
    setOutput("");
  };

  useEffect(() => {
    if (LANGUAGE_CONFIG[language].type === "browser") {
      const timeout = setTimeout(() => {
        setSrcDoc(code);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [code, language]);

  const handleChange = (value) => {
    setCode(value);
  };

  const runCode = async () => {
    if (LANGUAGE_CONFIG[language].type === "browser") return;

    // Si on lance le code et qu'on est en mode "éditeur seul", on bascule vers la preview pour voir le résultat
    if (layout === "editor") setLayout("preview");

    //La je me demande si je vais pas mettre la clé en dur mais c'est pas pro du tout mais je vais voir que faire moi
    if (!apiKey) {
      setOutput(
        "⚠️ Erreur : Veuillez entrer une clé API RapidAPI (Judge0) dans les paramètres (⚙️) pour exécuter du Python/C/C++.",
      );
      return;
    }

    setIsLoading(true);
    setOutput("Exécution en cours...");

    try {
      const response = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Content-Type": "application/json",
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
          body: JSON.stringify({
            source_code: code,
            language_id: LANGUAGE_CONFIG[language].id,
            stdin: "",
          }),
        },
      );

      const data = await response.json();

      if (data.stdout) {
        setOutput(data.stdout);
      } else if (data.stderr) {
        setOutput(`Erreur :\n${data.stderr}`);
      } else if (data.compile_output) {
        setOutput(`Erreur de compilation :\n${data.compile_output}`);
      } else if (data.message) {
        setOutput(`Erreur API : ${data.message}`);
      } else {
        setOutput("Programme exécuté avec succès (aucune sortie).");
      }
    } catch (error) {
      setOutput(`Erreur réseau : ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveKey = (e) => {
    setApiKey(e.target.value);
    localStorage.setItem("rapidapi_key", e.target.value);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-1.5 bg-indigo-500/20 rounded-md">
            <Code className="text-indigo-400" size={18} />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs font-medium px-3 py-1.5 rounded border border-slate-700 outline-none focus:border-indigo-500"
            >
              {Object.keys(LANGUAGE_CONFIG).map((key) => (
                <option key={key} value={key}>
                  {LANGUAGE_CONFIG[key].name}
                </option>
              ))}
            </select>

            {LANGUAGE_CONFIG[language].type === "server" && (
              <button
                onClick={runCode}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Play size={12} />
                )}
                RUN
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Contrôles de Disposition (Layout) */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setLayout("editor")}
              className={`p-1.5 rounded ${layout === "editor" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700"}`}
              title="Éditeur seul"
            >
              <PanelLeft size={14} />
            </button>
            <button
              onClick={() => setLayout("split")}
              className={`p-1.5 rounded ${layout === "split" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700"}`}
              title="Vue partagée"
            >
              <Columns size={14} />
            </button>
            <button
              onClick={() => setLayout("preview")}
              className={`p-1.5 rounded ${layout === "preview" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700"}`}
              title="Résultat seul"
            >
              <PanelRight size={14} />
            </button>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${showSettings ? "text-indigo-400" : "text-slate-500"}`}
            title="Configuration API"
          >
            <Settings size={16} />
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={14} />
            Fermer
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Clé RapidAPI (Judge0) :
          </span>
          <input
            type="password"
            value={apiKey}
            onChange={saveKey}
            placeholder="Entrez votre clé RapidAPI ici..."
            className="flex-1 bg-slate-950 text-slate-200 text-xs p-2 rounded border border-slate-800 outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {/* Zone Principale avec Split View Dynamique */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Panneau Éditeur (Gauche) */}
        <div
          className={`flex min-h-0 flex-col border-r border-slate-800 transition-all duration-300 ease-in-out
            ${layout === "preview" ? "w-0 opacity-0 border-none" : layout === "editor" ? "w-full" : "w-1/2"}
          `}
        >
          <div className="bg-slate-900 px-4 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-800 whitespace-nowrap overflow-hidden">
            {LANGUAGE_CONFIG[language].name}
          </div>
          <div className="flex-1 w-full min-h-0 bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={language === "web" ? "html" : language}
              value={code}
              theme="vs-dark"
              onChange={handleChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        {/* Panneau Sortie / Preview (Droite) */}
        <div
          className={`flex min-h-0 flex-col bg-[#1e1e1e] transition-all duration-300 ease-in-out
            ${layout === "editor" ? "w-0 opacity-0" : layout === "preview" ? "w-full" : "w-1/2"}
          `}
        >
          <div className="bg-slate-800 px-4 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-700 flex justify-between whitespace-nowrap overflow-hidden">
            <span>
              {LANGUAGE_CONFIG[language].type === "browser"
                ? "Live Preview"
                : "Console Output"}
            </span>
            {LANGUAGE_CONFIG[language].type === "browser" ? (
              <Layout size={12} />
            ) : (
              <Terminal size={12} />
            )}
          </div>

          <div className="flex-1 overflow-hidden relative min-w-0 min-h-0">
            {LANGUAGE_CONFIG[language].type === "browser" ? (
              <iframe
                srcDoc={srcDoc}
                title="preview"
                sandbox="allow-scripts"
                className="w-full h-full border-none bg-white"
              />
            ) : (
              <pre className="w-full h-full p-4 font-mono text-sm text-green-400 overflow-auto overscroll-contain whitespace-pre-wrap">
                {output || (
                  <span className="text-slate-600 italic">
                    // En attente d'exécution...
                  </span>
                )}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helpers Canvas (Inchangés) ---
const setupCanvas = (canvas) => {
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  if (
    canvas.width !== Math.floor(rect.width * dpr) ||
    canvas.height !== Math.floor(rect.height * dpr)
  ) {
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return ctx;
  }
  return canvas.getContext("2d");
};

const drawStroke = (ctx, stroke) => {
  if (!stroke?.points?.length) return;
  ctx.strokeStyle = stroke.color || DEFAULT_COLOR;
  ctx.lineWidth = stroke.size || DEFAULT_SIZE;
  ctx.globalCompositeOperation =
    stroke.tool === "eraser" ? "destination-out" : "source-over";
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length - 1; i++) {
    const p1 = stroke.points[i];
    const p2 = stroke.points[i + 1];
    const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
  }
  if (stroke.points.length > 1) {
    const last = stroke.points[stroke.points.length - 1];
    ctx.lineTo(last.x, last.y);
  }
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
};

// --- Composant Principal ---
const WhiteboardCanvas = ({
  title = "Tableau partagé",
  metaLine = "",
  onClose,
  operations = [],
  onOperation,
  disabled = false,
  sessionId = null,
}) => {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef(null);

  // --- États ---
  const [tool, setTool] = useState("draw");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [globalText, setGlobalText] = useState("");

  // État du code
  const [codeContent, setCodeContent] = useState(
    LANGUAGE_CONFIG.web.defaultCode,
  );

  // --- Synchronisation Code via Socket ---
  // Écouter les mises à jour distantes
  // Référence pour éviter les boucles infinies et les sauts de curseur
  const lastUpdateRef = useRef("");

  // Référence pour accéder à codeContent dans le callback sans redéclencher l'useEffect du socket
  const codeContentRef = useRef(codeContent);
  useEffect(() => {
    codeContentRef.current = codeContent;
  }, [codeContent]);

  // Écouter les mises à jour distantes du code
  useEffect(() => {
    if (!sessionId) return;

    const handleCodeUpdate = (data) => {
      // Ignorer si c'est identique à ce qu'on a déjà (local ou reçu précédemment)
      if (data.code === codeContentRef.current) return;

      console.log(`[Socket] Received remote code update (diff)`);
      setCodeContent(data.code);
      lastUpdateRef.current = data.code;
    };

    let socketModule;
    import("../services/sessionSocket").then((module) => {
      socketModule = module.default;
      socketModule.onCodeUpdate(handleCodeUpdate);
    });

    return () => {
      // Nettoyage si possible
    };
  }, [sessionId]);

  // Émettre les changements locaux (Debounced)
  useEffect(() => {
    if (!sessionId) return;

    // Si le code actuel est le même que le dernier reçu/émis, on n'envoie rien
    if (codeContent === lastUpdateRef.current) return;

    const timeoutId = setTimeout(() => {
      console.log(`[Socket] Emitting code update`);
      lastUpdateRef.current = codeContent;
      import("../services/sessionSocket").then((module) => {
        module.default.codeUpdate(sessionId, codeContent, "web");
      });
    }, 800); // Augmentation légère du debounce pour limiter le trafic vocal

    return () => clearTimeout(timeoutId);
  }, [codeContent, sessionId]);
  // Synchronisation du Texte Global (Écrit ou Dicté)
  const lastTextUpdateRef = useRef("");
  const globalTextRef = useRef(globalText);

  useEffect(() => {
    globalTextRef.current = globalText;
  }, [globalText]);

  useEffect(() => {
    if (!sessionId) return;

    const handleTextUpdate = (data) => {
      if (data.text === globalTextRef.current) return;
      console.log(`[Socket] Received text update`);
      setGlobalText(data.text);
      lastTextUpdateRef.current = data.text;
    };

    import("../services/sessionSocket").then((module) => {
      module.default.onTextUpdate(handleTextUpdate);
    });
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    if (globalText === lastTextUpdateRef.current) return;

    const timeoutId = setTimeout(() => {
      console.log(`[Socket] Emitting text update`);
      lastTextUpdateRef.current = globalText;
      import("../services/sessionSocket").then((module) => {
        module.default.textUpdate(sessionId, globalText);
      });
    }, 1000); // 1s debounce pour le texte

    return () => clearTimeout(timeoutId);
  }, [globalText, sessionId]);

  // Callback Audio
  const handleFinalTranscript = useCallback((newText) => {
    setGlobalText((prev) => {
      const prefix = prev && prev.trim().length > 0 ? " " : "";
      return prev + prefix + newText;
    });
  }, []);

  const {
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    hasSupport,
  } = useSpeechRecognition(handleFinalTranscript);

  const displayText =
    globalText +
    (interimTranscript ? (globalText ? " " : "") + interimTranscript : "");

  // --- Rendu Canvas ---
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas);
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    operations.forEach((op) => {
      if (op.action === "draw") drawStroke(ctx, op.data);
    });

    if (drawingRef.current && currentStrokeRef.current) {
      drawStroke(ctx, currentStrokeRef.current);
    }
  }, [operations]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    const handleResize = () => requestAnimationFrame(renderCanvas);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderCanvas]);

  // --- Actions ---
  const addOperation = (op) => {
    if (!op?.action) return;
    onOperation?.(op);
  };

  const clearBoard = () => {
    if (confirm("Tout effacer (dessins et texte) ? Le code sera conservé.")) {
      setGlobalText("");
      onOperation?.({ action: "clear" });
    }
  };

  const undoLast = () => {
    onOperation?.({ action: "undo" });
  };

  // --- Events Pointer ---
  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e) => {
    if (disabled) return;
    if (tool === "code") return;

    const point = getPoint(e);
    if (tool === "text") return;

    drawingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    currentStrokeRef.current = {
      points: [point],
      color: tool === "eraser" ? "#ffffff" : color,
      size: tool === "eraser" ? size * 5 : size,
      tool: tool,
    };
    renderCanvas();
  };

  const handlePointerMove = (e) => {
    if (disabled) return;
    if (!drawingRef.current) return;
    currentStrokeRef.current.points.push(getPoint(e));
    renderCanvas();
  };

  const handlePointerUp = (e) => {
    if (disabled) return;
    if (!drawingRef.current) return;
    drawingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (currentStrokeRef.current?.points?.length > 0) {
      const strokeData = currentStrokeRef.current;
      addOperation({ action: "draw", data: strokeData });
    }
    currentStrokeRef.current = null;
  };

  const toolbarJSX = (
    <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setTool("draw")}
          className={`p-2 rounded-lg transition-all ${tool === "draw" ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100"}`}
          title="Crayon"
          disabled={disabled}
        >
          <Pen size={18} />
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`p-2 rounded-lg transition-all ${tool === "eraser" ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100"}`}
          title="Gomme"
          disabled={disabled}
        >
          <Eraser size={18} />
        </button>
        <button
          onClick={() => setTool("text")}
          className={`p-2 rounded-lg transition-all ${tool === "text" ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100"}`}
          title="Texte"
          disabled={disabled}
        >
          <Type size={18} />
        </button>
        <button
          onClick={() => setTool("code")}
          className={`p-2 rounded-lg transition-all ${tool === "code" ? "bg-indigo-600 text-white shadow-md" : "bg-indigo-50 hover:bg-indigo-100 text-indigo-600"}`}
          title="Ouvrir l'éditeur (Web, Python, C++)"
          disabled={disabled}
        >
          <Code size={18} />
        </button>
        <div className="w-px h-6 bg-slate-200 mx-2" />
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={!hasSupport}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            isListening
              ? "bg-red-500 text-white shadow-md animate-pulse"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {isListening ? <MicOff size={14} /> : <Mic size={14} />}
          {isListening ? "Stop" : "Dictée"}
        </button>
      </div>
      <div
        className={`flex items-center gap-3 transition-opacity ${tool === "code" ? "opacity-30 pointer-events-none" : "opacity-100"}`}
      >
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          disabled={disabled || tool === "eraser"}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
        />
        <div className="flex flex-col w-24">
          <label className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
            {tool === "text" ? "Taille police" : "Épaisseur"}
          </label>
          <input
            type="range"
            min={tool === "text" ? 12 : 1}
            max={tool === "text" ? 72 : 20}
            value={tool === "text" ? fontSize : size}
            onChange={(e) =>
              tool === "text"
                ? setFontSize(Number(e.target.value))
                : setSize(Number(e.target.value))
            }
            disabled={disabled}
            className="accent-blue-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={undoLast}
          disabled={disabled}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40"
        >
          <Undo size={18} />
        </button>
        <button
          onClick={clearBoard}
          disabled={disabled}
          className="p-2 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-40"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full min-h-0 flex-col font-sans text-slate-700">
      <div className="flex shrink-0 items-center gap-4 rounded-t-3xl border-b border-indigo-100 bg-indigo-50/60 px-6 py-3">
        <div className="shrink-0">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">
            {title}
          </p>
          {metaLine ? (
            <p className="text-[11px] text-indigo-300">{metaLine}</p>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">{toolbarJSX}</div>
        {onClose ? (
          <button
            onClick={onClose}
            className="shrink-0 rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
          >
            Fermer
          </button>
        ) : null}
      </div>

      {/* Zone Principale */}
      <div className="min-h-0 flex-1 relative bg-white overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="absolute inset-0 w-full h-full block z-0"
        />

        <textarea
          value={displayText}
          onChange={(e) => setGlobalText(e.target.value)}
          placeholder={
            tool === "text" ? "Commencez à taper ou utilisez le micro..." : ""
          }
          disabled={tool !== "text" && !isListening}
          className={`absolute inset-0 w-full h-full bg-transparent p-8 resize-none outline-none border-none font-sans z-10 transition-colors
            ${tool === "text" ? "pointer-events-auto cursor-text" : "pointer-events-none cursor-crosshair select-none"}
          `}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.5,
            color: color,
            fontFamily: '"Inter", sans-serif',
          }}
          spellCheck={false}
        />

        {/* Layer 2: Overlay Code Multi-Langage */}
        {tool === "code" && (
          <CodeEditorOverlay
            code={codeContent}
            setCode={setCodeContent}
            onClose={() => setTool("draw")}
          />
        )}
      </div>
    </div>
  );
};

export default WhiteboardCanvas;

// heure de debut 10h et heure de fin dui code 16h