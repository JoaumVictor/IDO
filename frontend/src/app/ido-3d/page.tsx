"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const FACE_ASSETS: Record<Layer, string[]> = {
  base: ["/assets/face/base_01.png"],
  eyebrows: ["/assets/face/eyebrows_01.png", "/assets/face/eyebrows_02.png"],
  eyes: [
    "/assets/face/eyes_01.png",
    "/assets/face/eyes_02.png",
    "/assets/face/eyes_03.png",
  ],
  cheeks: ["/assets/face/cheeks_01.png", "/assets/face/cheeks_02.png"],
  mouth: [
    "/assets/face/mouth_01.png",
    "/assets/face/mouth_02.png",
    "/assets/face/mouth_03.png",
  ],
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
    scene.background = new THREE.Color(0x101820);

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

    // --- Material do corpo: smooth shading pra bevel gradiente suave ---
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.92,
      metalness: 0,
    });

    // --- Silhueta completa do IDO (corpo + orelhas em um único Shape) ---
    const shape = buildIdoShape();
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.75,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 10, // bordas bem arredondadas pra capturar luz
      curveSegments: 32, // silhueta suave
    };
    const bodyGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bodyGeometry.center();
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    scene.add(body);

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
    // depth/2 + bevelThickness + tiny offset
    facePlane.position.set(0, 0.2, 0.49);
    scene.add(facePlane);

    // --- Iluminação underlight PURA (única fonte) ---
    const underlight = new THREE.SpotLight(
      0xffd28a,
      80, // intensity alta — é a única luz da cena
      12, // distance
      Math.PI / 2.6, // angle (~70°)
      0.5, // penumbra suave
      1.3, // decay físico
    );
    underlight.position.set(0, -2.4, 2.2);
    underlight.target.position.set(0, 0.3, 0);
    scene.add(underlight);
    scene.add(underlight.target);

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
    <div className="min-h-screen bg-canvas text-white flex flex-col">
      <header className="px-5 py-4 flex items-center gap-3 shrink-0" style={{ borderBottom: "1px solid #243240" }}>
        <Link
          href="/profile"
          className="neo-raised-xs w-11 h-11 rounded-full flex items-center justify-center text-text-secondary hover:text-accent transition"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </Link>
        <div className="flex-1">
          <p className="font-display text-[10px] font-black uppercase tracking-widest text-text-muted leading-none">
            IDO 3D
          </p>
          <p className="font-display text-sm font-black tracking-tight mt-1">
            Atelier de Personagem
          </p>
        </div>
        <div className="neo-raised-xs w-11 h-11 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent" strokeWidth={2.5} />
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <div ref={mountRef} className="flex-1 min-h-[55vh] md:min-h-0" />

        <aside className="md:w-80 p-5 overflow-y-auto space-y-6 bg-canvas" style={{ borderLeft: "1px solid #243240" }}>
          <p className="font-display text-[10px] font-black uppercase tracking-widest text-text-muted">
            Customização facial
          </p>

          {LAYER_ORDER.map((layer) => (
            <div key={layer}>
              <p className="font-display text-[11px] font-black uppercase tracking-widest text-white mb-3">
                {LAYER_LABELS[layer]}
              </p>
              <div className="grid grid-cols-4 gap-3">
                {FACE_ASSETS[layer].map((_, i) => {
                  const active = selection[layer] === i;
                  return (
                    <button
                      key={i}
                      onClick={() =>
                        setSelection((s) => ({ ...s, [layer]: i }))
                      }
                      className={`h-12 rounded-2xl font-display text-xs font-black transition ${
                        active
                          ? "bg-accent text-canvas neo-glow-accent"
                          : "neo-raised-xs text-text-secondary hover:text-accent"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <p className="text-[10px] text-text-muted leading-relaxed pt-4" style={{ borderTop: "1px solid #243240" }}>
            Arraste o personagem pra rotacionar. As variações de rosto puxam de{" "}
            <code className="text-accent">/public/assets/face/</code>; coloque
            PNGs transparentes ({FACE_CANVAS_SIZE}×{FACE_CANVAS_SIZE}) nos nomes
            esperados pra substituir os placeholders.
          </p>
        </aside>
      </div>
    </div>
  );
}

// ============================================================
// Geometria: silhueta completa do IDO (corpo arredondado + cat ears)
// Único Shape contínuo — assim o extrude une tudo com bevels suaves.
// ============================================================
function buildIdoShape(): THREE.Shape {
  const s = new THREE.Shape();

  // Base inferior arredondada (sutil curva no chão)
  s.moveTo(-1.0, -1.35);
  s.quadraticCurveTo(0, -1.5, 1.0, -1.35);

  // Lateral direita subindo (cintura suave do corpo)
  s.bezierCurveTo(1.1, -0.7, 0.95, 0.2, 0.85, 0.7);

  // Ombro/transição pra cabeça
  s.bezierCurveTo(0.8, 0.85, 0.7, 0.95, 0.58, 1.0);

  // Subida pra ponta da orelha direita
  s.lineTo(0.78, 1.6);

  // Vale entre as orelhas (suave, mais alto no centro)
  s.lineTo(0.32, 0.92);
  s.quadraticCurveTo(0, 1.05, -0.32, 0.92);

  // Ponta da orelha esquerda
  s.lineTo(-0.78, 1.6);

  // Descida pelo lado esquerdo
  s.lineTo(-0.58, 1.0);
  s.bezierCurveTo(-0.7, 0.95, -0.8, 0.85, -0.85, 0.7);
  s.bezierCurveTo(-0.95, 0.2, -1.1, -0.7, -1.0, -1.35);

  return s;
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
function drawFallback(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  idx: number,
) {
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
      ctx.fillStyle =
        idx === 0 ? "rgba(255,160,160,0.55)" : "rgba(255,200,80,0.45)";
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
