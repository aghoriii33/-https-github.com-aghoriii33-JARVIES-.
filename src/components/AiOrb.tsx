import { useEffect, useRef } from "react";

interface AiOrbProps {
  state: "stable" | "listening" | "thinking";
  className?: string;
  size?: number;
}

export default function AiOrb({ state, className = "" }: AiOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      console.warn("WebGL not supported by this browser.");
      return;
    }

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Dynamic FS Source that adapts parameters based on state
    const fsSource = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_pulse_speed;
      uniform float u_noise_amp;

      void main() {
        vec2 uv = (v_texCoord - 0.5) * 2.0;
        float d = length(uv);
        
        // Dynamic Core glow
        float glowFactor = 0.045 / (d * d + 0.045);
        
        // Custom Pulsing based on speed uniform
        float pulse = sin(u_time * u_pulse_speed) * 0.12 + 0.88;
        d *= pulse;
        
        // Aura Plasma fluid noise
        float noise = sin(uv.x * 12.0 + u_time * 2.2) * cos(uv.y * 12.0 - u_time * 1.8) * u_noise_amp;
        float aura = smoothstep(0.42, 0.46, d + noise);
        
        // Cyberpunk colors: Cyan-electric blue (#00d2ff) to Deep Purple/Indigo (#6e208c)
        vec3 blue = vec3(0.0, 0.82, 1.0);
        vec3 purple = vec3(0.43, 0.12, 0.55);
        
        // Tweak mix bias depending on time
        vec3 color = mix(blue, purple, uv.y + 0.5 + sin(u_time * 1.5) * 0.4);
        
        // Composite glow with aura
        vec3 finalColor = color * glowFactor * (1.0 - aura);
        
        // Super bright hyper-core center
        float centerGlow = smoothstep(0.12, 0.0, d);
        finalColor += vec3(0.95, 0.98, 1.0) * centerGlow * 0.95;
        
        gl_FragColor = vec4(finalColor, finalColor.r * 0.3 + finalColor.b * 0.4 + centerGlow * 0.2);
      }
    `;

    function compileShader(source: string, type: number): WebGLShader | null {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error("Shader compiles failed:", gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link failed:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uPulseSpeed = gl.getUniformLocation(program, "u_pulse_speed");
    const uNoiseAmp = gl.getUniformLocation(program, "u_noise_amp");

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = 1.0 - (e.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationId: number;
    const startTime = Date.now();

    // Responsive sizing
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        const width = parent.clientWidth || 300;
        const height = parent.clientHeight || 300;
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          gl.viewport(0, 0, canvas.width, canvas.height);
        }
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    resize();

    const render = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      // Determine parameter sets based on component states
      let pulseSpeed = 1.8;
      let noiseAmp = 0.16;

      const current = stateRef.current;
      if (current === "listening") {
        pulseSpeed = 4.2;
        noiseAmp = 0.28;
      } else if (current === "thinking") {
        pulseSpeed = 8.5;
        noiseAmp = 0.45;
      }

      gl.useProgram(program);
      if (uTime) gl.uniform1f(uTime, elapsed);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      if (uPulseSpeed) gl.uniform1f(uPulseSpeed, pulseSpeed);
      if (uNoiseAmp) gl.uniform1f(uNoiseAmp, noiseAmp);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center border border-white/10 shadow-[0_0_80px_rgba(0,210,255,0.25)] ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block absolute inset-0 pointer-events-auto"
      />
      {/* Decorative overlaid glowing glass ring */}
      <div className="absolute inset-0 border border-white/5 rounded-full scale-105 pointer-events-none" />
      <div className="absolute inset-0 border border-cyan-400/10 rounded-full scale-[1.12] animate-[spin_20s_linear_infinite] pointer-events-none" />
      <div className="absolute inset-0 border border-purple-500/10 rounded-full scale-[1.25] animate-[spin_30s_linear_infinite_reverse] pointer-events-none" />
    </div>
  );
}
