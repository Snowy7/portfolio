// Module-level singleton for Pyodide.
// All <PyPlayground/> instances on a page share one interpreter — load once,
// run everywhere. The first instance to call getPyodide() triggers the
// download; subsequent calls await the same promise.
//
// Versions are pinned via the local `pyodide` npm package so the JS shim and
// the CDN-hosted WASM/data files stay in lock-step.

const PYODIDE_VERSION = "0.29.4";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full`;

type ProgressHandler = (stage: string) => void;

let pyodideInstance: any = null;
let pyodideLoading: Promise<any> | null = null;

async function loadPyodideScript(): Promise<any> {
  if ((window as any).loadPyodide) return (window as any).loadPyodide;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${PYODIDE_CDN}/pyodide.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not download Pyodide from CDN"));
    document.head.appendChild(script);
  });
  return (window as any).loadPyodide;
}

export async function getPyodide(progress?: ProgressHandler): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoading) return pyodideLoading;

  pyodideLoading = (async () => {
    try {
      progress?.("Downloading Python runtime (~10MB, one-time)…");
      const loadPyodide = await loadPyodideScript();

      progress?.("Initializing interpreter…");
      const py = await loadPyodide({ indexURL: `${PYODIDE_CDN}/` });

      progress?.("Installing HTTP support (pyodide-http)…");
      await py.loadPackage("micropip");
      const micropip = py.pyimport("micropip");
      await micropip.install("pyodide-http");

      // Patch urllib3 / requests to use the browser's fetch().
      // This is what makes `import requests; requests.get(url)` work in WASM.
      await py.runPythonAsync(`
import pyodide_http
pyodide_http.patch_all()
      `);

      pyodideInstance = py;
      return py;
    } catch (e) {
      // Allow retry on next call if loading failed mid-way
      pyodideLoading = null;
      throw e;
    }
  })();

  return pyodideLoading;
}

export function isPyodideReady(): boolean {
  return !!pyodideInstance;
}
