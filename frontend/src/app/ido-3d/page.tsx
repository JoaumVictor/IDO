"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const FACE_ASSETS: Record<Layer, string[]> = {
  base:      ["/assets/face/base_01.png"],
  eyebrows:  ["/assets/face/eyebrows_01.png", "/assets/face/eyebrows_02.png"],
  eyes:      ["/assets/face/eyes_01.png",     "/assets/face/eyes_02.png", "/assets/face/eyes_03.png"],
  cheeks:    ["/assets/face/cheeks_01.png",   "/assets/face/cheeks_02.png"],
  mouth:     ["/assets/face/mouth_01.png",    "/assets/face/mouth_02.png", "/assets/face/mouth_03.png"],
};

const LAYER_ORDER = ["base", "eyebrows", "eyes", "cheeks", "mouth"] as const;
type Layer = (typeof LAYER_ORDER)[number];

const LAYER_LABELS: Record<Layer, string> = {
  base: "Base",
  eyebrows: "Sobrancelhas",
  eyes: "Olhos",
  cheeks: "Bochechas",
  mouth: "Boca",
};

const FACE_CANVAS_SIZE = 512;

export default function Ido3DPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const [selection, setSelection] = useState<Record<Layer, number>>({
    base: 0,
    eyebrows: 0,
    eyes: 0,
    cheeks: 0,
    mouth: 0,
  });

  // ===== Setup Three.js =====
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // --- Scene ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // --- Camera (front view, leve tilt pra cima como na referência) ---
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 6);
    camera.lookAt(0, 0.2, 0);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    // --- Material do corpo: flatShading pra ver as facetas low-poly ---
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.92,
      metalness: 0,
      flatShading: true,
    });

    // --- Corpo: icosaedro low-poly (detail=1 → ~80 faces visíveis) ---
    const bodyGeometry = new THREE.IcosahedronGeometry(1.05, 1);
    bodyGeometry.scale(0.95, 1.15, 0.95);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    scene.add(body);

    // --- Orelhas: cones de 4 lados (facetas pontudas e visíveis) ---
    const earGeometry = new THREE.ConeGeometry(0.32, 0.75, 4, 1);
    const earL = new THREE.Mesh(earGeometry, bodyMaterial);
    earL.position.set(-0.55, 1.4, 0.05);
    earL.rotation.z = 0.14;
    earL.rotation.y = Math.PI / 4; // gira a base pra mostrar uma aresta de frente
    scene.add(earL);

    const earR = new THREE.Mesh(earGeometry, bodyMaterial);
    earR.position.set(0.55, 1.4, 0.05);
    earR.rotation.z = -0.14;
    earR.rotation.y = Math.PI / 4;
    scene.add(earR);

    // --- Plano do rosto (canvas texture) — colado à frente do corpo ---
    const faceCanvas = document.createElement("canvas");
    faceCanvas.width = FACE_CANVAS_SIZE;
    faceCanvas.height = FACE_CANVAS_SIZE;
    faceCanvasRef.current = faceCanvas;

    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.colorSpace = THREE.SRGBColorSpace;
    faceTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textureRef.current = faceTexture;

    const faceGeometry = new THREE.PlaneGeometry(1.6, 1.6);
    const faceMaterial = new THREE.MeshBasicMaterial({
      map: faceTexture,
      transparent: true,
      depthWrite: false,
    });
    const facePlane = new THREE.Mesh(faceGeometry, faceMaterial);
    facePlane.position.set(0, 0.15, 0.96);
    scene.add(facePlane);

    // --- Iluminação underlight dramática (warm spotlight de baixo) ---
    const underlight = new THREE.SpotLight(
      0xffd28a,
      45,             // intensity alta
      8,              // distance
      Math.PI / 3,    // angle (60°)
      0.5,            // penumbra suave
      1.2             // decay físico
    );
    underlight.position.set(0, -2.0, 1.6);
    underlight.target.position.set(0, 0.3, 0);
    scene.add(underlight);
    scene.add(underlight.target);

    // Rim frio no topo pra produzir o gradiente roxo da referência
    const rim = new THREE.PointLight(0x4a5cc0, 3, 8, 1.8);
    rim.position.set(0, 2.8, 1.4);
    scene.add(rim);

    // --- Controles (rotação suave) ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 9;
    controls.minPolarAngle = Math.PI * 0.25;
    controls.maxPolarAngle = Math.PI * 0.7;
    controls.target.set(0, 0.2, 0);

    // --- Loop ---
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Resize ---
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      faceGeometry.dispose();
      faceMaterial.dispose();
      faceTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // ===== Composição do rosto (canvas 2D) =====
  const updateFace = useCallback(async () => {
    const canvas = faceCanvasRef.current;
    const tex = textureRef.current;
    if (!canvas || !tex) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const layer of LAYER_ORDER) {
      const idx = selection[layer];
      const path = FACE_ASSETS[layer]?.[idx];
      if (!path) continue;

      let img = imageCacheRef.current.get(path);
      if (img === undefined) {
        const loaded = await loadImage(path);
        // cacheia mesmo se falhou (com null sentinela) pra não retentar toda hora
        imageCacheRef.current.set(path, loaded as unknown as HTMLImageElement);
        img = loaded ?? undefined;
      }
      if (img) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        drawFallback(ctx, layer, idx);
      }
    }

    tex.needsUpdate = true;
  }, [selection]);

  useEffect(() => {
    updateFace();
  }, [updateFace]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="px-4 py-3 flex items-center gap-3 border-b border-white/5 shrink-0">
        <Link
          href="/profile"
          className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none">
            IDO 3D
          </p>
          <p className="text-sm font-black tracking-tight mt-0.5">
            Atelier de Personagem
          </p>
        </div>
        <Sparkles className="w-5 h-5 text-amber-300" />
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <div ref={mountRef} className="flex-1 min-h-[55vh] md:min-h-0" />

        <aside className="md:w-80 p-4 border-t md:border-t-0 md:border-l border-white/5 overflow-y-auto space-y-5 bg-zinc-950/60 backdrop-blur">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Customização facial
          </p>

          {LAYER_ORDER.map((layer) => (
            <div key={layer}>
              <p className="text-[11px] font-black uppercase tracking-wider text-zinc-300 mb-2">
                {LAYER_LABELS[layer]}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {FACE_ASSETS[layer].map((_, i) => {
                  const active = selection[layer] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelection((s) => ({ ...s, [layer]: i }))}
                      className={`h-12 rounded-xl border text-xs font-black transition ${
                        active
                          ? "bg-white text-black border-white shadow-lg shadow-white/10"
                          : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <p className="text-[10px] text-zinc-600 leading-relaxed pt-2 border-t border-white/5">
            Arraste o personagem pra rotacionar. As variações de rosto puxam de{" "}
            <code className="text-zinc-400">/public/assets/face/</code>; coloque
            PNGs transparentes ({FACE_CANVAS_SIZE}×{FACE_CANVAS_SIZE}) nos
            nomes esperados pra substituir os placeholders.
          </p>
        </aside>
      </div>
    </div>
  );
}

// ============================================================
// Loader de imagem (resolve null em erro pra não quebrar o fluxo)
// ============================================================
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// ============================================================
// Fallback procedural (caso o PNG não esteja em /public ainda)
// Desenha primitivas no canvas pra você já ver algo no IDO.
// ============================================================
function drawFallback(ctx: CanvasRenderingContext2D, layer: Layer, idx: number) {
  const S = FACE_CANVAS_SIZE;
  const cx = S / 2;
  ctx.save();

  switch (layer) {
    case "base":
      // base = nada (o corpo já é a base)
      break;

    case "eyebrows": {
      ctx.strokeStyle = "#0a0a0a";
      ctx.lineCap = "round";
      ctx.lineWidth = 18;
      const y = S * 0.32;
      if (idx === 0) {
        // sobrancelhas retas e neutras
        ctx.beginPath();
        ctx.moveTo(cx - 130, y);
        ctx.lineTo(cx - 55, y);
        ctx.moveTo(cx + 55, y);
        ctx.lineTo(cx + 130, y);
        ctx.stroke();
      } else {
        // sobrancelhas levantadas
        ctx.beginPath();
        ctx.moveTo(cx - 130, y + 14);
        ctx.lineTo(cx - 55, y - 10);
        ctx.moveTo(cx + 55, y - 10);
        ctx.lineTo(cx + 130, y + 14);
        ctx.stroke();
      }
      break;
    }

    case "eyes": {
      ctx.fillStyle = "#0a0a0a";
      const eyeY = S * 0.46;
      const dx = 95;
      if (idx === 0) {
        // pontinhos
        ctx.beginPath();
        ctx.arc(cx - dx, eyeY, 18, 0, Math.PI * 2);
        ctx.arc(cx + dx, eyeY, 18, 0, Math.PI * 2);
        ctx.fill();
      } else if (idx === 1) {
        // olhos arregalados
        ctx.beginPath();
        ctx.ellipse(cx - dx, eyeY, 28, 32, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + dx, eyeY, 28, 32, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // olhos fechados (^ ^)
        ctx.strokeStyle = "#0a0a0a";
        ctx.lineCap = "round";
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(cx - dx - 28, eyeY + 8);
        ctx.quadraticCurveTo(cx - dx, eyeY - 20, cx - dx + 28, eyeY + 8);
        ctx.moveTo(cx + dx - 28, eyeY + 8);
        ctx.quadraticCurveTo(cx + dx, eyeY - 20, cx + dx + 28, eyeY + 8);
        ctx.stroke();
      }
      break;
    }

    case "cheeks": {
      ctx.fillStyle = idx === 0 ? "rgba(255,160,160,0.55)" : "rgba(255,200,80,0.45)";
      const cheekY = S * 0.56;
      const dx = 140;
      ctx.beginPath();
      ctx.ellipse(cx - dx, cheekY, 36, 20, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + dx, cheekY, 36, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "mouth": {
      ctx.strokeStyle = "#0a0a0a";
      ctx.lineCap = "round";
      ctx.lineWidth = 12;
      const mY = S * 0.66;
      ctx.beginPath();
      if (idx === 0) {
        // boquinha 〜
        ctx.moveTo(cx - 40, mY);
        ctx.quadraticCurveTo(cx - 20, mY - 18, cx, mY);
        ctx.quadraticCurveTo(cx + 20, mY + 18, cx + 40, mY);
      } else if (idx === 1) {
        // sorrisão
        ctx.moveTo(cx - 60, mY - 10);
        ctx.quadraticCurveTo(cx, mY + 35, cx + 60, mY - 10);
      } else {
        // boca aberta (O)
        ctx.fillStyle = "#0a0a0a";
        ctx.beginPath();
        ctx.ellipse(cx, mY + 5, 22, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}
