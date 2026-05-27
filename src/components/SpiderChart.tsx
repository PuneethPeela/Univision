"use client";

import { useRef, useEffect } from 'react';

interface DataSet {
  label: string;
  values: number[]; // 0-100 per axis
  color: string;
  fillAlpha?: number;
}

interface SpiderChartProps {
  axes: string[];
  datasets: DataSet[];
  size?: number;
}

export default function SpiderChart({ axes, datasets, size = 280 }: SpiderChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 40;
    const n = axes.length;
    const angleStep = (Math.PI * 2) / n;

    const getPoint = (i: number, r: number) => ({
      x: cx + r * Math.cos(i * angleStep - Math.PI / 2),
      y: cy + r * Math.sin(i * angleStep - Math.PI / 2),
    });

    ctx.clearRect(0, 0, size, size);

    // Grid rings
    for (let ring = 1; ring <= 5; ring++) {
      const r = (radius * ring) / 5;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const p = getPoint(i % n, r);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axis lines + labels
    for (let i = 0; i < n; i++) {
      const p = getPoint(i, radius);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      const lp = getPoint(i, radius + 18);
      ctx.fillStyle = '#9395a5';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axes[i], lp.x, lp.y);
    }

    // Datasets
    datasets.forEach((ds) => {
      ctx.beginPath();
      ds.values.forEach((v, i) => {
        const r = (v / 100) * radius;
        const p = getPoint(i, r);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();

      // Fill
      ctx.fillStyle = ds.color.replace(')', `, ${ds.fillAlpha ?? 0.15})`).replace('rgb', 'rgba');
      ctx.fill();

      // Stroke
      ctx.strokeStyle = ds.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dots
      ds.values.forEach((v, i) => {
        const r = (v / 100) * radius;
        const p = getPoint(i, r);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = ds.color;
        ctx.fill();
      });
    });
  }, [axes, datasets, size]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Spider chart comparing ${datasets.map((d) => d.label).join(', ')}`}
      >
        <div className="sr-only">
          <p>Comparison data breakdown:</p>
          <ul>
            {datasets.map((ds) => (
              <li key={ds.label}>
                {ds.label}: {axes.map((axis, idx) => `${axis}: ${ds.values[idx] || 0}`).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      </canvas>
      {/* Legend */}
      <div className="flex gap-4 mt-3">
        {datasets.map((ds) => (
          <div key={ds.label} className="flex items-center gap-1.5 text-xs text-muted">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: ds.color }}
              aria-hidden="true"
            />
            {ds.label}
          </div>
        ))}
      </div>
    </div>
  );
}
